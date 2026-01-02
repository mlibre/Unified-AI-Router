# Quickstart — Run locally in minutes

This page walks you through running the OpenAI-compatible server locally and calling the `/v1/chat/completions` endpoint.

## 1) Install

```bash
git clone https://github.com/mlibre/Unified-AI-Router.git
cd Unified-AI-Router
npm install
````

## 2) Configure API keys

Copy the example env file and populate the keys for the providers you want to use:

```bash
cp .env.example .env
# edit .env and add keys (OPENAI_API_KEY, GEMINI_API_KEY, etc.)
```

Edit `provider.js` to enable or reorder providers (the router tries them in array order).

## 3) Start the server

```bash
npm start
```

By default the server listens on `http://localhost:3000` and supports these OpenAI-compatible endpoints:

* `POST /v1/responses` — OpenAI Responses API (streaming & non-streaming)
* `POST /responses` — same as above (alternate path)
* `POST /v1/chat/completions` — streaming & non-streaming chat completions
* `POST /chat/completions` — same as above (alternate path)
* `GET /v1/models` & `GET /models` — lists models available from providers
* `GET /health` — health check

## 4) Chat Completions Test

Use `curl` or your HTTP client to test a simple chat completion:

```bash
curl -s -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{ "messages": [{"role":"system","content":"You are a helpful assistant."},{"role":"user","content":"Say hello." }], "model":"gpt-3.5-turbo" }'
```

## 5) Responses API Test

Test the new Responses API endpoint:

```bash
curl -s -X POST http://localhost:3000/v1/responses \
  -H "Content-Type: application/json" \
  -d '{ "input": "Tell me something interesting about AI.", "model":"gpt-3.5-turbo" }'
```

## 6) Responses API Streaming Test

Test streaming responses:

```bash
curl -s -X POST http://localhost:3000/v1/responses \
  -H "Content-Type: application/json" \
  -d '{ "input": "Say hello in exactly 3 words.", "model":"gpt-3.5-turbo", "stream": true }'
```

## 7) Next steps

* Configure additional providers in `provider.js` and set env keys.
* Try streaming by setting `stream: true` when calling the endpoint.
* See `tests/` for example scripts that exercise streaming, non-streaming, and tools.
