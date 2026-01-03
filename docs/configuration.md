# Configuration

Set up environment variables and providers.

## Environment

Copy `.env.example` to `.env` and add your API keys:

```bash
cp .env.example .env
```

Common keys:

- `OPENAI_API_KEY` - OpenAI
- `OPENROUTER_API_KEY` - OpenRouter  
- `GEMINI_API_KEY` - Google Gemini
- `PORT` - Server port (default: 3000)

## Providers

Edit `provider.js` - it's an array of providers tried in order:

```js
module.exports = [
  {
    name: "openrouter",
    apiKey: process.env.OPENROUTER_API_KEY,
    model: "xiaomi/mimo-v2-flash:free",
    apiUrl: "https://openrouter.ai/api/v1"
  },
  {
    name: "openai", 
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4",
    apiUrl: "https://api.openai.com/v1"
  }
];
```

## Circuit Breakers

Built-in fault tolerance. Default settings:

- **timeout**: 300000ms (5 minutes)
- **errorThresholdPercentage**: 50%
- **resetTimeout**: 9000000ms (15 minutes)

Override per provider:

```js
{
  name: "openai",
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4",
  apiUrl: "https://api.openai.com/v1",
  circuitOptions: {
    timeout: 30000,
    errorThresholdPercentage: 50,
    resetTimeout: 300000
  }
}
```

## Multiple API Keys

```js
{
  name: "openrouter",
  apiKey: [process.env.OPENROUTER_API_KEY, process.env.OPENROUTER_API_KEY_2],
  model: "xiaomi/mimo-v2-flash:free",
  apiUrl: "https://openrouter.ai/api/v1"
}
```

## Testing

### Chat Completions Tests

```bash
# Basic chat completion
node tests/chat/chat.js

# OpenAI server non-streaming
node tests/chat/server-non-stream.js

# OpenAI server streaming
node tests/chat/server-stream.js

# Chat tool calling
node tests/chat/tool-calling.js
```

### Responses API Tests

```bash
# Basic responses API
node tests/responses/responses.js

# Responses API tool calling
node tests/responses/tool-calling.js
```

## Troubleshooting

- `Skipping provider ... due to missing API key` - Check `.env`
- `Model <name> not found` - Verify model name matches provider
- `All providers failed` - Check network/API quotas in logs
