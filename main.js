const axios = require('axios');

class UnifiedLLMProvider {
  constructor(providers) {
    this.providers = providers;
  }

  async chatCompletion(messages, options = {}) {
    let lastError;
    
    for (const provider of this.providers) {
      try {
        console.log(`Attempting with provider: ${provider.name}`);
        const response = await this.callProvider(provider, messages, options);
        return response;
      } catch (error) {
        lastError = error;
        console.error(`Failed with ${provider.name}: ${error.message}`);
        // Continue to next provider
      }
    }
    
    throw new Error(`All providers failed. Last error: ${lastError.message}`);
  }

  async callProvider(provider, messages, options) {
    switch (provider.name.toLowerCase()) {
      case 'openai':
        return await this.callOpenAI(provider, messages, options);
      case 'google':
        return await this.callGoogle(provider, messages, options);
      case 'grok':
        return await this.callGrok(provider, messages, options);
      case 'openrouter':
        return await this.callOpenRouter(provider, messages, options);
      case 'z.ai':
        return await this.callZAI(provider, messages, options);
      default:
        throw new Error(`Unsupported provider: ${provider.name}`);
    }
  }

  async callOpenAI(provider, messages, options) {
    const url = provider.apiUrl || 'https://api.openai.com/v1/chat/completions';
    const headers = {
      'Authorization': `Bearer ${provider.apiKey}`,
      'Content-Type': 'application/json'
    };
    
    const body = {
      model: provider.model,
      messages,
      ...options
    };

    const response = await axios.post(url, body, { headers });
    return response.data.choices[0].message.content;
  }

  async callGoogle(provider, messages, options) {
    const url = provider.apiUrl || `https://generativelanguage.googleapis.com/v1beta/models/${provider.model}:generateContent?key=${provider.apiKey}`;
    
    // Convert messages to Google's format
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const body = {
      contents,
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 1024,
      }
    };

    const response = await axios.post(url, body, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    return response.data.candidates[0].content.parts[0].text;
  }

  async callGrok(provider, messages, options) {
    const url = provider.apiUrl || 'https://api.x.ai/v1/chat/completions';
    const headers = {
      'Authorization': `Bearer ${provider.apiKey}`,
      'Content-Type': 'application/json'
    };
    
    const body = {
      model: provider.model,
      messages,
      ...options
    };

    const response = await axios.post(url, body, { headers });
    return response.data.choices[0].message.content;
  }

  async callOpenRouter(provider, messages, options) {
    const url = provider.apiUrl || 'https://openrouter.ai/api/v1/chat/completions';
    const headers = {
      'Authorization': `Bearer ${provider.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://your-app.com', // Replace with your app URL
      'X-Title': 'Your App Name' // Replace with your app name
    };
    
    const body = {
      model: provider.model,
      messages,
      ...options
    };

    const response = await axios.post(url, body, { headers });
    return response.data.choices[0].message.content;
  }

  async callZAI(provider, messages, options) {
    const url = provider.apiUrl || 'https://api.z.ai/v1/chat/completions';
    const headers = {
      'Authorization': `Bearer ${provider.apiKey}`,
      'Content-Type': 'application/json'
    };
    
    const body = {
      model: provider.model,
      messages,
      ...options
    };

    const response = await axios.post(url, body, { headers });
    return response.data.choices[0].message.content;
  }
}

// Usage example:
const providers = [
  {
    name: 'openai',
    apiKey: 'your-openai-api-key',
    model: 'gpt-3.5-turbo'
  },
  {
    name: 'google',
    apiKey: 'your-google-api-key',
    model: 'gemini-pro'
  },
  {
    name: 'grok',
    apiKey: 'your-grok-api-key',
    model: 'grok-beta'
  },
  {
    name: 'openrouter',
    apiKey: 'your-openrouter-api-key',
    model: 'openrouter/gpt-3.5-turbo'
  },
  {
    name: 'z.ai',
    apiKey: 'your-zai-api-key',
    model: 'zai-gpt-4'
  }
];

const llm = new UnifiedLLMProvider(providers);

async function getResponse() {
  try {
    const messages = [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Explain quantum computing in simple terms.' }
    ];
    
    const response = await llm.chatCompletion(messages, {
      temperature: 0.7,
      maxTokens: 500
    });
    
    console.log('Response:', response);
  } catch (error) {
    console.error('All providers failed:', error.message);
  }
}

getResponse();