# n8n Node for Unified AI Router

This is an n8n custom node that integrates the Unified AI Router, providing a unified interface for multiple LLM providers with automatic fallback.

## Installation

1. Install the dependencies:

   ```
   npm install
   ```

2. Build the node:

   ```
   npm run build
   npm link
   mkdir .n8n/custom
   cd .n8n/custom
   npm init
   npm link @mlibre/n8n-nodes-unified-ai-router
   ```

3. Install the node in your n8n instance. Copy the `dist` folder to your n8n custom nodes directory, or publish to npm and install globally.

## Testing

To test the node locally:

1. Install n8n globally:

   ```
   npm install n8n -g
   ```

2. Reset user management:

   ```
   n8n user-management:reset
   ```

3. Start n8n:

   ```
   N8N_DIAGNOSTICS_ENABLED=false N8N_SECURE_COOKIE=false n8n
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
