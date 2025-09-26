const OpenAI = require( "openai" );
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
				const client = new OpenAI({
					apiKey: provider.apiKey,
					baseURL: provider.apiUrl,
					timeout: 60000,
				});

				const params = {
					model: provider.model,
					messages,
					...tools && tools.length > 0 ? { tools } : {},
					stream: isStreaming,
					...restOptions
				};

				if ( isStreaming )
				{
					const responseStream = await client.chat.completions.create( params );
					return ( async function* ()
					{
						for await ( const chunk of responseStream )
						{
							const content = chunk.choices[0]?.delta?.content;
							const reasoning = chunk.choices[0]?.delta?.reasoning
							if ( content != undefined )
							{
								chunk.content = content
							}
							if ( reasoning != undefined )
							{
								chunk.reasoning = reasoning
							}
							yield chunk;
						}
					})();
				}
				else
				{
					const response = await client.chat.completions.create( params );
					const content = response.choices[0]?.message?.content;
					const reasoning = response.choices[0]?.message?.reasoning
					if ( content != undefined )
					{
						response.content = content
					}
					if ( reasoning != undefined )
					{
						response.reasoning = reasoning
					}
					return response;
				}
			}
			catch ( error )
			{
				lastError = error;
				logger.error( `Failed with ${provider.name}: ${error.message}` );
				// Continue to next provider
			}
		}
		throw new Error( `All providers failed. Last error: ${lastError.message}` );
	}
}

module.exports = AIRouter;