const { ChatOpenAI } = require( "@langchain/openai" );
const pino = require( "pino" );
const logger = pino({
	base: false,
});

/**
 * Wraps an async iterable stream, aborting if no chunk is received within inactivityMs.
 * @param {AsyncIterable} stream - The original stream (e.g., from llm.stream()).
 * @param {number} inactivityMs - Max allowed ms between chunks.
 * @returns {AsyncIterable} A wrapped async iterable with inter-chunk timeout.
 */
async function* streamWithInterChunkTimeout ( stream, inactivityMs = 5000 )
{
	let timeoutId;
	let abort = false;

	const resetTimer = () =>
	{
		 if ( timeoutId ) clearTimeout( timeoutId );
		 timeoutId = setTimeout( () => { abort = true; }, inactivityMs );
	};

	try
	{
		 resetTimer();
		 for await ( const chunk of stream )
		{
			  if ( abort ) throw new Error( `Stream aborted: inactivity timeout (${inactivityMs}ms)` );
			  resetTimer();
			  yield chunk;
		 }
	}
	finally
	{
		 clearTimeout( timeoutId );
	}
}

class AIRouter
{
	constructor ( providers )
	{
		this.providers = providers;
	}

	async chatCompletion ( messages, options = {}, stream = false )
	{
		const { stream: streamOption, ...restOptions } = options;
		const isStreaming = stream || streamOption;

		logger.info( `Starting chatCompletion with ${this.providers.length} providers (streaming: ${isStreaming})` );
		let lastError;

		for ( const provider of this.providers )
		{
			try
			{
				logger.info( `Attempting with provider: ${provider.name}` );
				const llm = new ChatOpenAI({
					apiKey: provider.apiKey,
					model: provider.model,
					configuration: {
						baseURL: provider.apiUrl,
					},
					...restOptions,
				});

				if ( isStreaming )
				{
					const stream = await llm.stream( messages, { timeout: 300000 });
					// Wrap the stream with the custom inter-chunk timeout logic.[3, 4]
					return streamWithInterChunkTimeout( stream, 10000 );
				}
				else
				{
					const response = await llm.invoke( messages, { timeout: 300000 });
					return response.content;
				}
			}
			catch ( error )
			{
				lastError = error;
				logger.error( `Failed with ${provider.name}:${error.message}` );
				// Continue to next provider
			}
		}
		throw new Error( `All providers failed. Last error: ${lastError.message}` );
	}
}

module.exports = AIRouter;
