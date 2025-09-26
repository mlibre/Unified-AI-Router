# Unified AI Router

Unified AI Router is a comprehensive toolkit for AI applications, featuring:

- A unified interface for multiple LLM providers with automatic fallback (the core router library)
- An OpenAI-compatible server for seamless API integration
- A deployable Telegram bot with Mini App interface

It supports major providers like OpenAI, Google, Grok, and more, ensuring reliability and flexibility.

- [🚀 Features](#-features)
- [🛠️ Installation](#️-installation)
- [📖 Usage](#-usage)
  - [📚 Basic Library Usage](#-basic-library-usage)
  - [🔌 OpenAI-Compatible Server](#-openai-compatible-server)
  - [🧪 Testing](#-testing)
- [🔧 Supported Providers](#-supported-providers)
- [🔑 API Keys](#-api-keys)
- [🔼 Vercel Deployment (Telegram Bot)](#-vercel-deployment-telegram-bot)
  - [📋 Prerequisites](#-prerequisites)
  - [🚀 Deployment Steps](#-deployment-steps)
  - [📱 Enable Telegram Mini App](#-enable-telegram-mini-app)
- [📁 Project Structure](#-project-structure)
- [📄 License](#-license)

## 🚀 Features

- **Multi-Provider Support**: Works with OpenAI, Google, Grok, OpenRouter, Z.ai, Qroq, Cohere, Vercel, Cerebras, and LLM7
- **Automatic Fallback**: If one provider fails, automatically tries the next
- **Simple API**: Easy-to-use interface for all supported providers
- **OpenAI-Compatible Server**: Drop-in replacement for the OpenAI API, enabling easy integration with existing tools and clients
- **Streaming and Non-Streaming Support**: Handles both streaming and non-streaming responses
- **Tool Calling**: Full support for tools in LLM interactions
- **Telegram Bot Integration**: Deployable as a Telegram bot with an interactive Mini App interface

## 🛠️ Installation

```bash
npm i unified-ai-router
# OR
git clone https://github.com/mlibre/AIRouter
cd AIRouter
npm i
```

## 📖 Usage

### 📚 Basic Library Usage

This is the core AIRouter library - a JavaScript class that provides a unified interface for multiple LLM providers.

```javascript
const AIRouter = require("./main");
require("dotenv").config();

const providers = [
  {
    name: "openai",
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4",
    apiUrl: "https://api.openai.com/v1"
  },
  {
    name: "google",
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-2.5-pro",
    apiUrl: "https://generativelanguage.googleapis.com/v1beta/openai/"
  }
];

const llm = new AIRouter(providers);

const messages = [
  { role: "system", content: "You are a helpful assistant." },
  { role: "user", content: "Explain quantum computing in simple terms." }
];

const response = await llm.chatCompletion(messages, {
  temperature: 0.7
});

console.log(response);
```

### 🔌 OpenAI-Compatible Server

The OpenAI-compatible server provides a drop-in replacement for the OpenAI API. It routes requests through the unified router with fallback logic, ensuring high availability.  
The server uses the provider configurations defined in [provider.js](provider.js) file, and requires API keys set in a `.env` file.

#### Setup

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Configure your providers in `provider.js`. Add new provider or modify existing ones with the appropriate `name`, `apiKey` (referencing the corresponding env variable), `model`, and `apiUrl` for the providers you want to use.

3. Edit `.env` and add your API keys for the desired providers (see [🔑 API Keys](#-api-keys) for sources).

To start the server locally, run:

```bash
npm start
```

The server listens at `http://localhost:3000/v1/chat/completions` and supports standard OpenAI endpoints like `/v1/chat/completions`.

### 🧪 Testing

The project includes tests for the core library and the OpenAI-compatible server. To run the tests, use the following commands:

```bash
# Test chat completion
node tests/chat.js

# Test OpenAI server non-streaming
node tests/openai-server-non-stream.js

# Test OpenAI server streaming
node tests/openai-server-stream.js

# Test tool usage
node tests/tools.js
```

## 🔧 Supported Providers

- OpenAI
- Google Gemini
- Grok
- OpenRouter
- Z.ai
- Qroq
- Cohere
- Vercel
- Cerebras
- LLM7

## 🔑 API Keys

Get your API keys from the following providers:

- **OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Google Gemini**: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
- **Grok**: [console.x.ai](https://console.x.ai/)
- **OpenRouter**: [openrouter.ai/keys](https://openrouter.ai/keys)
- **Z.ai**: [api.z.ai](https://api.z.ai)
- **Qroq**: [console.groq.com/keys](https://console.groq.com/keys)
- **Cohere**: [dashboard.cohere.com/api-keys](https://dashboard.cohere.com/api-keys)
- **Vercel AI Gateway**: [vercel.com/docs/ai/ai-gateway](https://vercel.com/docs/ai-gateway)
- **Cerebras**: [cloud.cerebras.ai](https://cloud.cerebras.ai)
- **LLM7**: [token.llm7.io](https://token.llm7.io/)
  - Seems like it does not support tool calling

## 🔼 Vercel Deployment (Telegram Bot)

This section describes how to deploy the AIRouter as a Telegram bot using Vercel. This is a separate deployment from the core library.

### 📋 Prerequisites

- A Telegram Bot Token (@BotFather)
- API keys for various AI providers
- Vercel account

### 🚀 Deployment Steps

```bash
# Create the vercel project: vercel.com
# name: ai-router

npm i -g vercel
vercel login

nano .env
TELEGRAM_BOT_TOKEN=TOKEN
GOOGLE_API_KEY=API_KEY
OPENROUTER_API_KEY=API_KEY
ZAI_API_KEY=API_KEY
QROQ_API_KEY=API_KEY
COHERE_API_KEY=API_KEY
VERCEL_AI_GATEWAY_API_KEY=API_KEY
CEREBRAS_API_KEY=API_KEY
LLM7_API_KEY=API_KEY
VERCEL_URL=VERCEL_URL
SEARX_URL=SEARX_URL

vercel env add TELEGRAM_BOT_TOKEN
vercel env add GOOGLE_API_KEY
vercel env add OPENROUTER_API_KEY
vercel env add ZAI_API_KEY
vercel env add QROQ_API_KEY
vercel env add COHERE_API_KEY
vercel env add VERCEL_AI_GATEWAY_API_KEY
vercel env add CEREBRAS_API_KEY
vercel env add LLM7_API_KEY
vercel env add VERCEL_URL
vercel env add SEARX_URL

# Deploy to Vercel
vercel
vercel --prod

# Check logs
vercel logs https://ai-router-flame.vercel.app

# Register webhook for Telegram
# https://ai-router-flame.vercel.app/api?register_webhook=true
curl "https://ai-router-flame.vercel.app/api?register_webhook=true"
```

### 📱 Enable Telegram Mini App

After deploying the bot, you need to configure the Telegram Mini App and menu button:

1. **Configure Mini App:**
   - Go to [@BotFather](https://t.me/botfather)
   - Send `/mybots` and select your bot
   - Go to `Bot Settings` → `Configure Mini App`
   - Set the Mini App URL to: `https://ai-router-flame.vercel.app`

2. **Configure Menu Button:**
   - Go to [@BotFather](https://t.me/botfather)
   - Send `/mybots` and select your bot
   - Go to `Bot Settings` → `Menu Button`
   - Ensure the URL shown is: `https://ai-router-flame.vercel.app`

Once configured, users can access the Mini App by sending `/start` or `/app` to your bot, or through the menu button.

An example of a deployed bot is accessible on Telegram: [https://t.me/freePulseAIbot](https://t.me/freePulseAIbot)

## 📁 Project Structure

- `main.js` - Core AIRouter library implementing the unified interface and fallback logic
- `provider.js` - Configuration for supported AI providers
- `openai-compatible-server/index.js` - OpenAI-compatible API server
- `tests/` - Comprehensive tests for the library, server, and tools
- `bruno/` - Bruno API collection for testing endpoints
- `vercel-project/` - Ready-to-deploy Vercel setup for the Telegram bot
  - `api/index.js` - Telegram webhook handler
  - `api/search.js` - Search proxy endpoint
  - `public/` - Mini App frontend (HTML, CSS, JS)
  - `src/config.js` - Bot configuration
  - `src/telegram.js` - Telegram API integration

## 📄 License

MIT
