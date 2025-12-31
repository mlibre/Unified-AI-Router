# Unified AI Router

Unified AI Router is a comprehensive toolkit for AI applications, featuring:

- An **OpenAI-compatible** server for seamless API integration
- A **Unified Interface** for multiple LLM providers with **Automatic Fallback**

It supports all the OpenAI-compatible servers, including major providers like OpenAI, Google, Grok, Litellm, Vllm, Ollama and more, ensuring reliability and flexibility.

- [🚀 Features](#-features)
- [🛠️ Installation](#️-installation)
- [📖 Usage](#-usage)
  - [📚 Basic Library Usage](#-basic-library-usage)
  - [🔌 OpenAI-Compatible Server](#-openai-compatible-server)
  - [🧪 Testing](#-testing)
  - [🌐 Deploying to Render.com](#-deploying-to-rendercom)
- [🔧 Supported Providers](#-supported-providers)
- [🔑 API Keys](#-api-keys)
- [📁 Project Structure](#-project-structure)
- [📄 License](#-license)

## 🚀 Features

- **Multi-Provider Support**: Works with OpenAI, Google, Grok, OpenRouter, Z.ai, Qroq, Cohere, Cerebras, LLM7 and etc
- **Automatic Fallback**: If one provider fails for **any reason**, automatically tries the next
- **Circuit Breaker**: Built-in fault tolerance with automatic circuit breaking for each provider to prevent cascading failures
- **OpenAI-Compatible Server**: Drop-in replacement for the OpenAI API, enabling easy integration with existing tools and clients
- **Simple API**: Easy-to-use interface for all supported providers
- **Streaming and Non-Streaming Support**: Handles both streaming and non-streaming responses
- **Tool Calling**: Full support for tools in LLM interactions

## 🛠️ Installation

```bash
npm i unified-ai-router
# OR
git clone https://github.com/mlibre/Unified-AI-Router
cd Unified-AI-Router
npm i
```

## 📖 Usage

### 🔌 OpenAI-Compatible Server

The OpenAI-compatible server provides a drop-in replacement for the OpenAI API. It routes requests through the unified router with fallback logic, ensuring high availability.  
The server uses the provider configurations defined in [provider.js](provider.js) file, and requires API keys set in a `.env` file.

1. Prepare  `.env`:

  ```bash
  cp .env.example .env
  nano .env
  ```

1. Configure your providers in `provider.js`. Add new provider or modify existing ones with the appropriate `name`, `apiKey`, `model`, and `apiUrl` for the providers you want to use.

  ```bash
  nano provider.js
  ```

To start the server locally, run:

```bash
npm start
```

The server listens at `http://localhost:3000/` and supports the following OpenAI-compatible endpoints:

- `POST /v1/chat/completions` - Chat completions (streaming and non-streaming)
- `POST /chat/completions` - Chat completions (streaming and non-streaming)
- `GET /v1/models` - List available models
- `GET /models` - List available models
- `GET /health` - Health check
- `GET /v1/providers/status` - Check the status of all configured providers

### 📚 Library Usage

This is the core AIRouter library - a JavaScript class that provides a unified interface for multiple LLM providers.

```javascript
const AIRouter = require("unified-ai-router");
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
    apiKey: process.env.GEMINI_API_KEY,
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

You can also provide an array of API keys for a single provider definition.

```javascript
const providers = [
  {
    name: "openai",
    apiKey: [process.env.OPENAI_API_KEY_1, process.env.OPENAI_API_KEY_2],
    model: "gpt-4",
    apiUrl: "https://api.openai.com/v1"
  }
];
```

### 🧪 Testing

The project includes tests for the core library and the OpenAI-compatible server.

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

### 🌐 Deploying to Render.com

Ensure `provider.js` is configured with API keys in `.env` (as above). Push to GitHub, then:

1. **Dashboard**:
   - Create Web Service on [Render.com](https://render.com), connect repo.
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add env vars (e.g., `OPENAI_API_KEY=sk-...`).
   - Deploy.

2. **CLI**:

   ```bash
   curl -fsSL https://raw.githubusercontent.com/render-oss/cli/refs/heads/main/bin/install.sh | sh
   render login
   render services
   render deploys create srv-d3f7iqmmcj7s73e67feg --commit HEAD --confirm --output text
   ```

3. **Verify**:
   - Access `https://your-service.onrender.com/models`.

See [Render docs](https://render.com/docs) for details.

## 🔧 Supported Providers

- OpenAI
- Google Gemini
- Grok
- OpenRouter
- Z.ai
- Qroq
- Cohere
- Cerebras
- LLM7
- Any Other OpenAI Compatible Server

## 🔑 API Keys

Get your API keys from the following providers:

- **OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Google Gemini**: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
- **Grok**: [console.x.ai](https://console.x.ai/)
- **OpenRouter**: [openrouter.ai/keys](https://openrouter.ai/keys)
- **Z.ai**: [api.z.ai](https://api.z.ai)
- **Qroq**: [console.groq.com/keys](https://console.groq.com/keys)
- **Cohere**: [dashboard.cohere.com/api-keys](https://dashboard.cohere.com/api-keys)
- **Cerebras**: [cloud.cerebras.ai](https://cloud.cerebras.ai)
- **LLM7**: [token.llm7.io](https://token.llm7.io/)

## 📁 Project Structure

- `main.js` - Core AIRouter library implementing the unified interface and fallback logic
- `provider.js` - Configuration for supported AI providers
- `openai-server.js` - OpenAI-compatible API server
- `tests/` - Comprehensive tests for the library, server, and tools

## 📄 License

MIT
