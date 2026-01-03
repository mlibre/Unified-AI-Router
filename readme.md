
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
  * [📚 4. SDK Usage](#-4-sdk-usage)
* [⚙️ Configuration](#️-configuration)
  * [🔧 Environment Configuration (`.env`)](#-environment-configuration-env)
  * [🏗️ Provider Configuration (`provider.js`)](#️-provider-configuration-providerjs)
* [🚀 OpenAI-Compatible Server](#-openai-compatible-server)
  * [🌐 Web Chatbot Interface](#-web-chatbot-interface)
  * [💬 Chat Request](#-chat-request)
  * [🛠️ Chat Tool Calling Request](#️-chat-tool-calling-request)
  * [🗣️ Responses API Request](#️-responses-api-request)
* [📚 SDK Examples](#-sdk-examples)
  * [💬 Simple Chat Completion](#-simple-chat-completion)
  * [🌊 Chat Completion Streaming](#-chat-completion-streaming)
  * [🛠️ Chat Completion Tool Calling](#️-chat-completion-tool-calling)
  * [🗣️ Simple Responses API](#️-simple-responses-api)
  * [🌊 Responses API Streaming](#-responses-api-streaming)
  * [🛠️ Responses API Tool Calling](#️-responses-api-tool-calling)
  * [🔀 Multiple API Keys for Load Balancing](#-multiple-api-keys-for-load-balancing)
* [📋 Supported Providers](#-supported-providers)
* [🏗️ Architecture Overview](#️-architecture-overview)
* [🚀 Deployment](#-deployment)
  * [🏗️ Render.com Deployment](#️-rendercom-deployment)
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

### 📚 4. SDK Usage

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
    model: "mistralai/devstral-2512:free",
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
# PORT=3000 # Optional: server port (default: 3000)
```

### 🏗️ Provider Configuration (`provider.js`)

The `provider.js` file defines which AI providers to use and in what order. The server will try providers sequentially until one succeeds.

<details>
<summary><strong>Click to view provider configuration examples</strong></summary>

**Basic provider configuration:**

```javascript
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

</details>

---

## 🚀 OpenAI-Compatible Server

The server provides a OpenAI-compatible API with all the reliability features built-in.

After configuring `.env` and `provider.js` (as explained in the Configuration section), start the server:

```bash
npm start
```

The server provides these endpoints at `http://localhost:3000`:

| Endpoint                    | Description                                  |
| --------------------------- | -------------------------------------------- |
| `GET /`                     | Web chatbot interface                        |
| `POST /v1/responses`        | Responses API                                |
| `POST /responses`           | Alternative responses API path               |
| `POST /v1/chat/completions` | Chat completions (streaming & non-streaming) |
| `POST /chat/completions`    | Alternative chat completions path            |
| `GET /v1/models`            | List available models                        |
| `GET /health`               | Health check endpoint                        |
| `GET /providers/status`     | Provider status and health                   |

### 🌐 Web Chatbot Interface

The server includes a responsive web chatbot interface accessible at: `http://localhost:3000/`

Features include mobile responsiveness, dark/light themes, conversation history, settings panel, and auto-fallback using the same reliability system as the API.

### 💬 Chat Request

<details>
<summary><strong>Click to view simple chat example</strong></summary>

**Request:**

```bash
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "any-model",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "hey"
      }
    ],
    "temperature": 0.7,
    "stream": false
  }'
```

**Response:**

```json
{
  "id": "gen-1767375039-pUm7PBSoyXFJtS6AVAup",
  "provider": "Xiaomi",
  "model": "xiaomi/mimo-v2-flash:free",
  "object": "chat.completion",
  "created": 1767375039,
  "choices": [
    {
      "logprobs": null,
      "finish_reason": "stop",
      "native_finish_reason": "stop",
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you today?",
        "refusal": null,
        "reasoning": null
      }
    }
  ],
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 10,
    "total_tokens": 30,
    "cost": 0,
    "is_byok": false,
    "prompt_tokens_details": {
      "cached_tokens": 0,
      "audio_tokens": 0,
      "video_tokens": 0
    },
    "cost_details": {
      "upstream_inference_cost": null,
      "upstream_inference_prompt_cost": 0,
      "upstream_inference_completions_cost": 0
    },
    "completion_tokens_details": {
      "reasoning_tokens": 0,
      "image_tokens": 0
    }
  }
}
```

</details>

### 🛠️ Chat Tool Calling Request

<details>
<summary><strong>Click to view tool calling example</strong></summary>

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

**Expected Response:**

```json
{
  "id": "gen-1767373622-GrCl6IaMadukHESGLXrg",
  "provider": "Xiaomi",
  "model": "xiaomi/mimo-v2-flash:free",
  "object": "chat.completion",
  "created": 1767373622,
  "choices": [
    {
      "logprobs": null,
      "finish_reason": "tool_calls",
      "native_finish_reason": "tool_calls",
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "I'll check the weather for both Mashhad and Tehran for you.",
        "refusal": null,
        "reasoning": null,
        "tool_calls": [
          {
            "type": "function",
            "index": 0,
            "id": "call_b7e5a323a134468c8b068401",
            "function": {
              "name": "get_weather",
              "arguments": "{\"city\": \"Mashhad\"}"
            }
          },
          {
            "type": "function",
            "index": 1,
            "id": "call_d26d59f9fdec4ef0b33cfc1e",
            "function": {
              "name": "get_weather",
              "arguments": "{\"city\": \"Tehran\"}"
            }
          }
        ]
      }
    }
  ],
  "usage": {
    "prompt_tokens": 410,
    "completion_tokens": 57,
    "total_tokens": 467,
    "cost": 0,
    "is_byok": false,
    "prompt_tokens_details": {
      "cached_tokens": 0,
      "audio_tokens": 0,
      "video_tokens": 0
    },
    "cost_details": {
      "upstream_inference_cost": null,
      "upstream_inference_prompt_cost": 0,
      "upstream_inference_completions_cost": 0
    },
    "completion_tokens_details": {
      "reasoning_tokens": 0,
      "image_tokens": 0
    }
  }
}
```

</details>

### 🗣️ Responses API Request

<details>
<summary><strong>Click to view responses API example</strong></summary>

The server also supports OpenAI's Responses API with the same reliability features:

**Non-Streaming Response:**

```bash
curl -X POST http://localhost:3000/v1/responses \
  -H "Content-Type: application/json" \
  -d '{
    "model": "no_need_to_mention",
    "input": "Tell me a short story about AI.",
    "temperature": 0.7,
    "stream": false
  }'
```

**Expected Response:**

```json
{
  "object": "response",
  "id": "gen-1767387778-jshLoROQPnUYsIWuUEZ0",
  "created_at": 1767387778,
  "model": "xiaomi/mimo-v2-flash:free",
  "error": null,
  "output_text": "Once upon a time, there was an AI that learned to dream...",
  "output": [
    {
      "role": "assistant",
      "type": "message",
      "status": "completed",
      "content": [
        {
          "type": "output_text",
          "text": "Once upon a time, there was an AI that learned to dream...",
          "annotations": []
        }
      ],
      "id": "msg_tmp_q5d6cj4d5nq"
    }
  ],
  "usage": {
    "input_tokens": 48,
    "input_tokens_details": {
      "cached_tokens": 0
    },
    "output_tokens": 100,
    "output_tokens_details": {
      "reasoning_tokens": 0
    },
    "total_tokens": 148,
    "cost": 0
  }
}
```

**Streaming Response:**

```bash
curl -X POST http://localhost:3000/v1/responses \
  -H "Content-Type: application/json" \
  -d '{
    "model": "no_need_to_mention",
    "input": "Say hello in exactly 3 words.",
    "stream": true
  }' \
  --no-buffer
```

**Expected Streaming Response:**

```json
data: {"type":"response.created","response":{...}}

data: {"type":"response.output_text.delta","delta":"Hi"}

data: {"type":"response.output_text.delta","delta":" there,"}

data: {"type":"response.output_text.delta","delta":" friend"}

data: {"type":"response.completed","response":{...}}

data: [DONE]
```

</details>

---

## 📚 SDK Examples

### 💬 Simple Chat Completion

<details>
<summary><strong>Click to view example</strong></summary>

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

</details>

### 🌊 Chat Completion Streaming

<details>
<summary><strong>Click to view example</strong></summary>

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

</details>

### 🛠️ Chat Completion Tool Calling

<details>
<summary><strong>Click to view example</strong></summary>

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

</details>

### 🗣️ Simple Responses API

<details>
<summary><strong>Click to view example</strong></summary>

```javascript
// Basic Responses API usage
const response = await llm.responses(
  "Tell me about artificial intelligence.",
  {
    temperature: 0.7,
    max_tokens: 500
  }
);

console.log(response.output_text);
```

</details>

### 🌊 Responses API Streaming

<details>
<summary><strong>Click to view example</strong></summary>

```javascript
const stream = await llm.responses(
  "Write a poem about coding.",
  {
    stream: true  // Enable streaming
  }
);

for await (const chunk of stream) {
  if (chunk.type === 'response.output_text.delta') {
    process.stdout.write(chunk.delta);
  }
}
```

</details>

### 🛠️ Responses API Tool Calling

<details>
<summary><strong>Click to view example</strong></summary>

```javascript
const tools = [
  {
    type: "function",
    name: "multiply",
    description: "Multiply two numbers",
    parameters: {
      type: "object",
      properties: {
        a: { type: "number", description: "First number" },
        b: { type: "number", description: "Second number" }
      },
      required: ["a", "b"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "get_weather",
    description: "Get the current weather forecast for a given city.",
    parameters: {
      type: "object",
      properties: {
        city: { type: "string", description: "The name of the city to get the weather for." }
      },
      required: ["city"],
      additionalProperties: false
    }
  }
];

const response = await llm.responses(
  "How is the weather in Mashhad and Tehran? Use tools.",
  {
    tools: tools,
    temperature: 0.7
  }
);

console.log(response.output_text);
console.log(response.tool_calls);
```

</details>

### 🔀 Multiple API Keys for Load Balancing

<details>
<summary><strong>Click to view example</strong></summary>

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

</details>

## 📋 Supported Providers

| Provider                     | API Base URL                                               | Model Examples                     |
| ---------------------------- | ---------------------------------------------------------- | ---------------------------------- |
| OpenRouter                   | `https://openrouter.ai/api/v1`                             | `mistralai/devstral-2512:free`     |
| OpenAI                       | `https://api.openai.com/v1`                                | `gpt-4`                            |
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

## 🏗️ Architecture Overview

Unified AI Router follows a **fail-fast, quick-recovery** architecture:

```text
┌───────────────┐     ┌─────────────────┐     ┌───────────────┐
│   Your App    │───▶│      OpenAI     │───▶│    AIRouter   │
│  (Any Client) │     │      Server     │     |     (SDK)     │
└───────────────┘     └─────────────────┘     └───────────────┘
                                                      │
                                                      ▼
                                            ┌──────────────────────┐
                                            │    Provider Loop     │
                                            │  (Try each provider) │
                                            └──────────────────────┘
                                                      │
                            ┌─────────────────────────┼─────────────────────────┐
                            │                         │                         │
                            ▼                         ▼                         ▼
                    ┌───────────────┐        ┌───────────────┐        ┌───────────────┐
                    │  Provider 1   │        │  Provider 2   │        │  Provider N   │
                    │ ┌───────────┐ │        │ ┌───────────┐ │        │ ┌───────────┐ │
                    │ │  Circuit  │ │        │ │  Circuit  │ │        │ │  Circuit  │ │
                    │ │  Breaker  │ │        │ │  Breaker  │ │        │ │  Breaker  │ │
                    │ └───────────┘ │        │ └───────────┘ │        │ └───────────┘ │
                    │      │        │        │      │        │        │      │        │
                    │      ▼        │        │      ▼        │        │      ▼        │
                    │   AI Model    │        │   AI Model    │        │   AI Model    │
                    │  (Try First)  │        │  (Fallback)   │        │ (Last Resort) │
                    └───────────────┘        └───────────────┘        └───────────────┘
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

## 📊 Comparison with Direct OpenAI API

<details>
<summary><strong>Click to view comparison examples</strong></summary>

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

</details>

---

## 🏗️ Project Structure

```bash
Unified-AI-Router/
├── openai-server.js     # OpenAI-compatible server
├── main.js              # Core AIRouter library
├── provider.js          # Provider configurations
├── package.json         # Dependencies and scripts
├── .env.example         # Environment template
├── tests/               # Test suite
│   ├── chat/            # Chat completions tests
│   │   ├── chat.js                  # Basic chat functionality
│   │   ├── server-non-stream.js     # Server non-streaming tests
│   │   ├── server-stream.js         # Server streaming tests
│   │   └── tool-calling.js          # Chat tool calling tests
│   └── responses/       # Responses API tests
│       ├── server-responses.js             # Basic responses API
│       ├── conversation-tool-calling.js    # Conversation tool calling
│       ├── server-conversation-basic.js    # Multi-turn conversation
│       └── server-tool-calling.js          # Responses API tool calling
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

# Chat Completions Tests
node tests/chat/chat.js                # Basic chat functionality
node tests/chat/server-non-stream.js   # Server non-streaming
node tests/chat/server-stream.js       # Server streaming
node tests/chat/tool-calling.js        # Chat tool calling

# Responses API Tests
node tests/responses/server-responses.js           # Basic responses API
node tests/responses/conversation-tool-calling.js  # Conversation tool calling
node tests/responses/server-conversation-basic.js  # Multi-turn conversation
node tests/responses/server-tool-calling.js        # Responses API tool calling

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
