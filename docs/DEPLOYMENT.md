# Deployment Guide

## Production Deployment

### Prerequisites
- Node.js 18+ installed
- Firebase project setup
- Domain name (optional)
- SSL certificate (for custom domains)

### Environment Configuration

#### Required Environment Variables
Create a `.env.production` file:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_production_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_production_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_production_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_production_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_production_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_production_measurement_id

# Next.js Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

### Firebase Setup for Production

#### 1. Firebase Project Configuration
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init
```

#### 2. Firestore Security Rules
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Doctors collection - staff only
    match /doctors/{doctorId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/staff/$(request.auth.uid));
    }
    
    // Rooms collection - staff only
    match /rooms/{roomId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/staff/$(request.auth.uid));
    }
    
    // Appointments - patients can access their own, staff can access all
    match /appointments/{appointmentId} {
      allow read, write: if request.auth != null && (
        resource.data.patientId == request.auth.uid ||
        exists(/databases/$(database)/documents/staff/$(request.auth.uid))
      );
    }
  }
}
```

#### 3. Firebase Storage Rules
```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Deployment Options

## 1. Vercel Deployment (Recommended)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Deploy
```bash
# Build the project
pnpm build

# Deploy to Vercel
vercel --prod
```

### Step 3: Environment Variables in Vercel
1. Go to your Vercel dashboard
2. Select your project
3. Navigate to Settings → Environment Variables
4. Add all required environment variables

### Step 4: Domain Configuration
1. Add your custom domain in Vercel settings
2. Configure DNS records as instructed
3. SSL certificate will be automatically provisioned

## 2. Netlify Deployment

### Step 1: Build Settings
Create `netlify.toml`:
```toml
[build]
  command = "pnpm build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Step 2: Deploy
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

## 3. Firebase Hosting

### Step 1: Configure Firebase Hosting
```json
// firebase.json
{
  "hosting": {
    "public": "out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Step 2: Build and Deploy
```bash
# Build for static export
pnpm build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

## 4. Self-Hosted Deployment

### Using Docker

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  ytfcs-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_FIREBASE_API_KEY=${FIREBASE_API_KEY}
      - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${FIREBASE_AUTH_DOMAIN}
      # Add other environment variables
    restart: unless-stopped
```

### Using PM2 (Node.js Process Manager)

#### Install PM2
```bash
npm install -g pm2
```

#### PM2 Configuration
```json
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'ytfcs-app',
    script: 'node_modules/.bin/next',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

#### Deploy with PM2
```bash
# Build the application
pnpm build

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
```

## Performance Optimization

### 1. Build Optimization
```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  compress: true,
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  experimental: {
    outputFileTracingRoot: process.cwd(),
  }
};

export default nextConfig;
```

### 2. CDN Configuration
```javascript
// For static assets
const nextConfig = {
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'https://cdn.your-domain.com' 
    : '',
};
```

### 3. Database Optimization
```javascript
// Firestore indexes for better query performance
// Create composite indexes for:
// - appointments: patientId, date
// - rooms: doctorsAssigned, isEmergency
// - doctors: specialty, availability
```

## Monitoring and Maintenance

### 1. Health Check Endpoint
```javascript
// pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version 
  });
}
```

### 2. Error Monitoring
```javascript
// Add error monitoring service
// Sentry, LogRocket, or similar
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### 3. Performance Monitoring
```javascript
// Add performance monitoring
// Web Vitals, Firebase Performance, etc.
import { getAnalytics } from 'firebase/analytics';

const analytics = getAnalytics(app);
```

## Security Considerations

### 1. Environment Variables
- Never commit sensitive data to version control
- Use different Firebase projects for development and production
- Implement proper secret management

### 2. Authentication
- Enable multi-factor authentication for admin accounts
- Implement proper session management
- Use HTTPS in production

### 3. Database Security
- Implement proper Firestore security rules
- Regular security audits
- Monitor for unusual access patterns

### 4. Network Security
- Use CDN for static assets
- Implement proper CORS policies
- Use security headers

## Backup and Recovery

### 1. Database Backup
```bash
# Firestore backup
gcloud firestore export gs://your-backup-bucket/backup-$(date +%Y%m%d)
```

### 2. Application Backup
```bash
# Create deployment backup
tar -czf ytfcs-backup-$(date +%Y%m%d).tar.gz .next package.json
```

### 3. Recovery Procedures
1. Database recovery from Firebase backups
2. Application rollback procedures
3. DNS failover configuration

## Scaling Considerations

### 1. Horizontal Scaling
- Use load balancers for multiple instances
- Implement proper session management
- Database connection pooling

### 2. Vertical Scaling
- Monitor resource usage
- Optimize database queries
- Image optimization

### 3. Auto-scaling
```yaml
# Kubernetes auto-scaling example
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ytfcs-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ytfcs-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify environment variables
   - Clear cache: `pnpm store prune`

2. **Firebase Connection Issues**
   - Verify Firebase configuration
   - Check network connectivity
   - Validate environment variables

3. **Performance Issues**
   - Monitor database queries
   - Optimize images and assets
   - Check for memory leaks

### Debug Commands
```bash
# Check build output
pnpm build --debug

# Analyze bundle size
pnpm analyze

# Check for security vulnerabilities
pnpm audit
```

## Maintenance Schedule

### Daily
- Monitor application health
- Check error logs
- Verify backup completion

### Weekly
- Review performance metrics
- Security updates
- Database optimization

### Monthly
- Full security audit
- Performance review
- Backup testing
- Dependency updates

This deployment guide provides comprehensive instructions for deploying the YTFCS Healthcare Management System in various environments with proper security, monitoring, and maintenance procedures.
