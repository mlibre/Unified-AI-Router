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

* `POST /v1/chat/completions` — streaming & non-streaming chat completions
* `POST /chat/completions` — same as above (alternate path)
* `GET /v1/models` & `GET /models` — lists models available from providers
* `GET /health` — health check

## 4) Quick test (non-streaming)

Use `curl` or your HTTP client to test a simple chat completion:

```bash
curl -s -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{ "messages": [{"role":"system","content":"You are a helpful assistant."},{"role":"user","content":"Say hello." }], "model":"gpt-3.5-turbo" }'
```

## 5) Next steps

* Configure additional providers in `provider.js` and set env keys.
* Try streaming by setting `stream: true` when calling the endpoint.
* See `tests/` for example scripts that exercise streaming, non-streaming, and tools.
