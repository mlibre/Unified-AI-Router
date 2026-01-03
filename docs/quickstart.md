# Quickstart

Install, configure, and test in 5 minutes.

## Install

```bash
git clone https://github.com/mlibre/Unified-AI-Router.git
cd Unified-AI-Router
npm install
```

## Configure

```bash
cp .env.example .env
# Edit .env and add OPENROUTER_API_KEY or other provider keys
```

Edit `provider.js` to set your providers.

## Run

```bash
npm start
```

Server starts on `http://localhost:3000` with these endpoints:

- `POST /v1/responses` - OpenAI Responses API
- `POST /v1/chat/completions` - Chat Completions API
- `GET /v1/models` - List models
- `GET /health` - Health check

## Test

**Chat Completions:**

```bash
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role":"user","content":"Hello"}], "model":"no_need"}'
```

**Responses API:**

```bash
curl -X POST http://localhost:3000/v1/responses \
  -H "Content-Type: application/json" \
  -d '{"input": "Hello", "model":"no_need"}'
```

**Streaming:**

```bash
curl -X POST http://localhost:3000/v1/responses \
  -H "Content-Type: application/json" \
  -d '{"input": "Say hello in 3 words", "model":"gpt-3.5-turbo", "stream": true}'
```

## Next

- Configure more providers in [`provider.js`](/configuration#providers)
- Check provider status: `GET /providers/status`
- See [Testing Guide](/testing) for comprehensive testing
- Check out [SDK Usage](/sdk-usage) for library integration
- See [Testing Guide](/testing) for comprehensive testing
- Check out [SDK Usage](/sdk-usage) for library integration
