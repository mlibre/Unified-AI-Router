# Unified AI Router Website Specification

## Project Overview

**Project Name**: Unified AI Router Website
**Purpose**: Documentation and landing page for OpenAI-compatible router with automatic fallback
**Target Audience**: Developers, DevOps engineers, SREs
**Technology Stack**: VitePress (Vue.js-based static site generator)

## Core Goals

1. **Developer Education**: Help developers implement OpenAI-compatible router with automatic fallback
2. **Quick Onboarding**: Enable developers to get started in under 5 minutes
3. **Comprehensive Documentation**: Provide configuration and API reference materials
4. **Trust Building**: Demonstrate reliability through circuit breaker explanations

## User Journeys

### Journey 1: Quick Installation (5 minutes)

**User**: Frontend developer needing AI capabilities
**Goal**: Install router via npm and make first API call
**Success Criteria**:

- Can install package with single command
- Can configure basic setup
- Can make successful API call

**Steps**:

1. Land on hero page with clear value proposition
2. Click "Get Started" button
3. Follow 3-step installation guide
4. Copy example code
5. Test with provided curl command

### Journey 2: Multi-Provider Configuration (15 minutes)

**User**: Backend developer integrating multiple AI providers
**Goal**: Configure OpenAI, Gemini, and Grok providers
**Success Criteria**:

- Understand provider configuration format
- Successfully configure multiple providers
- Verify fallback behavior

**Steps**:

1. Navigate to "Configuration" section
2. Review provider configuration examples
3. Copy configuration template
4. Set up API keys in .env file
5. Test provider status endpoint
6. Verify fallback behavior

### Journey 3: Circuit Breaker Understanding (10 minutes)

**User**: SRE or DevOps engineer
**Goal**: Understand circuit breaker logic for production deployment
**Success Criteria**:

- Understand circuit breaker thresholds
- Know how to monitor provider health
- Can configure circuit breaker settings

**Steps**:

1. Navigate to "Advanced Configuration" section
2. Read circuit breaker explanation
3. Review monitoring endpoints
4. Understand failure scenarios and recovery

## Site Architecture

### Information Architecture

```
/
├── Home (Hero Landing Page)
├── Quickstart
├── Configuration
│   ├── Environment Variables (.env)
│   ├── Provider Configuration (provider.js)
│   ├── Circuit Breaker Settings
│   └── Multi-Provider Setup
├── API Reference
│   ├── /v1/chat/completions
│   ├── /v1/models
│   ├── /health
│   └── /v1/providers/status
├── Providers
│   ├── OpenAI
│   ├── Google Gemini
│   ├── Grok
│   └── Other Providers
└── Deployment
    ├── Local Development
    ├── Render.com
    ├── Docker
    └── Kubernetes
```

### Navigation Structure

**Primary Navigation**:

- Home
- Quickstart
- Configuration
- API Reference
- Providers
- Deployment

## Page Specifications

### 1. Hero Landing Page

**Purpose**: Capture attention, communicate value, drive to quickstart

**Content Sections**:

#### Hero Section

- **Headline**: "Unified AI Router: Multi-Provider Fallback for Reliable AI"
- **Subheadline**: "OpenAI-compatible server with automatic fallback, circuit breaker protection, and zero-downtime AI"
- **Primary CTA**: "Get Started →" (links to Quickstart)
- **Secondary CTA**: "View on GitHub" (links to repo)

#### Feature Highlights (3-column grid)

1. **Multi-Provider Fallback**: "If one provider fails, automatically try the next"
2. **Circuit Breaker Protection**: "Built-in fault tolerance prevents cascading failures"
3. **OpenAI Compatible**: "Drop-in replacement for OpenAI API endpoints"

#### Code Example Preview

```javascript
const AIRouter = require("unified-ai-router");
const router = new AIRouter([
  { name: "openai", apiKey: process.env.OPENAI_KEY, model: "gpt-4" },
  { name: "google", apiKey: process.env.GEMINI_KEY, model: "gemini-pro" }
]);

const response = await router.chatCompletion(messages);
```

### 2. Quickstart Guide

**Purpose**: Enable developers to get running in under 5 minutes

**Content Structure**:

#### Installation (Step 1)

```bash
npm install unified-ai-router
# OR
git clone https://github.com/mlibre/Unified-AI-Router
cd Unified-AI-Router
npm install
```

#### Configuration (Step 2)

```javascript
// provider.js
module.exports = [
  {
    name: "openai",
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4",
    apiUrl: "https://api.openai.com/v1"
  }
];
```

#### Running (Step 3)

```bash
npm start
# Server running at http://localhost:3000
```

#### First API Call

```bash
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello!"}],
    "model": "gpt-4"
  }'
```

### 3. Configuration Section

**Purpose**: Detailed configuration guide for complex setups

**Subsections**:

- Environment Variables (.env)
- Provider Configuration (provider.js)
- Circuit Breaker Settings
- Multi-Provider Setup

### 4. API Reference

**Purpose**: Complete API documentation for integration

#### /v1/chat/completions

- **Method**: POST
- **Description**: Chat completion endpoint (streaming and non-streaming)
- **Request Format**: OpenAI-compatible JSON
- **Response Format**: OpenAI-compatible response

#### /v1/models

- **Method**: GET
- **Description**: List available models from all providers
- **Response Format**: Array of model objects

#### /health

- **Method**: GET
- **Description**: Health check endpoint
- **Response**: Status object

#### /v1/providers/status

- **Method**: GET
- **Description**: Check status of all configured providers
- **Response**: Detailed status including circuit breaker state

## Technical Requirements

### Frontend Requirements

- **Framework**: VitePress (Vue.js-based)
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 AA compliance
- **SEO**: Proper meta tags, structured data

### Content Requirements

- **Code Examples**: Working, tested code snippets
- **Downloadable Resources**: Configuration templates, scripts
- **Version Compatibility**: Clear version requirements

### Integration Requirements

- **GitHub Integration**: Links to repository, issues
- **NPM Integration**: Package information, download stats
- **Search**: Full-text search across documentation

## Design System

### Visual Identity

- **Color Scheme**: Professional tech colors (blues, grays, accent colors)
- **Typography**: Clean, readable fonts
- **Icons**: Consistent icon set for features and actions

### Component Library

- **Code Blocks**: Syntax highlighting, copy functionality
- **Tabs**: For showing different language examples
- **Alerts**: Warning, info, success, error states
- **Tables**: For API documentation and configuration options

## Content Strategy

### Tone and Voice

- **Professional**: Technical accuracy and clarity
- **Helpful**: Step-by-step guidance
- **Concise**: No unnecessary information
- **Encouraging**: Positive reinforcement for learning

### Content Types

- **Tutorials**: Step-by-step guides
- **Reference**: API documentation
- **Concepts**: Explanatory content
- **Examples**: Working code samples
- **Troubleshooting**: Problem-solving guides
