# Hosting Guide for Anti-Ragging Platform

This guide provides instructions for hosting the Anti-Ragging Platform on a web server.

## Option 1: Server-Side Rendering (Recommended)

The application is built with Next.js and can be hosted with full server-side rendering capabilities:

### Prerequisites
- Node.js 18.x or later
- npm 9.x or later

### Deployment Steps

1. **Build the application for production**:
   ```
   npm run build
   ```

2. **Copy the standalone folder**:
   After building, copy the entire `.next/standalone` directory to your hosting server.
   
3. **Include static assets**:
   Copy the `.next/static` directory to `.next/standalone/.next/static`

4. **Start the server**:
   ```
   cd .next/standalone
   node server.js
   ```

5. **Using process manager (recommended)**:
   ```
   # Install PM2 if you haven't already
   npm install -g pm2
   
   # Start the application with PM2
   pm2 start server.js --name anti-ragging-platform
   
   # Ensure it starts on system reboot
   pm2 startup
   pm2 save
   ```

6. **Configure nginx (if needed)**:
   ```
   server {
     listen 80;
     server_name your-domain.com;
     
     location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

## Option 2: Static Export (Simplified)

For simpler hosting environments where Node.js is not available, you can use a static export:

1. **Enable static export**:
   Edit `next.config.js` and change `output: 'standalone'` to `output: 'export'`

2. **Build the static site**:
   ```
   npm run export
   ```

3. **Host the output directory**:
   Copy the contents of the `out` directory to your web server's root directory.

## Environment Configuration

Create a `.env` file on your hosting server with the following variables:

```
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

Replace `https://your-backend-api.com` with the URL of your PHP backend.

## Notes for Backend Integration

The Anti-Ragging Platform frontend is designed to work with a PHP backend API. Ensure your backend API is properly configured and accessible from your hosting environment.

## Troubleshooting

- If you encounter CORS issues, ensure your PHP backend includes the appropriate CORS headers.
- For image loading issues, check that the `NEXT_PUBLIC_API_URL` is correctly set.
- If dynamic routes aren't working, ensure your web server is configured to handle SPA routing. 