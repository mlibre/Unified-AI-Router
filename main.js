const axios = require( "axios" );

class UnifiedLLMProvider
{
	constructor ( providers )
	{
		this.providers = providers;
	}

	async chatCompletion ( messages, options = {})
	{
		let lastError;

		for ( const provider of this.providers )
		{
			try
			{
				console.log( `Attempting with provider: ${provider.name}` );
				const response = await this.callProvider( provider, messages, options );
				return response;
			}
			catch ( error )
			{
				lastError = error;
				console.error( `Failed with ${provider.name}:${error.message}, ${JSON.stringify( error.response?.data?.error )}` );
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
		default:
			throw new Error( `Unsupported provider: ${provider.name}` );
		}
	}

	async callOpenAI ( provider, messages, options )
	{
		const url = provider.apiUrl || "https://api.openai.com/v1/chat/completions";
		const headers = {
			"Authorization": `Bearer ${provider.apiKey}`,
			"Content-Type": "application/json"
		};

		const body = {
			model: provider.model,
			messages,
			...options
		};

		const response = await axios.post( url, body, { headers });
		return response.data.choices[0].message.content;
	}

	async callGoogle ( provider, messages, options )
	{
		const url = provider.apiUrl || `https://generativelanguage.googleapis.com/v1beta/models/${provider.model}:generateContent`;

		const contents = messages.map( msg =>
		{
			return {
				role: msg.role === "assistant" || msg.role === "system" ? "model" : "user",
				parts: [{ text: msg.content }]
			}
		});

		const body = {
			contents,
			generationConfig: {
				temperature: options.temperature || 0.2,
			}
		};

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
		const headers = {
			"Authorization": `Bearer ${provider.apiKey}`,
			"Content-Type": "application/json"
		};

		const body = {
			model: provider.model,
			messages,
			...options
		};

		const response = await axios.post( url, body, { headers });
		return response.data.choices[0].message.content;
	}

	async callOpenRouter ( provider, messages, options )
	{
		const url = provider.apiUrl || "https://openrouter.ai/api/v1/chat/completions";
		const headers = {
			"Authorization": `Bearer ${provider.apiKey}`,
			"Content-Type": "application/json",
			"HTTP-Referer": "https://your-app.com", // Replace with your app URL
			"X-Title": "Your App Name" // Replace with your app name
		};

		const body = {
			model: provider.model,
			messages,
			...options
		};

		const response = await axios.post( url, body, { headers });
		return response.data.choices[0].message.content;
	}

	async callZAI ( provider, messages, options )
	{
		const url = provider.apiUrl || "https://api.z.ai/v1/chat/completions";
		const headers = {
			"Authorization": `Bearer ${provider.apiKey}`,
			"Content-Type": "application/json"
		};

		const body = {
			model: provider.model,
			messages,
			...options
		};

		const response = await axios.post( url, body, { headers });
		return response.data.choices[0].message.content;
	}
}

module.exports = UnifiedLLMProvider;