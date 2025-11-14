# Deployment Guide

## Environment Variables for Cloud Deployment

This application uses environment variables for configuration. **Never commit `.env` files to version control.**

### Backend Environment Variables

Set these in your cloud hosting platform:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | Server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `CORS_ORIGIN` | No | `*` | Allowed CORS origins (comma-separated) |
| `MAX_FILE_SIZE` | No | `10485760` | Max file upload size in bytes (10MB) |
| `OPENAI_API_KEY` | Yes* | - | OpenAI API key for PDF parsing |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | OpenAI model to use |

*Required for AI-powered PDF parsing (Carfax reports). Without it, falls back to basic parsing.

### Frontend Environment Variables

Set these for production builds:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | Yes | - | Backend API URL (e.g., `https://api.yourdomain.com`) |
| `VITE_PORT` | No | `3000` | Dev server port (not used in production) |
| `VITE_API_TARGET` | No | `http://localhost:5000` | Dev proxy target (not used in production) |

## Platform-Specific Instructions

### Vercel

1. **Backend:**
   ```bash
   vercel env add OPENAI_API_KEY production
   vercel env add PORT production
   vercel env add CORS_ORIGIN production
   ```

2. **Frontend:**
   ```bash
   vercel env add VITE_API_BASE_URL production
   ```

### Railway

1. Go to your project → Settings → Variables
2. Add each environment variable
3. Redeploy

### Render

1. Go to your service → Environment
2. Add environment variables
3. Save and redeploy

### AWS (EC2/ECS/Lambda)

**EC2/ECS:**
```bash
# In your deployment script or user data
export OPENAI_API_KEY=sk-...
export PORT=5000
# etc.
```

**Lambda:**
- Set in Lambda function configuration → Environment variables

### Docker

```dockerfile
# In Dockerfile or docker-compose.yml
ENV OPENAI_API_KEY=sk-...
ENV PORT=5000
```

Or use secrets:
```yaml
# docker-compose.yml
services:
  backend:
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - PORT=${PORT}
```

### Heroku

```bash
heroku config:set OPENAI_API_KEY=sk-...
heroku config:set PORT=5000
# etc.
```

## Security Best Practices

1. **Never commit secrets** - `.env` files are in `.gitignore`
2. **Use platform secrets management** - Use your hosting platform's secret management
3. **Rotate keys regularly** - Change API keys periodically
4. **Limit CORS origins** - Set `CORS_ORIGIN` to your actual frontend domain in production
5. **Use different keys** - Use separate API keys for development and production

## Build Commands

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run build
# Serve the dist/ folder
```

## Health Check

After deployment, verify the backend is running:
```bash
curl https://your-api-domain.com/api/health
```

Should return:
```json
{"status":"ok","message":"Dipstik API is running"}
```

