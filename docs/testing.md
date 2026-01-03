# Testing

Comprehensive testing guide for Unified AI Router.

## Test Overview

The project includes tests for both the AIRouter library and the OpenAI-compatible server endpoints.

## Running Tests

### Prerequisites

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your API keys to .env
```

### Start the Server

```bash
# Start server in background
npm start &
```

### Chat Completions Tests

```bash
# Basic chat functionality (streaming)
node tests/chat/chat.js

# Server non-streaming chat completions
node tests/chat/server-non-stream.js

# Server streaming chat completions
node tests/chat/server-stream.js

# Chat tool calling with library
node tests/chat/tool-calling.js
```

### Responses API Tests

```bash
# Basic responses API via server
node tests/responses/server-responses.js

# Multi-turn conversation via server
node tests/responses/server-conversation-basic.js

# Conversation tool calling using library
node tests/responses/conversation-tool-calling.js

# Responses API tool calling via server
node tests/responses/server-tool-calling.js
```
