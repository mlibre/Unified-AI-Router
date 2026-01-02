<!-- Sync Impact Report
Version change: 1.0.0 → 1.1.0
Modified principles: none
Added sections: Principle VI. Minimal Code
Removed sections: none
Templates requiring updates: ✅ .specify/templates/plan-template.md
Follow-up TODOs: none
-->

# Unified AI Router Constitution

## Core Principles

### I. Lightweight Architecture

Node.js applications MUST remain lightweight and high-performance. Dependencies MUST be minimal and purposeful.

### II. OpenAI-Compatibility

Project must have OpenAI compatibility endpoints for seamless integration. `Chat-Related` endpoints MUST support both streaming and non-streaming responses.

### III. Multi-Provider Fallback Reliability

Automatic fallback MUST be implemented for provider failures. Circuit breaker patterns MUST be applied to prevent cascading failures.

### IV. Simple and Clear Code

Code MUST be simple, clear, and readable. Complex solutions MUST be avoided in favor of straightforward, maintainable code.

### V. Developer-Centric Documentation

All documentation MUST be developer-focused with clear and concise technical explanations. Quickstart guides MUST enable developers to run locally within 5 minutes.

### VI. Minimal Code

Code MUST be kept minimal. Tricky one-liners MUST be avoided in favor of clear, readable alternatives.

## Development Workflow

### Versioning Policy

- MAJOR: Breaking changes to API compatibility or core architecture
- MINOR: New providers, features, or non-breaking enhancements
- PATCH: Bug fixes, documentation updates, performance improvements

**Version**: 1.1.0 | **Ratified**: 2026-01-01 | **Last Amended**: 2026-01-02
