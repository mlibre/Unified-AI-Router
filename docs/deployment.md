# 🚀 Deployment

Deploy Unified AI Router to various platforms.

## 🌈 Render.com

### 🖥️ Dashboard Method

1. **Push to GitHub first:**

   ```bash
   git push origin main
   ```

2. **Create Web Service on Render:**
   - Go to [dashboard.render.com](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure Build Settings:**
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Node Version:** 24.x or higher

4. **Add Environment Variables:**

   ```bash
   OPENROUTER_API_KEY=your_key_here
   OPENAI_API_KEY=your_key_here
   PORT=3000
   ```

5. **Deploy and Test:**

   ```bash
   curl https://your-app.onrender.com/health
   curl https://your-app.onrender.com/models
   ```

### Verify Deployment

```bash
# Health check
curl https://your-app.onrender.com/health

# List available models
curl https://your-app.onrender.com/v1/models

# Test chat completions
curl -X POST https://your-app.onrender.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello!"}],"model":"any"}'
```

1. **Install Railway CLI:**

   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Initialize:**

   ```bash
   railway login
   railway init
   ```

3. **Set Environment Variables:**

   ```bash
   railway variables set OPENROUTER_API_KEY=your_key
   railway variables set OPENAI_API_KEY=your_key
   ```

4. **Deploy:**

   ```bash
   railway up
   ```

## Environment Configuration

### Production .env

```bash
# Required API Keys
OPENROUTER_API_KEY=sk-or-your-key
OPENAI_API_KEY=sk-your-openai-key

# Server Configuration
PORT=3000
NODE_ENV=production

# Optional: Circuit Breaker Settings
CIRCUIT_TIMEOUT=30000
CIRCUIT_ERROR_THRESHOLD=50
CIRCUIT_RESET_TIMEOUT=300000
```

### Security Considerations

1. **Never commit .env files to git**
2. **Use platform-specific environment variable management**
3. **Rotate API keys regularly**
4. **Monitor API usage and costs**
5. **Implement rate limiting if needed**

## Monitoring

### Health Checks

```bash
# Basic health check
curl http://localhost:3000/health

# Provider status
curl http://localhost:3000/v1/providers/status
```

### Logging

Logs include:

- Provider fallback events
- Circuit breaker state changes
- API response times
- Error details

View logs:

```bash
# Render
tail -f /var/log/app.log

# Heroku
heroku logs --tail

# Docker
docker logs -f container-name
```

## Performance Tips

1. **Use multiple API keys** for load balancing
2. **Configure appropriate timeouts** based on provider speeds
3. **Monitor circuit breaker settings** to avoid premature failures
4. **Use streaming** for better user experience with long responses
5. **Cache responses** where appropriate
