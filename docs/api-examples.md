# 🚀 API Examples

Complete examples for Chat Completions and Responses API with streaming and tool calling.

## 💬 Chat Completions

### Basic Request

```bash
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "any-model",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello!"}
    ],
    "temperature": 0.7,
    "stream": false
  }'
```

### Streaming Response

```bash
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "any-model",
    "messages": [{"role": "user", "content": "Say hello in exactly 3 words."}],
    "stream": true
  }' \
  --no-buffer
```

### Tool Calling

```bash
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "no_need",
    "messages": [{"role": "user", "content": "How is weather in Tehran? Use tools."}],
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "get_weather",
          "description": "Get weather for a city",
          "parameters": {
            "type": "object",
            "properties": {
              "city": {"type": "string", "description": "City name"}
            },
            "required": ["city"]
          },
          "strict": true
        }
      }
    ],
    "stream": true
  }'
```

## Responses API

### Basic Request

```bash
curl -X POST http://localhost:3000/v1/responses \
  -H "Content-Type: application/json" \
  -d '{
    "model": "any-model",
    "input": "Tell me about AI.",
    "temperature": 0.7
  }'
```

### Streaming Response

```bash
curl -X POST http://localhost:3000/v1/responses \
  -H "Content-Type: application/json" \
  -d '{
    "model": "any-model",
    "input": "Write a short poem.",
    "stream": true
  }' \
  --no-buffer
```

### Tool Calling

```bash
curl -X POST http://localhost:3000/v1/responses \
  -H "Content-Type: application/json" \
  -d '{
    "model": "no_need",
    "input": "Calculate 15% tip on $85 and check weather in Tehran.",
    "tools": [
      {
        "type": "function",
        "name": "calculate_tip",
        "description": "Calculate tip amount",
        "parameters": {
          "type": "object",
          "properties": {
            "amount": {"type": "number"},
            "percentage": {"type": "number"}
          },
          "required": ["amount", "percentage"]
        }
      },
      {
        "type": "function",
        "name": "get_weather",
        "description": "Get weather for a city",
        "parameters": {
          "type": "object",
          "properties": {
            "city": {"type": "string"}
          },
          "required": ["city"]
        }
      }
    ]
  }'
```
