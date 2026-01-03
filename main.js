const OpenAI = require( "openai" );
const pino = require( "pino" );
const pretty = require( "pino-pretty" );
const CircuitBreaker = require( "opossum" );

const logger = pino({ base: false }, pretty({ colorize: true, ignore: "pid,hostname" }) );

class AIRouter
{
	constructor ( providers )
	{
		this.providers = this._initializeProviders( providers );
		this._setupCircuitBreakers();
	}

	_setupCircuitBreakers ()
	{
		const defaultCircuitOptions = {
			timeout: 300000,
			errorThresholdPercentage: 50,
			resetTimeout: 9000000
		};

		for ( const provider of this.providers )
		{
			// Chat Completions action
			const chatAction = async ({ params, withResponse }) =>
			{
				const client = this.createClient( provider );
				if ( withResponse )
				{
					return client.chat.completions.create( params ).withResponse();
				}
				return client.chat.completions.create( params );
			};

			// Responses API action
			const responsesAction = async ({ params, withResponse }) =>
			{
				const client = this.createClient( provider );
				if ( withResponse )
				{
					return client.responses.create( params ).withResponse();
				}
				return client.responses.create( params );
			};

			const action = async ({ params, withResponse, isResponses = false }) =>
			{
				if ( isResponses )
				{
					return responsesAction({ params, withResponse });
				}
				return chatAction({ params, withResponse });
			};

			const options = { ...defaultCircuitOptions, ...provider.circuitOptions };
			const breaker = new CircuitBreaker( action, options );

			// Expanded logging for readability
			breaker.on( "open", () =>
			{
				logger.info( `Circuit open for ${provider.name}` );
			});
			breaker.on( "halfOpen", () =>
			{
				logger.info( `Circuit half-open for ${provider.name}` );
			});
			breaker.on( "close", () =>
			{
				logger.info( `Circuit closed for ${provider.name}` );
			});
			breaker.on( "fallback", () =>
			{
				logger.warn( `Fallback triggered for ${provider.name}` );
			});
			breaker.on( "failure", ( err ) =>
			{
				logger.error({ provider: provider.name, error: err.message, metadata: err?.error?.metadata }, "Breaker failure" );
			});

			breaker.fallback( () =>
			{
				this._reorderProvidersOnFailure( provider );
				throw new Error( `Circuit open for ${provider.name}` );
			});

			provider.breaker = breaker;
		}
	}

	/**
	 * Reorder providers by moving a failed provider to the end of the list
	 * @param {Object} failedProvider - The provider that failed
	 */
	_reorderProvidersOnFailure ( failedProvider )
	{
		const currentIndex = this.providers.indexOf( failedProvider );
		if ( currentIndex !== -1 && currentIndex !== this.providers.length - 1 )
		{
			// Remove from current position and add to end
			this.providers.splice( currentIndex, 1 );
			this.providers.push( failedProvider );
			logger.info( `Moved failed provider ${failedProvider.name} to end of list` );
		}
	}

	createClient ( provider )
	{
		return new OpenAI({
			apiKey: provider.apiKey,
			baseURL: provider.apiUrl,
			timeout: 60000
		});
	}

	async responses ( input, options = {})
	{
		const { stream, tools, ...restOptions } = options;
		const isStreaming = stream;

		for ( const provider of this.providers )
		{
			try
			{
				const params = {
					input,
					...restOptions,
					model: provider.model,
					stream: isStreaming
				};

				if ( tools && tools.length > 0 )
				{
					params.tools = tools;
				}

				const result = await provider.breaker.fire({ params, withResponse: false, isResponses: true });

				if ( isStreaming )
				{
					return ( async function* ()
					{
						for await ( const chunk of result )
						{
							yield chunk;
						}
					})();
				}

				return result;
			}
			catch ( error )
			{
				logger.error( `Failed with ${provider.name}: ${error.message}` );
			}
		}
		throw new Error( "All providers failed" );
	}

