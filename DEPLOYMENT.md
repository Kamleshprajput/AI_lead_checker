# Deployment Guide

This guide provides step-by-step instructions for deploying the Lead Analysis Application.

## Quick Start

### Prerequisites
- Node.js 18+ installed
- OpenAI API key
- A hosting service for backend (e.g., Railway, Render, Heroku)
- A hosting service for frontend (e.g., Vercel, Netlify, Cloudflare Pages)

## Backend Deployment

### Option 1: Railway / Render / Heroku

1. **Connect your repository** to your hosting platform

2. **Set environment variables**:
   - `PORT`: Server port (usually auto-set by platform)
   - `OPENAI_API_KEY`: Your OpenAI API key

3. **Configure build settings**:
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
   - Root directory: `backend`

4. **Deploy**: The platform will automatically deploy on push

### Option 2: Manual Server Deployment

1. **SSH into your server**

2. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd Insyds_assignment/backend
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Create `.env` file**:
   ```env
   PORT=4000
   OPENAI_API_KEY=your_openai_api_key_here
   ```

5. **Build the project**:
   ```bash
   npm run build
   ```

6. **Start with PM2** (recommended for production):
   ```bash
   npm install -g pm2
   pm2 start dist/server.js --name lead-analysis-api
   pm2 save
   pm2 startup
   ```

7. **Set up reverse proxy** (Nginx example):
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:4000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Frontend Deployment

### Option 1: Vercel / Netlify

1. **Connect your repository** to Vercel/Netlify

2. **Configure build settings**:
   - Build command: `npm install && npm run build`
   - Output directory: `dist`
   - Root directory: `frontend`

3. **Set environment variables**:
   - `VITE_API_URL`: Your backend API URL (e.g., `https://api.yourdomain.com`)

4. **Deploy**: The platform will automatically deploy on push

### Option 2: Static Hosting (Cloudflare Pages, etc.)

1. **Build the frontend**:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Upload the `dist` folder** to your static hosting service

3. **Configure environment variables** on your hosting platform:
   - `VITE_API_URL`: Your backend API URL

### Option 3: Serve with Backend

You can serve the frontend from the backend:

1. **Update backend/server.ts** to serve static files:
   ```typescript
   import path from 'path';
   import express from 'express';
   
   // Add before other routes
   app.use(express.static(path.join(__dirname, '../../frontend/dist')));
   
   // Add catch-all route for SPA
   app.get('*', (req, res) => {
     res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
   });
   ```

2. **Build both**:
   ```bash
   # Build frontend
   cd frontend && npm run build && cd ..
   
   # Build backend
   cd backend && npm run build && cd ..
   ```

3. **Deploy the entire project** as a single service

## Environment Variables Summary

### Backend
```env
PORT=4000
OPENAI_API_KEY=sk-...
```

### Frontend
```env
VITE_API_URL=https://api.yourdomain.com
```

## Post-Deployment Checklist

- [ ] Backend is accessible at the configured URL
- [ ] Frontend can connect to backend (check browser console)
- [ ] Health endpoint returns "OK": `GET /health`
- [ ] Test lead analysis submission
- [ ] Verify caching is working (check localStorage)
- [ ] Check CORS settings if frontend and backend are on different domains

## Troubleshooting

### CORS Errors
If you see CORS errors, ensure:
- Backend has `cors()` middleware enabled (already configured)
- Frontend `VITE_API_URL` matches backend URL exactly

### API Connection Issues
- Verify backend is running: `curl https://api.yourdomain.com/health`
- Check environment variables are set correctly
- Verify firewall/security group allows traffic on backend port

### Build Failures
- Ensure Node.js version is 18+
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run build`

## Production Optimizations

1. **Enable compression** in backend:
   ```bash
   npm install compression
   ```
   Then add to `server.ts`:
   ```typescript
   import compression from 'compression';
   app.use(compression());
   ```

2. **Set up monitoring** (e.g., Sentry, LogRocket)

3. **Configure rate limiting** for API endpoints

4. **Set up SSL/TLS** certificates (Let's Encrypt)

5. **Configure CDN** for frontend assets

