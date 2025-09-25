const { ChatOpenAI } = require( "@langchain/openai" );
const pino = require( "pino" );
const pretty = require( "pino-pretty" );
const stream = pretty({ colorize: true, ignore: "pid,hostname" });
const logger = pino({ base: false }, stream );

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
					const response = await llm.invoke( messages, { timeout: 60000 });
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
