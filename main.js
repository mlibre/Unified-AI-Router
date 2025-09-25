const { ChatOpenAI } = require( "@langchain/openai" );
const pino = require( "pino" );
const pretty = require( "pino-pretty" );
const stream = pretty({ colorize: true, ignore: "pid,hostname" });
const logger = pino({ base: false }, stream );

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
		const { stream: streamOption, tools, model, ...restOptions } = options;
		const isStreaming = stream || streamOption;

		logger.info( `Starting chatCompletion with ${this.providers.length} providers (streaming: ${isStreaming})` );
		let lastError;

		for ( const provider of this.providers )
		{
			try
			{
				logger.info( `Attempting with provider: ${provider.name}` );
				let llm = new ChatOpenAI({
					apiKey: provider.apiKey,
					model: provider.model,
					configuration: {
						baseURL: provider.apiUrl,
					},
					...restOptions,
				});

				if ( tools && tools.length > 0 )
				{
					llm = llm.bindTools( tools );
				}

				if ( isStreaming )
				{
					const stream = await llm.stream( messages );
					return stream;
				}
				else
				{
					const response = await llm.invoke( messages, { timeout: 30000 });
					return response;
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
