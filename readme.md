
# 🚀 Unified AI Router

<div align="center">

![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/mlibre/Unified-AI-Router/main?label=Unified%20AI%20Router)  
**The OpenAI-Compatible API Server & SDK for Reliable AI Applications**  

*Production-ready Express server and Node.js library with multi-provider AI routing, automatic fallback, and circuit breakers*

</div>

* [🎯 Why Unified AI Router?](#-why-unified-ai-router)
* [⚡ Quick Start](#-quick-start)
  * [📦 1. Installation](#-1-installation)
  * [⚙️ 2. Quick Configuration](#️-2-quick-configuration)
  * [🚀 3. Start Using the Server](#-3-start-using-the-server)
  * [📚 4. Library Usage](#-4-library-usage)
* [⚙️ Configuration](#️-configuration)
  * [🔧 Environment Configuration (`.env`)](#-environment-configuration-env)
  * [🏗️ Provider Configuration (`provider.js`)](#️-provider-configuration-providerjs)
* [🚀 Running Server](#-running-server)
  * [🛠️ Tool Calling Example](#️-tool-calling-example)
* [📋 Supported Providers](#-supported-providers)
* [📚 Library Usage](#-library-usage)
  * [💬 Basic Chat Completion](#-basic-chat-completion)
  * [🌊 Streaming Responses](#-streaming-responses)
  * [🛠️ Tool Calling](#️-tool-calling)
  * [🔀 Multiple API Keys for Load Balancing](#-multiple-api-keys-for-load-balancing)
* [💡 Examples](#-examples)
  * [🏗️ Complete Chat Application](#️-complete-chat-application)
* [🏗️ Architecture Overview](#️-architecture-overview)
* [🚀 Deployment](#-deployment)
  * [🏗️ Render.com Deployment](#️-rendercom-deployment)
* [⚙️ Environment Variables](#️-environment-variables)
* [📊 Comparison with Direct OpenAI API](#-comparison-with-direct-openai-api)
  * [🎯 Using Direct OpenAI API](#-using-direct-openai-api)
  * [🔗 Using Unified AI Router](#-using-unified-ai-router)
* [🏗️ Project Structure](#️-project-structure)
* [🧪 Testing](#-testing)
  * [🧪 Running the Test Suite](#-running-the-test-suite)
* [📄 License](#-license)
* [🔗 Links](#-links)

---

## 🎯 Why Unified AI Router?

Building reliable AI applications shouldn't require choosing between providers or managing complex fallback logic. **Unified AI Router** eliminates the complexity of multi-provider AI integration by providing:

* **🔄 Automatic Failover**: If one provider fails, seamlessly switches to the next
* **🛡️ Circuit Breaker Protection**: Prevents cascading failures across your infrastructure
* **⚡ OpenAI Compatibility**: Drop-in replacement for any OpenAI-compatible client
* **🌐 Multi-Provider Support**: Works with 10+ AI providers and any OpenAI-compatible server
* **🚀 Production Server**: Ready-to-deploy OpenAI-compatible API server with built-in reliability
* **📚 Library Component**: Core AIRouter library for direct integration in your applications

---

## ⚡ Quick Start

Get your first AI response in under 5 minutes:

### 📦 1. Installation

```bash
git clone https://github.com/mlibre/Unified-AI-Router.git
cd Unified-AI-Router
npm install

# Or Using npm (for SDK usage)
npm install unified-ai-router
```

### ⚙️ 2. Quick Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add at least one API key:
# OPENROUTER_API_KEY=...

# edit provider.js
# The server uses provider.js to define which providers to try and in what order
```

### 🚀 3. Start Using the Server

```bash
npm start

# Test it works
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello!"}],
    "model": "no_need" # Model will be managed by provider.js
  }'
```

### 📚 4. Library Usage

If you prefer using the library directly in your code:

```javascript
const AIRouter = require("unified-ai-router");

const providers = [
  {
    name: "openai",
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4",
    apiUrl: "https://api.openai.com/v1"
  },
  {
    name: "openrouter", 
    apiKey: process.env.OPENROUTER_API_KEY,
    model: "anthropic/claude-3.5-sonnet",
    apiUrl: "https://openrouter.ai/api/v1"
  }
];

const llm = new AIRouter(providers);

// Your first AI request!
const response = await llm.chatCompletion([
  { role: "user", content: "Hello! Say something helpful about AI." }
]);

console.log(response.content);
```

---

## ⚙️ Configuration

Before running the server, you must configure both your environment variables and provider settings.

### 🔧 Environment Configuration (`.env`)

Copy the environment template and add your API keys:

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your API keys:
# OPENAI_API_KEY=sk-your-openai-key-here
# OPENROUTER_API_KEY=your-openrouter-key-here
# GEMINI_API_KEY=your-gemini-key-here
# PORT=3000 # Optional: server port (default: 3000)
```

### 🏗️ Provider Configuration (`provider.js`)

The `provider.js` file defines which AI providers to use and in what order. The server will try providers sequentially until one succeeds.

**Basic provider configuration:**

```javascript
module.exports = [
  {
    name: "openrouter",
    apiKey: process.env.OPENROUTER_API_KEY,
    model: "anthropic/claude-3.5-sonnet",
    apiUrl: "https://openrouter.ai/api/v1"
  },
  {
    name: "openai",
    apiKey: process.env.OPENAI_API_KEY,
    model: "model",
    apiUrl: "https://api.openai.com/v1",
    circuitOptions: {
      timeout: 30000,           // 30 second timeout
      errorThresholdPercentage: 50, // Open after 50% failures
      resetTimeout: 300000      // Try again after 5 minutes
    }
  },
  {
    name: "openai-compatible-server",
    apiKey: process.env.SERVER_API_KEY, // Optional: depends on the server
    model: "name",
    apiUrl: "http://localhost:4000/v1" 
  }
  // Add more providers...
];
```

**Configuration options:**

* `name`: Provider identifier for logging and fallback
* `apiKey`: API key from environment variables
* `model`: Default model for this provider
* `apiUrl`: Provider's API base URL
* `circuitOptions`: Advanced reliability settings (optional)

**Provider priority**: Providers are tried in order - if the first fails, it automatically tries the next.

---

## 🚀 Running Server

The server provides a OpenAI-compatible API with all the reliability features built-in.

Start the server:

```bash
# Configure environment
cp .env.example .env

# Edit .env and add your API keys:
# OPENROUTER_API_KEY=your-openrouter-key-here
# PORT=3000 # Optional: server port (default: 3000)

# edit provider.js
# Define which providers to use and in what order
# Example provider.js is provided in the repository

# Start the server
npm start
```

The server provides these endpoints at `http://localhost:3000`:

| Endpoint                    | Description                                  |
| --------------------------- | -------------------------------------------- |
| `POST /v1/chat/completions` | Chat completions (streaming & non-streaming) |
| `POST /chat/completions`    | Alternative chat completions path            |
| `GET /v1/models`            | List available models                        |
| `GET /health`               | Health check endpoint                        |
| `GET /v1/providers/status`  | Provider status and health                   |

### 🛠️ Tool Calling Example

The server supports function calling with streaming responses:

```bash
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "no_need_to_mention",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "how is the weather in mashhad, tehran. use tools"
      }
    ],
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "get_weather",
          "description": "Get the current weather forecast for a given city.",
          "parameters": {
            "type": "object",
            "properties": {
              "city": {
                "type": "string",
                "description": "The name of the city (e.g., Tehran) to get the weather for."
              }
            },
            "required": ["city"],
            "additionalProperties": false
          },
          "strict": true
        }
      }
    ],
    "temperature": 0.7,
    "stream": true
  }'
```

---

## 📋 Supported Providers

| Provider                     | API Base URL                                               | Model Examples                     |
| ---------------------------- | ---------------------------------------------------------- | ---------------------------------- |
| OpenAI                       | `https://api.openai.com/v1`                                | `gpt-4`, `gpt-3.5-turbo`           |
| OpenRouter                   | `https://openrouter.ai/api/v1`                             | `anthropic/claude-3.5-sonnet`      |
| Groq                         | `https://api.groq.com/openai/v1`                           | `llama-3.1-70b-versatile`          |
| Google Gemini                | `https://generativelanguage.googleapis.com/v1beta/openai/` | `gemini-2.5-pro`                   |
| Cohere                       | `https://api.cohere.ai/v1`                                 | `command-r-plus`                   |
| Any OpenAI-Compatible Server | `http://server-url/`                                       | Any model supported by your server |
| Cerebras                     | `https://api.cerebras.ai/v1`                               | `llama3.1-70b`                     |

**Get API Keys:**

* **OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
* **OpenRouter**: [openrouter.ai/keys](https://openrouter.ai/keys)
* **Grok**: [console.x.ai](https://console.x.ai/)
* **Google Gemini**: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
* **Cohere**: [dashboard.cohere.com/api-keys](https://dashboard.cohere.com/api-keys)
* **Cerebras**: [cloud.cerebras.ai](https://cloud.cerebras.ai)
* **Any OpenAI-Compatible Server**: LiteLLM, custom proxies, or any OpenAI-compatible endpoint

---

## 📚 Library Usage

### 💬 Basic Chat Completion

```javascript
const AIRouter = require("unified-ai-router");
require("dotenv").config();

const providers = [
  {
    name: "openai",
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4",
    apiUrl: "https://api.openai.com/v1"
  }
];

const llm = new AIRouter(providers);

const messages = [
  { role: "system", content: "You are a helpful coding assistant." },
  { role: "user", content: "Write a function to reverse a string in JavaScript." }
];

const response = await llm.chatCompletion(messages, {
  temperature: 0.7,
  max_tokens: 500
});

console.log(response.content);
```

### 🌊 Streaming Responses

```javascript
const stream = await llm.chatCompletion(messages, {
  temperature: 0.7,
  stream: true  // Enable streaming
});

for await (const chunk of stream) {
  if (chunk.content) {
    process.stdout.write(chunk.content);
  }
}
```

### 🛠️ Tool Calling

```javascript
const tools = [
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "Get current weather for a location",
      parameters: {
        type: "object",
        properties: {
          location: { type: "string", description: "City name" }
        }
      }
    }
  }
];

const response = await llm.chatCompletion(messages, {
  tools: tools,
  tool_choice: "auto"
});

console.log(response.tool_calls);
```

### 🔀 Multiple API Keys for Load Balancing

```javascript
const providers = [
  {
    name: "openai",
    apiKey: [  // Array of API keys
      process.env.OPENAI_API_KEY_1,
      process.env.OPENAI_API_KEY_2,
      process.env.OPENAI_API_KEY_3
    ],
    model: "gpt-4",
    apiUrl: "https://api.openai.com/v1"
  }
];
```

## 💡 Examples

### 🏗️ Complete Chat Application

```javascript
const AIRouter = require("unified-ai-router");
require("dotenv").config();

class ChatApp {
  constructor() {
    const providers = require("./provider"); // Your provider config
    this.llm = new AIRouter(providers);
    this.conversationHistory = [];
  }

  async chat(userMessage) {
    this.conversationHistory.push({
      role: "user",
      content: userMessage
    });

    try {
      const response = await this.llm.chatCompletion(
        this.conversationHistory,
        {
          temperature: 0.8,
          max_tokens: 1000
        }
      );

      this.conversationHistory.push({
        role: "assistant",
        content: response.content
      });

      return response.content;
    } catch (error) {
      console.error("All providers failed:", error.message);
      return "I'm sorry, I'm having trouble connecting to AI services right now.";
    }
  }
}

// Usage
const chat = new ChatApp();
const reply = await chat.chat("What's the weather like today?");
console.log(reply);
```

---

## 🏗️ Architecture Overview

Unified AI Router follows a **fail-fast, quick-recovery** architecture:

```text
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Your App      │───▶│  OpenAI Server   │───▶│     AIRouter     │
│   (Any Client)  │    │   (Main Entry)   │    │   (Library)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌──────────────────┐
                                               │   Circuit        │
                                               │   Breakers       │
                                               └──────────────────┘
                                                        │
                                                        ▼
                                               ┌──────────────────┐    ┌─────────────────┐
                                               │   Fallback       │───▶│  Provider 1     │
                                               │   Logic          │    │  (OpenAI/etc)   │
                                               └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌──────────────────┐    ┌─────────────────┐
                                               │   Provider N     │    │  Provider N     │
                                               │   (Final Try)    │    │  (Last Resort)  │
                                               └──────────────────┘    └─────────────────┘
```

---

## 🚀 Deployment

### 🏗️ Render.com Deployment

1. **Dashboard Method:**

   ```bash
   # Push to GitHub first
   git push origin main
   
   # Then on Render.com:
   # 1. Create Web Service
   # 2. Connect repository
   # 3. Set Build Command: npm install
   # 4. Set Start Command: npm start
   # 5. Add environment variables (API keys)
   # 6. Deploy
   ```

2. **Verify Deployment:**

   ```bash
   curl https://your-app.onrender.com/health
   curl https://your-app.onrender.com/models
   ```

## ⚙️ Environment Variables

Required API keys (add only what you need):

```bash
# Primary providers
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
OPENROUTER_API_KEY=...

# Backup providers  
QROQ_API_KEY=...
CEREBRAS_API_KEY=...
COHERE_API_KEY=...

# Load balancing (multiple keys for same provider)
OPENAI_API_KEY_1=sk-...
OPENAI_API_KEY_2=sk-...
OPENAI_API_KEY_3=sk-...
```

## 📊 Comparison with Direct OpenAI API

### 🎯 Using Direct OpenAI API

```javascript
const OpenAI = require("openai");
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const response = await client.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "Hello" }]
});

// ❌ No fallback - fails if OpenAI is down
// ❌ No circuit breaker - failures cascade
// ❌ No multi-provider support
```

### 🔗 Using Unified AI Router

```javascript
const AIRouter = require("unified-ai-router");

const providers = [
  { name: "openai", apiKey: process.env.OPENAI_API_KEY, model: "gpt-4" },
  { name: "backup", apiKey: process.env.BACKUP_KEY, model: "claude-3" }
];

const llm = new AIRouter(providers);
const response = await llm.chatCompletion([{ role: "user", content: "Hello" }]);

// ✅ Automatic fallback if OpenAI fails
// ✅ Circuit breaker protection
// ✅ Multi-provider load balancing
// ✅ Same API interface as OpenAI
// ✅ Production-ready reliability
```

---

## 🏗️ Project Structure

```bash
Unified-AI-Router/
├── openai-server.js     # 🚀 OpenAI-compatible server (MAIN COMPONENT)
├── main.js              # Core AIRouter library
├── provider.js          # Provider configurations
├── package.json         # Dependencies and scripts
├── .env.example         # Environment template
├── tests/               # Test suite
│   ├── openai-server-stream.js     # Server streaming tests
│   ├── openai-server-non-stream.js # Server non-streaming tests
│   ├── chat.js          # Library tests
│   └── tools.js         # Tool calling tests
└── docs/                # VitePress documentation
    ├── index.md
    ├── quickstart.md
    └── configuration.md
```

---

## 🧪 Testing

The project includes comprehensive tests covering:

* **Library Functionality**: Core AIRouter class testing
* **Server Endpoints**: OpenAI-compatible API testing
* **Streaming Support**: Real-time response handling
* **Tool Calling**: Function calling capabilities
* **Error Handling**: Failure scenarios and fallbacks

### 🧪 Running the Test Suite

```bash
# Install dependencies
npm install

# Run individual tests
node tests/chat.js                    # Basic chat functionality
node tests/openai-server-non-stream.js # Server non-streaming
node tests/openai-server-stream.js     # Server streaming
node tests/tools.js                    # Tool calling

# Expected output: AI responses and success logs
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

* **Documentation**: [https://mlibre.github.io/Unified-AI-Router/](https://mlibre.github.io/Unified-AI-Router/)
* **Repository**: [https://github.com/mlibre/Unified-AI-Router](https://github.com/mlibre/Unified-AI-Router)
* **Issues**: [https://github.com/mlibre/Unified-AI-Router/issues](https://github.com/mlibre/Unified-AI-Router/issues)
* **NPM Package**: [https://www.npmjs.com/package/unified-ai-router](https://www.npmjs.com/package/unified-ai-router)

---

<div align="center">

**[⬆ Back to Top](#-unified-ai-router)**

Made with ❤️ by [mlibre](https://github.com/mlibre)

</div>
