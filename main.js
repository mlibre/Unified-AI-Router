const { ChatOpenAI } = require( "@langchain/openai" );
const pino = require( "pino" );
const logger = pino({
	base: false,
});

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
				const response = await this.callProvider( provider, messages, restOptions, isStreaming );
				return response;
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

	async callProvider ( provider, messages, options, stream = false )
	{
		const llm = new ChatOpenAI({
			apiKey: provider.apiKey,
			model: provider.model,
			configuration: {
				baseURL: provider.apiUrl,
			},
			...options,
		});

		if ( stream )
		{
			return await llm.stream( messages, { timeout: 300000 });
		}
		else
		{
			const response = await llm.invoke( messages, { timeout: 300000 });
			return response.content;
		}
	}
}

module.exports = AIRouter;