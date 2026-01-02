# Unified AI Router Website - Technical Specifications

## Overview

This document provides detailed technical specifications for implementing the Unified AI Router website using VitePress. It includes file structure, component specifications, API integration details, and deployment requirements.

## Technology Stack

### Core Technologies

- **Framework**: VitePress 2.0+ (Markdown-based static site generator)
- **Build Tool**: Vite 5.0+
- **Language**: Markdown with frontmatter
- **Styling**: CSS with optional Vue components
- **Deployment**: Static site hosting (GitHub Pages, Vercel, Netlify, etc.)

### Dependencies

```json
{
  "devDependencies": {
    "vitepress": "^2.0.0-alpha.15"
  }
}
```

## File Structure Specification

### Root Directory Structure

```
docs/
├── .vitepress/
│   ├── config.mjs          # Main configuration file
│   ├── theme/             # Custom theme components (optional)
│   │   ├── index.js       # Theme entry point
│   │   └── components/    # Custom components (optional)
│   │       ├── ApiTester.vue
│   │       ├── ConfigGenerator.vue
│   │       └── ProviderStatus.vue
│   └── dist/              # Built files (generated)
├── public/                # Static assets
│   ├── favicon.png
│   ├── favicon_io/        # Favicon files
│   ├── images/           # Documentation images
│   │   ├── architecture.png
│   │   ├── circuit-breaker.png
│   │   └── provider-flow.png
│   └── scripts/          # Client-side scripts (optional)
│       └── api-tester.js
├── index.md              # Hero landing page
├── quickstart.md         # Quickstart guide
├── configuration.md      # Configuration documentation
├── api-reference/        # API documentation
│   ├── index.md
│   ├── chat-completions.md
│   ├── models.md
│   ├── health.md
│   └── providers-status.md
├── providers/            # Provider documentation
│   ├── index.md
│   ├── openai.md
│   ├── google-gemini.md
│   ├── grok.md
│   ├── openrouter.md
│   └── other-providers.md
└── deployment/           # Deployment guides
    ├── index.md
    ├── local.md
    ├── render.md
    ├── docker.md
    └── kubernetes.md
```

## Component Specifications

### Note on Vue Components

VitePress is primarily a Markdown-based static site generator that works with pure Markdown files. Vue components are optional and only needed for interactive features. The website can be fully functional using only Markdown files with frontmatter.

### Optional Interactive Components

If interactive features are desired, Vue components can be added to the theme directory:

**File**: `docs/.vitepress/theme/components/ApiTester.vue` (Optional)

```vue
<template>
  <div class="api-tester">
    <div class="tester-header">
      <h3>Test API Endpoint</h3>
      <select v-model="selectedEndpoint" class="endpoint-select">
        <option value="/v1/chat/completions">Chat Completions</option>
        <option value="/v1/models">List Models</option>
        <option value="/health">Health Check</option>
        <option value="/v1/providers/status">Provider Status</option>
      </select>
    </div>
    
    <div class="tester-body">
      <div class="request-section">
        <h4>Request</h4>
        <div class="method-url">
          <span class="method">{{ method }}</span>
          <span class="url">{{ baseUrl }}{{ selectedEndpoint }}</span>
        </div>
        <div v-if="hasBody" class="body-section">
          <label>Request Body:</label>
          <textarea
            v-model="requestBody"
            class="body-input"
            placeholder="Enter JSON request body..."
          ></textarea>
        </div>
        <button @click="sendRequest" :disabled="loading" class="send-btn">
          {{ loading ? 'Sending...' : 'Send Request' }}
        </button>
      </div>
      
      <div class="response-section">
        <h4>Response</h4>
        <div class="response-info">
          <span class="status" :class="responseStatusClass">
            {{ responseStatus || 'Not sent' }}
          </span>
          <span class="time">{{ responseTime || '' }}</span>
        </div>
        <pre class="response-body">{{ responseBody || 'No response yet' }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const selectedEndpoint = ref('/v1/chat/completions')
const requestBody = ref('')
const responseBody = ref('')
const responseStatus = ref('')
const responseTime = ref('')
const loading = ref(false)

const baseUrl = computed(() => {
  // Get base URL from environment or use localhost
  return window.location.origin
})

const method = computed(() => {
  return selectedEndpoint.value === '/health' ? 'GET' : 'POST'
})

const hasBody = computed(() => {
  return selectedEndpoint.value.includes('completions') || selectedEndpoint.value.includes('models')
})

const responseStatusClass = computed(() => {
  if (!responseStatus.value) return ''
  const status = parseInt(responseStatus.value.split(' ')[0])
  if (status >= 200 && status < 300) return 'success'
  if (status >= 400) return 'error'
  return 'warning'
})

const sendRequest = async () => {
  loading.value = true
  responseBody.value = ''
  responseStatus.value = ''
  responseTime.value = ''
  
  const startTime = Date.now()
  
  try {
    const url = `${baseUrl.value}${selectedEndpoint.value}`
    const options = {
      method: method.value,
      headers: {
        'Content-Type': 'application/json'
      }
    }
    
    if (hasBody.value && requestBody.value) {
      options.body = requestBody.value
    }
    
    const response = await fetch(url, options)
    const endTime = Date.now()
    
    responseStatus.value = `${response.status} ${response.statusText}`
    responseTime.value = `Time: ${endTime - startTime}ms`
    
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json()
      responseBody.value = JSON.stringify(data, null, 2)
    } else {
      responseBody.value = await response.text()
    }
  } catch (error) {
    responseStatus.value = `Error: ${error.message}`
    responseBody.value = 'Request failed'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.api-tester {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  background: var(--vp-c-bg-soft);
}

.tester-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 15px;
}

.endpoint-select {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.tester-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .tester-body {
    grid-template-columns: 1fr;
  }
}

.method-url {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  font-family: 'Courier New', monospace;
}

.method {
  background: var(--vp-c-brand);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 12px;
}

.url {
  color: var(--vp-c-text-2);
  font-family: 'Courier New', monospace;
}

.body-input {
  width: 100%;
  height: 120px;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: 'Courier New', monospace;
  resize: vertical;
}

.send-btn {
  background: var(--vp-c-brand);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: var(--vp-c-brand-dark);
}

.send-btn:disabled {
  background: var(--vp-c-divider);
  cursor: not-allowed;
}

.response-info {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  font-family: 'Courier New', monospace;
}

.status.success { color: #22c55e; }
.status.error { color: #ef4444; }
.status.warning { color: #f59e0b; }

.response-body {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 15px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  white-space: pre-wrap;
  max-height: 400px;
  overflow: auto;
}
</style>
```

