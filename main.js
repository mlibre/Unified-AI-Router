const axios = require( "axios" );
const pino = require( "pino" );
const logger = pino();

class AIRouter
{
	constructor ( providers )
	{
		this.providers = providers;
	}

	async chatCompletion ( messages, options = {})
	{
		logger.info( `Starting chatCompletion with ${this.providers.length} providers` );
		let lastError;

		for ( const provider of this.providers )
		{
			try
			{
				logger.info( `Attempting with provider: ${provider.name}` );
				const response = await this.callProvider( provider, messages, options );
				return response;
			}
			catch ( error )
			{
				lastError = error;
				logger.error( `Failed with ${provider.name}:${error.message}, ${JSON.stringify( error.response?.data?.error )}` );
				// Continue to next provider
			}
		}

		throw new Error( `All providers failed. Last error: ${lastError.message}` );
	}

	async callProvider ( provider, messages, options )
	{
		switch ( provider.name.toLowerCase() )
		{
		case "openai":
			return await this.callOpenAI( provider, messages, options );
		case "google":
			return await this.callGoogle( provider, messages, options );
		case "grok":
			return await this.callGrok( provider, messages, options );
		case "openrouter":
			return await this.callOpenRouter( provider, messages, options );
		case "z.ai":
			return await this.callZAI( provider, messages, options );
		case "qroq":
			return await this.callQroq( provider, messages, options );
		case "cohere":
			return await this.callCohere( provider, messages, options );
		case "vercel":
			return await this.callVercelAIGateway( provider, messages, options );
		case "cerebras":
			return await this.callCerebras( provider, messages, options );
		case "llm7":
			return await this.callLLM7( provider, messages, options );
		default:
			throw new Error( `Unsupported provider: ${provider.name}` );
		}
	}

	mapRole ( role, providerName )
	{
		// Define role mappings for different providers
		const roleMappings = {
			"google": {
				"system": "system",
				"user": "user",
				"assistant": "model",
				"developer": "user"
			},
			"z.ai": {
				"system": "system",
				"user": "user",
				"assistant": "assistant",
				"developer": "system"
			},
			"grok": {
				"system": "system",
				"user": "user",
				"assistant": "assistant",
				"developer": "system"
			},
			"openai": {
				"system": "system",
				"user": "user",
				"assistant": "assistant",
				"developer": "system"
			},
			"openrouter": {
				"system": "system",
				"user": "user",
				"assistant": "assistant",
				"developer": "system"
			},
			"qroq": {
				"system": "system",
				"user": "user",
				"assistant": "assistant",
				"developer": "system"
			},
			"cohere": {
				"system": "system",
				"user": "user",
				"assistant": "assistant",
				"tool": "tool"
			},
			"vercel": {
				"system": "system",
				"user": "user",
				"assistant": "assistant",
				"developer": "system"
			},
			"cerebras": {
				"system": "system",
				"user": "user",
				"assistant": "assistant",
				"developer": "system"
			},
			"llm7": {
				"system": "system",
				"user": "user",
				"assistant": "assistant",
				"developer": "system"
			}
		};
		const providerMapping = roleMappings[providerName.toLowerCase()] || {};
		return providerMapping[role] || role;
	}

	// Helper method to create standard OpenAI-compatible request body
	createStandardRequestBody ( provider, messages, options )
	{
		return {
			model: provider.model,
			messages: messages.map( msg =>
			{
				return {
					...msg,
					role: this.mapRole( msg.role, provider.name )
				}
			}),
			...options
		};
	}

	// Helper method to create standard headers
	createStandardHeaders ( provider )
	{
		return {
			"Authorization": `Bearer ${provider.apiKey}`,
			"Content-Type": "application/json"
		};
	}

	// Helper method to make standard API call
	async makeStandardApiCall ( url, body, headers )
	{
		const response = await axios.post( url, body, { headers });
		return response.data.choices[0].message.content;
	}

	async callOpenAI ( provider, messages, options )
	{
		const url = provider.apiUrl || "https://api.openai.com/v1/chat/completions";
		const headers = this.createStandardHeaders( provider );
		const body = this.createStandardRequestBody( provider, messages, options );
		return await this.makeStandardApiCall( url, body, headers );
	}

