const OpenAI = require( "openai" );
const pino = require( "pino" );
const pretty = require( "pino-pretty" );
const pinoStream = pretty({ colorize: true, ignore: "pid,hostname" });
const logger = pino({ base: false }, pinoStream );

const CircuitBreaker = require( "opossum" );

class AIRouter
{
	constructor ( providers )
	{
		this.providers = this._initializeProviders( providers );

		const defaultCircuitOptions = {
			timeout: 300000,
			errorThresholdPercentage: 50,
			resetTimeout: 9000000,
		};
		for ( const provider of this.providers )
		{
			const circuitOptions = Object.assign({}, defaultCircuitOptions, provider.circuitOptions || {});

			const action = async ({ params, withResponse }) =>
			{
				const client = this.createClient( provider );

				if ( withResponse )
				{
					return client.chat.completions.create( params ).withResponse();
				}
				return client.chat.completions.create( params );
			};

			const breaker = new CircuitBreaker( action, circuitOptions );

			// simple logging for breaker transitions
			breaker.on( "open", ( ) =>
			{
				return logger.warn( `Circuit open for provider: ${provider.name}` )
			});
			breaker.on( "halfOpen", () => { return logger.info( `Circuit half-open for provider: ${provider.name}` ) });
			breaker.on( "close", () => { return logger.info( `Circuit closed for provider: ${provider.name}` ) });
			breaker.on( "fallback", () => { return logger.warn( `Fallback triggered for provider: ${provider.name}` ) });
			breaker.on( "failure", ( err ) =>
			{
				logger.error({ provider: provider.name, event: "failure", error: err.message }, "Breaker failure event" );
			 });
			// optional fallback: we throw so the router will continue to next provider
			breaker.fallback( ( err ) =>
			{
				throw new Error( `Circuit open for ${provider.name}` );
			});

			provider.breaker = breaker;
		}
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
				const params = {
					messages,
					...tools && tools.length > 0 ? { tools } : {},
					stream: isStreaming,
					...restOptions,
					model: provider.model
				};
				const result = await provider.breaker.fire({ params, withResponse: false });
				logger.info( `Successful with provider: ${provider.name}` );
				if ( isStreaming )
				{
					const responseStream = result;
					return ( async function* ()
					{
						for await ( const chunk of responseStream )
						{
							try
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
							catch ( error )
							{
								console.log( error );
							}
						}
					})();
				}
				else
				{
					const response = result;
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
		throw new Error( `All providers failed. Last error: ${lastError?.message || "unknown"}` );
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

				const params = {
					messages,
					...tools && tools.length > 0 ? { tools } : {},
					stream: isStreaming,
					...restOptions,
					model: provider.model
				};

				const { data, response: rawResponse } = await provider.breaker.fire({ params, withResponse: true });
				logger.info( `Successful with provider: ${provider.name}` );
				return { data, response: rawResponse }
			}
			catch ( error )
			{
				lastError = error;
				logger.error( `Failed with ${provider.name}: ${error.message}` );
				// Continue to next provider
			}
		}
		throw new Error( `All providers failed. Last error: ${lastError?.message || "unknown"}` );
	}

	async getModels ()
	{
		const models = [];
		for ( const provider of this.providers )
		{
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

	async checkProvidersStatus ()
	{
		const healthCheckPromises = this.providers.map( async ( provider ) =>
		{
			const maskApiKey = ( apiKey ) =>
			{
				if ( !apiKey || typeof apiKey !== "string" || apiKey.length < 8 )
				{
					return "Invalid API Key";
				}
				return `${apiKey.substring( 0, 4 )}...${apiKey.substring( apiKey.length - 4 )}`;
			};

			try
			{
				const client = this.createClient( provider );
				await client.chat.completions.create({
					messages: [{ role: "user", content: "test" }],
					model: provider.model,
					max_tokens: 1,
				});
				return {
					name: provider.name,
					status: "ok",
					apiKey: maskApiKey( provider.apiKey ),
				};
			}
			catch ( error )
			{
				return {
					name: provider.name,
					status: "error",
					reason: error.message,
					apiKey: maskApiKey( provider.apiKey ),
				};
			}
		});

		const results = await Promise.allSettled( healthCheckPromises );
		const processedResults = results.map( result =>
		{
			if ( result.status === "fulfilled" )
			{
				return result.value;
			}
			return {
				name: "unknown",
				status: "error",
				reason: result.reason.message,
				apiKey: "N/A",
			};
		});

		return processedResults.sort( ( a, b ) =>
		{
			if ( a.status === "ok" && b.status !== "ok" ) return -1;
			if ( a.status !== "ok" && b.status === "ok" ) return 1;
			return 0;
		});
	}

	_initializeProviders ( providers )
	{
		const allProviders = [];
		for ( const p of providers )
		{
			if ( Array.isArray( p.apiKey ) )
			{
				p.apiKey.forEach( ( key, i ) =>
				{
					if ( key )
					{
						allProviders.push({
							...p,
							apiKey: key,
							name: `${p.name}_${i + 1}`
						});
					}
				});
			}
			else if ( p.apiKey )
			{
				allProviders.push( p );
			}
		}
		return allProviders;
	}
}

module.exports = AIRouter;