**File**: `docs/.vitepress/theme/components/ConfigGenerator.vue` (Optional)

```vue
<template>
  <div class="config-generator">
    <div class="generator-header">
      <h3>Generate Provider Configuration</h3>
      <p>Configure your AI providers with this interactive tool</p>
    </div>
    
    <div class="generator-body">
      <div class="providers-list">
        <div
          v-for="provider in providers"
          :key="provider.name"
          class="provider-card"
          :class="{ active: selectedProviders.includes(provider.name) }"
          @click="toggleProvider(provider.name)"
        >
          <div class="provider-info">
            <h4>{{ provider.displayName }}</h4>
            <p>{{ provider.description }}</p>
          </div>
          <div class="provider-actions">
            <input
              type="checkbox"
              :checked="selectedProviders.includes(provider.name)"
              @change="toggleProvider(provider.name)"
            />
          </div>
        </div>
      </div>
      
      <div class="config-output">
        <h4>Generated Configuration</h4>
        <div class="config-actions">
          <button @click="copyToClipboard" class="copy-btn">
            {{ copySuccess ? 'Copied!' : 'Copy to Clipboard' }}
          </button>
          <button @click="downloadConfig" class="download-btn">
            Download provider.js
          </button>
        </div>
        <pre class="config-code">{{ generatedConfig }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const selectedProviders = ref(['openai'])

const providers = [
  {
    name: 'openai',
    displayName: 'OpenAI',
    description: 'GPT-4, GPT-3.5, and function calling support',
    config: {
      name: 'openai',
      apiKey: 'process.env.OPENAI_API_KEY',
      model: 'gpt-4',
      apiUrl: 'https://api.openai.com/v1'
    }
  },
  {
    name: 'google',
    displayName: 'Google Gemini',
    description: 'Gemini Pro and Flash models',
    config: {
      name: 'google',
      apiKey: 'process.env.GEMINI_API_KEY',
      model: 'gemini-pro',
      apiUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/'
    }
  },
  {
    name: 'grok',
    displayName: 'Grok',
    description: 'xAI Grok models',
    config: {
      name: 'grok',
      apiKey: 'process.env.GROK_API_KEY',
      model: 'grok-beta',
      apiUrl: 'https://api.x.ai/v1'
    }
  },
  {
    name: 'openrouter',
    displayName: 'OpenRouter',
    description: 'Access to multiple AI models',
    config: {
      name: 'openrouter',
      apiKey: 'process.env.OPENROUTER_API_KEY',
      model: 'mistralai/mistral-small',
      apiUrl: 'https://openrouter.ai/api/v1'
    }
  }
]

const generatedConfig = computed(() => {
  const selected = providers.filter(p => selectedProviders.value.includes(p.name))
  return `module.exports = [\n${selected.map(p => `  {\n    name: "${p.config.name}",\n    apiKey: ${p.config.apiKey},\n    model: "${p.config.model}",\n    apiUrl: "${p.config.apiUrl}"\n  }`).join(',\n')}\n];`
})

const toggleProvider = (providerName) => {
  const index = selectedProviders.value.indexOf(providerName)
  if (index > -1) {
    selectedProviders.value.splice(index, 1)
  } else {
    selectedProviders.value.push(providerName)
  }
}

const copySuccess = ref(false)

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(generatedConfig.value)
    copySuccess.value = true
    setTimeout(() => copySuccess.value = false, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const downloadConfig = () => {
  const blob = new Blob([generatedConfig.value], { type: 'text/javascript' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'provider.js'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.config-generator {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  background: var(--vp-c-bg-soft);
}

.generator-header h3 {
  margin: 0 0 10px 0;
}

.generator-header p {
  margin: 0;
  color: var(--vp-c-text-2);
}

.generator-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .generator-body {
    grid-template-columns: 1fr;
  }
}

.providers-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.provider-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--vp-c-bg);
}

.provider-card:hover {
  border-color: var(--vp-c-brand);
  transform: translateY(-1px);
}

.provider-card.active {
  border-color: var(--vp-c-brand);
  background: var(--vp-c-brand-dimm);
}

.provider-info h4 {
  margin: 0 0 5px 0;
  color: var(--vp-c-text-1);
}

.provider-info p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.config-output {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 20px;
  background: var(--vp-c-bg);
}

.config-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.copy-btn, .download-btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn:hover, .download-btn:hover {
  background: var(--vp-c-brand);
  color: white;
  border-color: var(--vp-c-brand);
}

.config-code {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 15px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  white-space: pre;
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
}
</style>
```

