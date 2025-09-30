# n8n Node for Unified AI Router

This is an n8n custom node that integrates the Unified AI Router, providing a unified interface for multiple LLM providers with automatic fallback.

## Installation

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
npm link
mkdir -p $HOME/.n8n/custom
cd $HOME/.n8n/custom
npm init -y
npm link @mlibre/n8n-nodes-unified-ai-router
cd $HOME/.n8n/custom/node_modules/@mlibre/n8n-nodes-unified-ai-router
npm install --production
```

## Testing

To test the node locally:

1. Install n8n globally:

   ```bash
   npm install n8n -g
   n8n user-management:reset
   ```

2. Start n8n:

```bash
N8N_CUSTOM_EXTENSIONS=$HOME/.n8n/custom N8N_DIAGNOSTICS_ENABLED=false N8N_SECURE_COOKIE=false npx n8n
```

## Usage

The node allows you to configure multiple AI providers with their API keys, models, and URLs. It will try each provider in order until one succeeds.

### Properties

- **Providers**: A list of AI providers. Each provider has:
  - Name: Identifier for the provider
  - API Key: Your API key for the provider
  - Model: The model to use
  - API URL: The base URL for the API

- **Messages**: The conversation messages, each with role (system/user/assistant) and content.

- **Options**: Additional parameters like temperature, max tokens, etc.

The node outputs the chat completion response from the first successful provider.
