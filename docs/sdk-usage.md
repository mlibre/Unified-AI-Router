# 📚 SDK Usage

Use the AIRouter library directly in your Node.js applications.

## 📦 Installation

```bash
npm install unified-ai-router
```

## ⚙️ Basic Setup

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
    name: "openrouter", 
    apiKey: process.env.OPENROUTER_API_KEY,
    model: "mistralai/devstral-2512:free",
    apiUrl: "https://openrouter.ai/api/v1"
  }
];

const llm = new AIRouter(providers);
```

## 💬 Chat Completions

### Basic Usage

```javascript
const messages = [
  { role: "system", content: "You are a helpful coding assistant." },
  { role: "user", "Write a function to reverse a string in JavaScript." }
];

const response = await llm.chatCompletion(messages, {
  temperature: 0.7,
  max_tokens: 500
});

console.log(response.content);
```

### 🌊 Streaming

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

## 🗣️ Responses API

### Basic Usage

```javascript
const response = await llm.responses(
  "Tell me about artificial intelligence.",
  {
    temperature: 0.7,
    max_tokens: 500
  }
);

console.log(response.output_text);
```

### 🌊 Streaming

```javascript
const stream = await llm.responses(
  "Write a poem about coding.",
  {
    stream: true
  }
);

for await (const chunk of stream) {
  if (chunk.type === 'response.output_text.delta') {
    process.stdout.write(chunk.delta);
  }
}
```

### 🔄 Multi-turn Conversations

```javascript
// Initialize conversation
let input = [
  { role: "user", content: "I need help with JavaScript." }
];

let response = await llm.responses(input);
console.log(response.output_text);

// Continue conversation with context
input.push(
  { role: "user", content: "Can you show me a closure example?" }
);

response = await llm.responses(input);
console.log(response.output_text);
```

## 🔀 Load Balancing

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
