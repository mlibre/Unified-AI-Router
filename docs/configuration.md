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
- `PORT` - Server port (default: 3000)

## Providers

Edit `src/provider.js` - it's an array of providers tried in order:

```js
module.exports = [
  {
    name: "openrouter",
    apiKey: process.env.OPENROUTER_API_KEY,
    model: "mistralai/devstral-2512:free",
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

## Multiple API Keys and Models

Both API keys and models can be specified as arrays to create multiple provider instances:

```js
{
  name: "openrouter",
  apiKey: [process.env.OPENROUTER_API_KEY, process.env.OPENROUTER_API_KEY_2],
  model: ["model_1", "model_2"],
  apiUrl: "https://openrouter.ai/api/v1"
}
```

## Admin Panel

Enable the web-based admin panel by setting credentials in `.env`:

```bash
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
```

When enabled:

- Access the admin panel at `http://localhost:3000/admin`
- The root path `/` requires authentication to access the chatbot
- Edit `src/provider.js` configuration through the web interface
- Changes are saved directly to the file and take effect immediately

**Note:** If admin credentials are not set, the chatbot is publicly accessible at `/`.
