const OpenAI = require( "openai" );
const pino = require( "pino" );
const pretty = require( "pino-pretty" );
const pinoStream = pretty({ colorize: true, ignore: "pid,hostname" });
const logger = pino({ base: false }, pinoStream );

class AIRouter
{
	constructor ( providers )
	{
		this.providers = providers;
	}

	createClient ( provider )
	{
		return new OpenAI({
			apiKey: provider.apiKey,
			baseURL: provider.apiUrl,
			timeout: 60000,
		});
	}

	async chatCompletion ( messages, options = {}, stream = false )
	{
		const { stream: streamOption, tools, ...restOptions } = options;
		const isStreaming = stream || streamOption;

		logger.info( `Starting chatCompletion with ${this.providers.length} providers (streaming: ${isStreaming})` );
		let lastError;

		for ( const provider of this.providers )
		{
			try
			{
				logger.info( `Attempting with provider: ${provider.name}` );
				const client = this.createClient( provider );

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
							const reasoning = chunk.choices[0]?.delta?.reasoning;
							const tool_calls_delta = chunk.choices[0]?.delta?.tool_calls;
							if ( content !== null )
							{
								chunk.content = content
							}
							if ( reasoning !== null )
							{
								chunk.reasoning = reasoning
							}
							if ( tool_calls_delta !== null )
							{
								chunk.tool_calls_delta = tool_calls_delta;
							}
							yield chunk;
						}
					})();
				}
				else
				{
					const response = await client.chat.completions.create( params );
					const content = response.choices[0]?.message?.content;
					const reasoning = response.choices[0]?.message?.reasoning;
					const tool_calls = response.choices[0]?.message?.tool_calls
					if ( content !== null )
					{
						response.content = content
					}
					if ( reasoning !== null )
					{
						response.reasoning = reasoning
					}
					if ( tool_calls !== null )
					{
						response.tool_calls = tool_calls
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

	async chatCompletionWithResponse ( messages, options = {})
	{
		const { stream, tools, ...restOptions } = options;
		const isStreaming = stream;

		logger.info( `Starting chatCompletionWithResponse with ${this.providers.length} providers (streaming: ${isStreaming})` );
		let lastError;

		for ( const provider of this.providers )
		{
			try
			{
				logger.info( `Attempting with provider: ${provider.name}` );
				const client = this.createClient( provider );

				const params = {
					model: provider.model,
					messages,
					...tools && tools.length > 0 ? { tools } : {},
					stream: isStreaming,
					...restOptions
				};

				const { data, response: rawResponse } = await client.chat.completions.create( params ).withResponse();
				return { data, response: rawResponse }
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

	async getModels ()
	{
		const models = [];
		for ( const provider of this.providers )
		{
			if ( !provider.apiKey )
			{
				logger.warn( `Skipping provider ${provider.name} due to missing API key` );
				continue;
			}
			try
			{
				logger.info( `Fetching models for provider: ${provider.name}` );
				const client = this.createClient( provider );
				const listResponse = await client.models.list();
				const modelList = Array.isArray( listResponse.data ) ? listResponse.data : listResponse.body || [];
				const model = modelList.find( m => { return m.id === provider.model || m.id === `models/${provider.model}` });
				if ( model )
				{
					models.push( model );
				}
				else
				{
					logger.warn( `Model ${provider.model} not found in provider ${provider.name}` );
				}
			}
			catch ( error )
			{
				logger.error( `Failed to list models for provider ${provider.name}: ${error.message}` );
			}
		}
		return models;
	}
}

module.exports = AIRouter;