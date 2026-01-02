# Unified AI Router Website - Technical Specifications

## Overview

This document provides technical specifications for implementing the Unified AI Router website using VitePress.

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
│   └── dist/              # Built files (generated)
├── public/                # Static assets
│   ├── favicon.png
│   ├── favicon_io/        # Favicon files
│   └── images/           # Documentation images
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

## Summary

VitePress is a Markdown-based static site generator that works primarily with pure Markdown files. Vue components are optional and only needed for interactive features. The website can be fully functional using only Markdown files with frontmatter, making it simple to maintain and deploy. Interactive components like API testers and configuration generators can be added as Vue components if desired, but are not required for the core documentation functionality.
