<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working on this project.

Always open `@/openspec/AGENTS.md` when the request:

- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:

- How to create and apply change proposals  
- Spec format and conventions  
- Project structure and guidelines  

Keep this managed block intact so `openspec update` can refresh the instructions.

<!-- OPENSPEC:END -->

# Core Principles

## I. Lightweight Architecture

Code, logic, and architecture MUST remain lightweight. Dependencies MUST be minimal and purposeful.

## II. Simple and Minimalist Implementation

Code MUST be simple, clear, and readable. Prefer straightforward, maintainable solutions over complex ones.  
Keep the codebase minimal: avoid clever or tricky one-liners in favor of clarity.

## III. Developer-Centric Documentation

All documentation MUST be developer-focused, with clear, concise technical explanations. Quickstart guides MUST enable local setup in under 5 minutes.

# Other Notes

If you make changes, update `package.json` to reflect them.
