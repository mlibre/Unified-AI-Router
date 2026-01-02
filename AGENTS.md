<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:

- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:

- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# Core Principles

## I. Lightweight Architecture

Applications code, logic and architecture MUST remain lightweight. Dependencies MUST be minimal and purposeful.

## II. Simple and & Minimalist Implementation

Code MUST be simple, clear, and readable. Complex solutions MUST be avoided in favor of straightforward, maintainable code.  
Code MUST be kept minimal. Tricky one-liners MUST be avoided in favor of clear, readable alternatives.

## III. Developer-Centric Documentation

All documentation MUST be developer-focused with clear and concise technical explanations. Quickstart guides MUST enable developers to run locally within 5 minutes.

# Other Notes

If you made changes, update package.json to reflect them.
