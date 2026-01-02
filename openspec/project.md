# Project Context

## Purpose

Unified AI Router is a toolkit providing an OpenAI-compatible server and unified interface for multiple LLM providers with automatic fallback. Ensures reliability and high availability for AI applications.

## Tech Stack

- **Runtime**: Node.js (CommonJS)
- **Server**: Express.js
- **HTTP Client**: Axios
- **Logging**: Pino with Pino-pretty
- **Fault Tolerance**: Opossum (circuit breaker pattern)
- **AI Integration**: OpenAI SDK
- **Documentation**: VitePress
- **Code Quality**: ESLint

## Project Conventions

### Code Style

- **Indentation**: Tabs (not spaces)
- **Quotes**: Double quotes
- **Braces**: Allman style (each brace on new line)
- **Variables**: One declaration per line (`one-var: never`)
- **Spacing**: Spaces before blocks and function parentheses
- **Line Endings**: Unix-style
- **No trailing spaces**

### Architecture Patterns

- **Circuit Breaker**: Fault tolerance with automatic circuit breaking
- **Provider Abstraction**: Unified interface for multiple AI providers
- **Automatic Fallback**: Try next provider on failure
- **OpenAI-Compatible**: Drop-in replacement for OpenAI API
- **Streaming Support**: Both streaming and non-streaming responses

### Testing Strategy

- **Manual Testing**: Node.js test files in `tests/` directory
- **Coverage**: Chat completion, streaming, non-streaming, and tool usage
- **No automated test framework** (simple `npm test` script)

### Git Workflow

- Standard Git workflow (main branch)
- Semantic versioning (current: v3.6.0)
- Conventional commits likely (not explicitly defined)

## Domain Context

**AI Provider Integration**: Supports OpenAI, Google Gemini, Grok, OpenRouter, Qroq, Cohere, Cerebras, LLM7, and any OpenAI-compatible servers.

**Key Features**:

- Multi-provider support with automatic fallback
- Circuit breaker for fault tolerance
- OpenAI-compatible API endpoints
- Streaming and non-streaming responses
- Tool calling support
- Provider health monitoring

## Important Constraints

- **Environment Variables**: Requires API keys in `.env` file
- **Rate Limiting**: Handled through provider-specific configurations
- **Memory**: Express JSON limit set to 50mb
- **Timeout**: 60s client timeout, 300s circuit breaker timeout

## External Dependencies

**AI Providers**:

- OpenAI API
- Google Generative Language API (Gemini)
- OpenRouter API
- Groq API
- Cohere API
- Cerebras API
- LLM7 API
- Other OpenAI-compatible providers

**Infrastructure**:

- Render.com deployment support
- Environment-based configuration
- Health check endpoints
