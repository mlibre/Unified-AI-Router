# 🌍 Supported Providers

Configure multiple AI providers for automatic fallback and load balancing.

## 📋 Available Providers

| Provider                     | API Base URL                                               | Model Examples                     | API Key Link                                                             |
| ---------------------------- | ---------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------ |
| OpenAI                       | `https://api.openai.com/v1`                                | `gpt-4`, `gpt-3.5-turbo`           | [platform.openai.com/api-keys](https://platform.openai.com/api-keys)     |
| OpenRouter                   | `https://openrouter.ai/api/v1`                             | `xiaomi/mimo-v2-flash:free`        | [openrouter.ai/keys](https://openrouter.ai/keys)                         |
| Groq                         | `https://api.groq.com/openai/v1`                           | `llama-3.1-70b-versatile`          | [console.groq.com](https://console.groq.com)                             |
| Google Gemini                | `https://generativelanguage.googleapis.com/v1beta/openai/` | `gemini-2.5-pro`                   | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |
| Cohere                       | `https://api.cohere.ai/v1`                                 | `command-r-plus`                   | [dashboard.cohere.com/api-keys](https://dashboard.cohere.com/api-keys)   |
| Cerebras                     | `https://api.cerebras.ai/v1`                               | `llama3.1-70b`                     | [cloud.cerebras.ai](https://cloud.cerebras.ai)                           |
| Any OpenAI-Compatible Server | `http://server-url/`                                       | Any model supported by your server | Custom                                                                   |

## ⚙️ Configuration Examples

### OpenAI

```javascript
{
  name: "openai",
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4",
  apiUrl: "https://api.openai.com/v1"
}
```

### OpenRouter

```javascript
{
  name: "openrouter",
  apiKey: process.env.OPENROUTER_API_KEY,
  model: "xiaomi/mimo-v2-flash:free",
  apiUrl: "https://openrouter.ai/api/v1"
}
```

### Google Gemini

```javascript
{
  name: "gemini",
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-2.5-pro",
  apiUrl: "https://generativelanguage.googleapis.com/v1beta/openai/"
}
```

### Groq

```javascript
{
  name: "groq",
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.1-70b-versatile",
  apiUrl: "https://api.groq.com/openai/v1"
}
```

### Cohere

```javascript
{
  name: "cohere",
  apiKey: process.env.COHERE_API_KEY,
  model: "command-r-plus",
  apiUrl: "https://api.cohere.ai/v1"
}
```

### Cerebras

```javascript
{
  name: "cerebras",
  apiKey: process.env.CEREBRAS_API_KEY,
  model: "llama3.1-70b",
  apiUrl: "https://api.cerebras.ai/v1"
}
```

### Custom OpenAI-Compatible Server

```javascript
{
  name: "custom-server",
  apiKey: process.env.SERVER_API_KEY, // Optional: depends on server
  model: "your-model-name",
  apiUrl: "http://localhost:4000/v1"
}
```

## 🎯 Provider Priority

Providers are tried in order until one succeeds:

```javascript
module.exports = [
  // Try this first
  {
    name: "openrouter",
    apiKey: process.env.OPENROUTER_API_KEY,
    model: "xiaomi/mimo-v2-flash:free",
    apiUrl: "https://openrouter.ai/api/v1"
  },
  // Fallback if first fails
  {
    name: "openai",
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-3.5-turbo",
    apiUrl: "https://api.openai.com/v1"
  },
  // Last resort
  {
    name: "gemini",
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-1.5-flash",
    apiUrl: "https://generativelanguage.googleapis.com/v1beta/openai/"
  }
];
```

## 🔀 Load Balancing

Use multiple API keys for the same provider:

```javascript
{
  name: "openai",
  apiKey: [
    process.env.OPENAI_API_KEY_1,
    process.env.OPENAI_API_KEY_2,
    process.env.OPENAI_API_KEY_3
  ],
  model: "gpt-4",
  apiUrl: "https://api.openai.com/v1"
}
```

## 🛡️ Circuit Breaker Settings

Configure reliability settings per provider:

```javascript
{
  name: "openai",
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4",
  apiUrl: "https://api.openai.com/v1",
  circuitOptions: {
    timeout: 30000,              // 30 second timeout
    errorThresholdPercentage: 50, // Open after 50% failures
    resetTimeout: 300000         // Try again after 5 minutes
  }
}
```

## Provider Status

Check provider health:

```bash
curl http://localhost:3000/v1/providers/status
```

Response includes:

- Provider name and status
- Circuit breaker state
- Recent error counts
- Response times
