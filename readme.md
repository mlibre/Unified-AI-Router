# AIRouter

A unified interface for multiple LLM providers with automatic fallback. Send one request to multiple AI models simultaneously.

## 🚀 Features

- **Multi-Provider Support**: Works with OpenAI, Google, Grok, OpenRouter, and Z.ai
- **Automatic Fallback**: If one provider fails, automatically tries the next
- **Smart Role Mapping**: Automatically translates roles between different provider formats
- **Simple API**: Easy to use interface for all supported providers

## 🛠️ Installation

```bash
git clone https://github.com/mlibre/AIRouter
cd AIRouter
npm install axios pino dotenv
```

## 📖 Usage

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

## 🔧 Supported Providers

- OpenAI
- Google Gemini
- Grok
- OpenRouter
- Z.ai

## 🎯 Role Mapping

Automatically maps standard roles to provider-specific formats:

| Standard | Google | Z.ai | Others |
|----------|--------|------|--------|
| system   | user   | system | system |
| user     | user   | user   | user   |
| assistant| model  | assistant | assistant |
| developer| user   | system | system |

## 🔼 Vercel

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
VERCEL_URL=VERCEL_URL

vercel env add TELEGRAM_BOT_TOKEN
vercel env add GOOGLE_API_KEY
vercel env add OPENROUTER_API_KEY
vercel env add ZAI_API_KEY
vercel env add VERCEL_URL

# vercel dev
vercel
vercel --prod
vercel logs https://ai-router-flame.vercel.app

# https://ai-router-flame.vercel.app/api?register_webhook=true
curl "https://ai-router-flame.vercel.app/api?register_webhook=true"

```

## 📄 License

MIT

## Standing with Palestine 🇵🇸

This project supports Palestinian rights and stands in solidarity with Palestine. We believe in the importance of documenting and preserving Palestinian narratives, history, and struggles for justice and liberation.

Free Palestine 🇵🇸