	async callGoogle ( provider, messages, options )
	{
		const url = provider.apiUrl || `https://generativelanguage.googleapis.com/v1beta/models/${provider.model}:generateContent`;

		const systemMessage = messages.find( msg => { return msg.role === "system" });
		const otherMessages = messages.filter( msg => { return msg.role !== "system" });

		const contents = otherMessages.map( msg =>
		{
			return {
				role: this.mapRole( msg.role, provider.name ),
				parts: [{ text: msg.content }]
			}
		});

		const body = {
			contents,
			generationConfig: {
				temperature: options.temperature || 0.2,
			}
		};

		if ( systemMessage )
		{
			body.system_instruction = {
				parts: [
					{
						text: systemMessage.content
					}
				]
			};
		}

		const response = await axios.post( url, body, {
			headers: {
				"Content-Type": "application/json",
				"x-goog-api-key": provider.apiKey
			}
		});

		return response.data.candidates[0].content?.parts?.[0]?.text;
	}

	async callGrok ( provider, messages, options )
	{
		const url = provider.apiUrl || "https://api.x.ai/v1/chat/completions";
		const headers = this.createStandardHeaders( provider );
		const body = this.createStandardRequestBody( provider, messages, options );
		return await this.makeStandardApiCall( url, body, headers );
	}

	async callOpenRouter ( provider, messages, options )
	{
		const url = provider.apiUrl || "https://openrouter.ai/api/v1/chat/completions";
		const headers = this.createStandardHeaders( provider );
		const body = this.createStandardRequestBody( provider, messages, options );
		return await this.makeStandardApiCall( url, body, headers );
	}

	async callZAI ( provider, messages, options )
	{
		const url = provider.apiUrl || "https://api.z.ai/api/paas/v4/chat/completions";
		const headers = {
			...this.createStandardHeaders( provider ),
			"Accept-Language": "en-US,en"
		};
		const body = this.createStandardRequestBody( provider, messages, options );
		return await this.makeStandardApiCall( url, body, headers );
	}

	async callQroq ( provider, messages, options )
	{
		const url = provider.apiUrl || "https://api.groq.com/openai/v1/chat/completions";
		const headers = this.createStandardHeaders( provider );
		const body = this.createStandardRequestBody( provider, messages, options );
		return await this.makeStandardApiCall( url, body, headers );
	}

	async callCohere ( provider, messages, options )
	{
		const url = provider.apiUrl || "https://api.cohere.com/v2/chat";
		const headers = {
			...this.createStandardHeaders( provider ),
			"accept": "application/json"
		};

		// Map messages to Cohere format
		const cohereMessages = messages.map( msg =>
		{
			return {
				...msg,
				role: this.mapRole( msg.role, provider.name )
			}
		});

		const body = {
			model: provider.model || "command-a-03-2025", // Default model if not specified
			messages: cohereMessages,
			...options
		};

		const response = await axios.post( url, body, { headers });
		return response.data.message?.content?.[0]?.text;
	}

	async callVercelAIGateway ( provider, messages, options )
	{
		const url = provider.apiUrl || "https://ai-gateway.vercel.sh/v1/chat/completions";
		const headers = this.createStandardHeaders( provider );
		const body = this.createStandardRequestBody( provider, messages, options );
		return await this.makeStandardApiCall( url, body, headers );
	}

	async callCerebras ( provider, messages, options )
	{
		const url = provider.apiUrl || "https://api.cerebras.ai/v1/chat/completions";
		const headers = this.createStandardHeaders( provider );
		const body = {
			...this.createStandardRequestBody( provider, messages, options ),
			stream: options.stream || false,
			max_tokens: options.max_tokens || 65536,
			temperature: options.temperature || 1,
			top_p: options.top_p || 1,
		};
		return await this.makeStandardApiCall( url, body, headers );
	}

	async callLLM7 ( provider, messages, options )
	{
		const url = provider.apiUrl || "https://api.llm7.io/v1/chat/completions";
		const headers = this.createStandardHeaders( provider );
		const body = this.createStandardRequestBody( provider, messages, options );
		return await this.makeStandardApiCall( url, body, headers );
	}
}

module.exports = AIRouter;