---
layout: home

hero:
  name: "Unified AI Router"
  text: "A lightweight OpenAI-compatible server in Nodejs"
  tagline: "OpenAI-compatible endpoints, automatic fallback, streaming support, and tool-calling — all in one lightweight package."
  actions:
    - theme: brand
      text: Quickstart
      link: /quickstart
    - theme: alt
      text: Configuration
      link: /configuration

features:
  - title: Multi-provider fallback
    details: If one provider fails, requests automatically fall back to the next available provider.
  - title: Circuit breaker protection
    details: Built-in fault tolerance with automatic circuit breaking for each provider to prevent cascading failures.
  - title: OpenAI-compatible API
    details: Run a drop-in replacement for OpenAI endpoints including chat completions and responses API (streaming & non-streaming).
  - title: Tool calling & streaming
    details: Supports tool-calling metadata and SSE streaming to integrate with existing tooling.
  - title: Easy to self-host
    details: Run locally or deploy to cloud host providers.
---