	async responsesWithResponse ( input, options = {})
	{
		const { stream, tools, ...restOptions } = options;
		const isStreaming = stream;

		for ( const provider of this.providers )
		{
			try
			{
				const params = {
					input,
					...restOptions,
					model: provider.model,
					stream: isStreaming
				};

				if ( tools && tools.length > 0 )
				{
					params.tools = tools;
				}

				return await provider.breaker.fire({ params, withResponse: true, isResponses: true });
			}
			catch ( error )
			{
				logger.error( `Failed with ${provider.name}: ${error.message}` );
			}
		}
		throw new Error( "All providers failed" );
	}

	async chatCompletion ( messages, options = {})
	{
		const { stream, tools, ...restOptions } = options;
		const isStreaming = stream;

		for ( const provider of this.providers )
		{
			try
			{
				const params = {
					messages,
					...restOptions,
					model: provider.model,
					stream: isStreaming
				};

				if ( tools && tools.length > 0 )
				{
					params.tools = tools;
				}

				const result = await provider.breaker.fire({ params, withResponse: false });

				if ( isStreaming )
				{
					return ( async function* ()
					{
						for await ( const chunk of result )
						{
							try
							{
								const delta = chunk.choices[0]?.delta;
								if ( delta )
								{
									if ( delta.content !== null && delta.content !== undefined )
									{
										chunk.content = delta.content;
									}
									if ( delta.reasoning !== null && delta.reasoning !== undefined )
									{
										chunk.reasoning = delta.reasoning;
									}
									if ( delta.tool_calls !== null && delta.tool_calls !== undefined )
									{
										chunk.tool_calls_delta = delta.tool_calls;
									}
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

				// Non-streaming response handling
				const response = result;
				const message = response.choices[0]?.message;

				if ( message )
				{
					if ( message.content !== null ) response.content = message.content;
					if ( message.reasoning !== null ) response.reasoning = message.reasoning;
					if ( message.tool_calls !== null ) response.tool_calls = message.tool_calls;
				}

				return response;
			}
			catch ( error )
			{
				logger.error( `Failed with ${provider.name}: ${error.message}` );
			}
		}
		throw new Error( "All providers failed" );
	}

	async chatCompletionWithResponse ( messages, options = {})
	{
		const { stream, tools, ...restOptions } = options;
		const isStreaming = stream;

		for ( const provider of this.providers )
		{
			try
			{
				const params = {
					messages,
					...restOptions,
					model: provider.model,
					stream: isStreaming
				};

				if ( tools && tools.length > 0 )
				{
					params.tools = tools;
				}

				return await provider.breaker.fire({ params, withResponse: true });
			}
			catch ( error )
			{
				logger.error( `Failed with ${provider.name}: ${error.message}` );
			}
		}
		throw new Error( "All providers failed" );
	}

	async getModels ()
	{
		const models = [];
		for ( const provider of this.providers )
		{
			try
			{
				const client = this.createClient( provider );
				const listResponse = await client.models.list();

				// Handle different API response structures
				const modelList = Array.isArray( listResponse.data )
					? listResponse.data
					: listResponse.body || [];

				const model = modelList.find( m =>
				{
					return m.id === provider.model || m.id === `models/${provider.model}`;
				});

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
				logger.error( `Failed to list models for ${provider.name}: ${error.message}` );
			}
		}
		return models;
	}

	async checkProvidersStatus ()
	{
		const maskApiKey = ( key ) =>
		{
			if ( key && key.length >= 8 )
			{
				return `${key.substring( 0, 4 )}...${key.substring( key.length - 4 )}`;
			}
			return "Invalid API Key";
		};

		const promises = this.providers.map( async ( provider ) =>
		{
			try
			{
				const client = this.createClient( provider );
				await client.chat.completions.create({
					messages: [{ role: "user", content: "test" }],
					model: provider.model,
					max_tokens: 1
				});

				return {
					name: provider.name,
					status: "ok",
					apiKey: maskApiKey( provider.apiKey )
				};
			}
			catch ( error )
			{
				return {
					name: provider.name,
					status: "error",
					reason: error.message.substring( 0, 100 ),
					apiKey: maskApiKey( provider.apiKey )
				};
			}
		});

		const results = await Promise.allSettled( promises );

		const processedResults = results.map( ( r ) =>
		{
			if ( r.status === "fulfilled" )
			{
				return r.value;
			}
			return {
				name: "unknown",
				status: "error",
				reason: r.reason.message.substring( 0, 100 ),
				apiKey: "N/A"
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