## API Integration Specifications

### 1. Local API Testing (Optional)

If interactive API testing components are implemented, they will communicate with a local or deployed instance of the Unified AI Router.

**API Endpoints to Test**:

- `POST /v1/chat/completions` - Chat completions with streaming support
- `GET /v1/models` - List available models
- `GET /health` - Health check
- `GET /v1/providers/status` - Provider status monitoring

**CORS Configuration**:

```javascript
// The API server should include CORS headers
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-domain.com'],
  credentials: true
}))
```

### 2. Provider Status Monitoring (Optional)

If implemented, real-time provider status display using the `/v1/providers/status` endpoint.

**Status Response Format**:

```json
{
  "data": [
    {
      "name": "openai",
      "status": "healthy",
      "circuitOpen": false,
      "lastError": null,
      "successRate": 100,
      "avgResponseTime": 1200
    }
  ]
}
```

## Styling Specifications

### CSS Approach

If Vue components are used, they will use scoped styles for better encapsulation and maintainability.

### Design System

- **Color Palette**: Based on existing VitePress theme with brand colors
- **Typography**: System fonts with monospace for code elements
- **Spacing**: Consistent 8px grid system
- **Components**: Reusable Vue components for consistency (optional)

### Responsive Design

- **Mobile First**: All components designed for mobile screens first
- **Breakpoints**:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- **Touch Friendly**: All interactive elements sized for touch input

## Performance Specifications

### Loading Performance

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Optimization Strategies

- **Code Splitting**: VitePress automatic code splitting
- **Image Optimization**: WebP format with fallbacks
- **Lazy Loading**: Non-critical components loaded on demand
- **Caching**: Browser caching for static assets

### Bundle Size

- **JavaScript**: < 200KB gzipped (only if Vue components are used)
- **CSS**: < 50KB gzipped
- **Images**: Optimized with appropriate formats

## Security Specifications

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';">
```

### Input Validation

- All user inputs validated and sanitized (if interactive components are used)
- API testing component includes input validation (optional)
- XSS protection for user-generated content

### HTTPS Requirements

- All production deployments must use HTTPS
- Mixed content warnings prevented
- Secure cookies and headers configured

## Deployment Specifications

### Build Process

```bash
# Development
npm run docs:dev

# Production Build
npm run docs:build

# Preview
npm run docs:preview
```

### Environment Variables

```bash
# For API testing components (optional)
VITE_API_BASE_URL=http://localhost:3000
VITE_ENABLE_API_TESTING=true
```

### Hosting Platforms

- **GitHub Pages**: Automatic deployment from main branch
- **Vercel**: Zero-configuration deployment
- **Netlify**: Continuous deployment with preview branches
- **Render**: Static site hosting with custom domains

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy Documentation
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run docs:build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs/.vitepress/dist
```

## Testing Specifications

### Unit Testing

- Vue component testing with Vitest (if components are used)
- API integration testing
- Configuration validation testing

### End-to-End Testing

- Cypress for interactive component testing (optional)
- API endpoint testing
- Cross-browser compatibility testing

### Performance Testing

- Lighthouse CI for performance monitoring
- Bundle size monitoring
- Load testing for API endpoints

## Monitoring and Analytics

### Error Tracking

- Client-side error monitoring
- API endpoint monitoring
- Performance monitoring

### Usage Analytics

- Page view tracking
- Component interaction tracking (if components are used)
- Search query analysis

### Health Monitoring

- Uptime monitoring for deployed instances
- API response time monitoring
- Error rate tracking

This technical specification provides a comprehensive blueprint for implementing the Unified AI Router website with all necessary technical details, component specifications, and deployment requirements.

## Summary

VitePress is a Markdown-based static site generator that works primarily with pure Markdown files. Vue components are optional and only needed for interactive features. The website can be fully functional using only Markdown files with frontmatter, making it simple to maintain and deploy. Interactive components like API testers and configuration generators can be added as Vue components if desired, but are not required for the core documentation functionality.
