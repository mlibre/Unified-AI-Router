# Configuration

This page focuses on how to configure the router for local development and production deployments: setting environment variables (`.env`) and customizing `provider.js`.

## Goals

* Explain which environment variables the project expects and best practices for storing them.
* Show how to author `provider.js` entries: enabling/disabling providers, ordering (fallback), and useful fields.
* Provide examples for local, staging, and cloud deployments (Render.com, ...).
* Troubleshooting tips when providers fail or models are not found.

## .env (environment variables)

The repository includes a `.env.example` file with common keys. Copy it to `.env` and fill the keys for the providers you plan to use:

```bash
cp .env.example .env
# edit .env and paste your API keys
```

### Typical keys

* `OPENAI_API_KEY` — OpenAI API key
* `GEMINI_API_KEY` — Google Gemini API key
* `OPENROUTER_API_KEY` — OpenRouter key
* `COHERE_API_KEY`, `CEREBRAS_API_KEY`, `ZAI_API_KEY`, `GROK_API_KEY`, `QROQ_API_KEY`, `LLM7_API_KEY` — other providers
* `PORT` — optional, default 3000

> Tip: use descriptive names and, when you need multiple keys for the same provider (e.g. multiple OpenRouter accounts), use suffixes like `OPENROUTER_API_KEY`, `OPENROUTER_API_KEY_2` and reference them from `provider.js`.

### Security & deployment

* Do **not** commit `.env` to Git. It is in `.gitignore` by default.
* For cloud deployments, set the same variables in your provider’s environment configuration (Render, etc.).
* Rotate keys regularly and use least-privileged keys where provider supports them.

## `provider.js` — how it works

`provider.js` exports an **ordered array** of provider configuration objects. The router will attempt each provider in array order and fall back automatically if one fails.

Each provider object supports (at minimum) these fields:

```js
{
  name: "openai",               // simple identifier for logs/debug
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4",               // model id to request from this provider
  apiUrl: "https://api.openai.com/v1", // base URL for provider-compatible OpenAI endpoints,
}
```

### Circuit Breaker Configuration

The router includes built-in circuit breaker protection for each provider using the "opossum" library. This provides fault tolerance by automatically stopping requests to a provider that's experiencing issues and preventing cascading failures.

Default circuit breaker options:

* **timeout**: 300000ms (5 minutes) - time before action is considered failed
* **errorThresholdPercentage**: 50% - percentage of failures before opening the circuit
* **resetTimeout**: 9000000ms (15 minutes) - time to wait before trying the provider again  

You can override these options per provider by passing `circuitOptions`.

### Important notes

* `apiKey` should reference the environment variable (use `process.env.X`). If the env var is missing the router will skip that provider and log a warning.
* `model` should match the provider’s model name exactly. If a provider uses a different naming scheme, use the exact ID that the provider’s API expects.
* `apiUrl` is used to create the OpenAI-compatible client; if a provider exposes a compatibility endpoint (like OpenRouter), set it accordingly.
* Duplicate `name` values are allowed but can make logs confusing; prefer unique names like `openai`, `openai-alt`.

### Example `provider.js` snippet

```js
module.exports = [
  {
    name: "openai",
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4.1-mini-2025-04-14",
    apiUrl: "https://api.openai.com/v1",
  },
  {
    name: "google-gemini",
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-2.5-pro",
    apiUrl: "https://generativelanguage.googleapis.com/v1beta/openai/",
  },
  {
    name: "openrouter",
    apiKey: process.env.OPENROUTER_API_KEY,
    model: "x-ai/grok-4-fast:free",
    apiUrl: "https://openrouter.ai/api/v1",
  }
];
```

### To add multiple keys for the same provider

```js
// use different env vars and list providers multiple times (the router will try them in order)
{
  name: "openrouter",
  apiKey: process.env.OPENROUTER_API_KEY, // primary
  model: "x-ai/grok-4-fast:free",
  apiUrl: "https://openrouter.ai/api/v1",
},
{
  name: "openrouter-alt",
  apiKey: process.env.OPENROUTER_API_KEY_2, // fallback / alternative account
  model: "z-ai/glm-4.5-air:free",
  apiUrl: "https://openrouter.ai/api/v1",
}
```

## Model selection and compatibility

* Choose a `model` that the provider actually exposes. The router attempts to list models via the provider client using `client.models.list()` — if the model is not found it will warn in logs.
* Some providers require different model name formats (e.g. `models/gpt-4` vs `gpt-4`). If in doubt, query the provider’s models endpoint or check their docs.

## Tool-calling and streaming

* If you plan to use **tools** (the project supports OpenAI-style tool metadata), pass `tools` into `chatCompletion` calls and make sure the chosen provider supports tool-calling. Not all providers do.
* Streaming is enabled by passing `stream: true` to the endpoint or API call. Ensure the provider supports SSE/streaming and model supports streaming.

## Local testing & examples

* Non-streaming test:

```bash
node tests/openai-server-non-stream.js
```

* Streaming test:

```bash
node tests/openai-server-stream.js
```

* Library-level test (direct router):

```bash
node tests/chat.js
```

## Deployment tips

* **Render**: Add the same env variables to service settings. Use `npm start` as the start command (project `package.json` already sets this).
* If you change `.env` or `provider.js`, restart the Node process.

## Troubleshooting

* `Skipping provider ... due to missing API key` — check `.env` and deployment env configuration.
* `Model <name> not found` — ensure the `model` matches what the provider exposes or remove that provider from `provider.js` until you pick the right model.
* `All providers failed` — examine provider-specific error logs (the router logs each provider failure) and verify network access / API quotas.
