# AIRouter

A unified interface for multiple LLM providers with automatic fallback. Send one request to multiple AI models simultaneously.

* [🚀 Features](#-features)
* [🛠️ Installation](#️-installation)
* [📖 Usage](#-usage)
  * [Basic Library Usage](#basic-library-usage)
  * [Telegram Bot Deployment](#telegram-bot-deployment)
* [🔧 Supported Providers](#-supported-providers)
* [🎯 Role Mapping](#-role-mapping)
* [🔼 Vercel Deployment (Telegram Bot)](#-vercel-deployment-telegram-bot)
  * [Prerequisites](#prerequisites)
  * [Deployment Steps](#deployment-steps)
* [Project Structure](#project-structure)
* [📄 License](#-license)

## 🚀 Features

* **Multi-Provider Support**: Works with OpenAI, Google, Grok, OpenRouter, Z.ai, Qroq, Cohere, Vercel, and Cerebras
* **Automatic Fallback**: If one provider fails, automatically tries the next
* **Smart Role Mapping**: Automatically translates roles between different provider formats
* **Simple API**: Easy to use interface for all supported providers

## 🛠️ Installation

```bash
git clone https://github.com/mlibre/AIRouter
cd AIRouter
npm install axios pino dotenv
```

## 📖 Usage

### Basic Library Usage

This is the core AIRouter library - a JavaScript class that provides a unified interface for multiple LLM providers.

```javascript
const AIRouter = require("./main");
require("dotenv").config();

const providers = [
  {
    name: "openai",
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4"
  },
  {
    name: "google",
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-2.5-pro"
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

### Telegram Bot Deployment

For deploying as a Telegram bot, see the [Vercel Deployment Guide](#-vercel-deployment-telegram-bot) below. This uses the AIRouter library as the backend for a Telegram bot interface.

## 🔧 Supported Providers

* OpenAI
* Google Gemini
* Grok
* OpenRouter
* Z.ai
* Qroq
* Cohere
* Vercel
* Cerebras

## 🎯 Role Mapping

Automatically maps standard roles to provider-specific formats:

| Standard  | OpenAI               | Google | Z.ai      | Grok      | OpenRouter | Qroq      | Cohere    | Vercel    | Cerebras  |
| --------- | -------------------- | ------ | --------- | --------- | ---------- | --------- | --------- | --------- | --------- |
| system    | system               | system | system    | system    | system     | system    | system    | system    | system    |
| user      | user                 | user   | user      | user      | user       | user      | user      | user      | user      |
| assistant | assistant            | model  | assistant | assistant | assistant  | assistant | assistant | assistant | assistant |
| developer | system               | user   | system    | system    | system     | system    | system    | system    | system    |
| tool      | function_call_output | -      | -         | -         | -          | -         | tool      | -         | -         |

## 🔼 Vercel Deployment (Telegram Bot)

This section describes how to deploy the AIRouter as a Telegram bot using Vercel. This is a separate deployment from the core library.

### Prerequisites

* A Telegram Bot Token (@BotFather)
* API keys for various AI providers
* Vercel account

### Deployment Steps

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
VERCEL_URL=VERCEL_URL

vercel env add TELEGRAM_BOT_TOKEN
vercel env add GOOGLE_API_KEY
vercel env add OPENROUTER_API_KEY
vercel env add ZAI_API_KEY
vercel env add QROQ_API_KEY
vercel env add COHERE_API_KEY
vercel env add VERCEL_AI_GATEWAY_API_KEY
vercel env add CEREBRAS_API_KEY
vercel env add VERCEL_URL

# Deploy to Vercel
vercel
vercel --prod

# Check logs
vercel logs https://ai-router-flame.vercel.app

# Register webhook for Telegram
# https://ai-router-flame.vercel.app/api?register_webhook=true
curl "https://ai-router-flame.vercel.app/api?register_webhook=true"
```

## Project Structure

The Telegram bot deployment uses these files:

* `api/index.js` - Main webhook handler
* `src/telegram.js` - Telegram client implementation
* `src/config.js` - Configuration and provider setup
* `main.js` - The AIRouter library (core functionality)

## 📄 License

MIT
