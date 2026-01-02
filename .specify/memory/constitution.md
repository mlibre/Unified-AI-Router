<!-- Sync Impact Report:
Version change: 1.0.0 → 1.2.0
Modified principles: IV. Simple and Clear Code (enhanced with refactoring guidelines)
Added sections: I. Lightweight Architecture, II. OpenAI-Compatibility, III. Multi-Provider Fallback, IV. Simple and Clear Code, VI. Developer-Centric Documentation
Removed sections: V. Robust and Complete Implementation
Templates requiring updates: ✅ plan-template.md, ✅ spec-template.md, ✅ tasks-template.md
Follow-up TODOs: None
-->
# Unified AI Router Constitution

## Core Principles

### I. Lightweight Architecture

Node.js applications MUST remain lightweight and high-performance. Dependencies MUST be minimal and purposeful. Memory footprint MUST be optimized for serverless and containerized environments. Performance benchmarks MUST be established for critical paths including request routing, provider fallback, and streaming responses.

### II. OpenAI-Compatibility

Project must have OpenAI compatibility endpoints for seamless integration with existing tools and clients API. The OpenAI-Compatibility endpoints MUST support both streaming and non-streaming responses.

### III. Multi-Provider Fallback Reliability

Automatic fallback MUST be implemented for all provider failures including network errors, rate limits, and service outages. Circuit breaker patterns MUST be applied to prevent cascading failures. Provider health checks MUST be performed proactively. Fallback logic MUST be deterministic and transparent to end users.

### IV. Simple and Clear Code

Code MUST be simple, clear, and readable. Complex one-liners MUST be avoided in favor of straightforward, maintainable solutions. Functions MUST have clear naming. Refactoring MUST prioritize readability and robustness over cleverness. If a new solution can be simpler, shorter, and cleaner, refactor the code to achieve this goal.

### VI. Developer-Centric Documentation

All documentation MUST be developer-focused with clear technical explanations. VitePress MUST be used for documentation generation with comprehensive API references. Quickstart guides MUST enable developers to run locally within 5 minutes. Configuration examples MUST cover all supported providers and deployment scenarios.

## Additional Constraints

### Performance Standards

- Request routing MUST complete within 100ms under normal conditions
- Memory usage MUST remain under 100MB for typical workloads
- Startup time MUST be under 5 seconds
- Streaming responses MUST maintain sub-second latency

### Security Requirements

- API keys MUST be stored in environment variables only
- All external requests MUST use HTTPS
- Input validation MUST prevent injection attacks
- Rate limiting MUST be implemented at the provider level

### Testing Requirements

- Unit tests MUST cover all core routing logic
- Integration tests MUST verify multi-provider fallback scenarios
- Contract tests MUST validate OpenAI API compatibility
- Performance tests MUST monitor critical path benchmarks

## Development Workflow

### Versioning Policy

- MAJOR: Breaking changes to API compatibility or core architecture
- MINOR: New providers, features, or non-breaking enhancements
- PATCH: Bug fixes, documentation updates, performance improvements

**Version**: 1.2.0 | **Ratified**: 2026-01-01 | **Last Amended**: 2026-01-01
