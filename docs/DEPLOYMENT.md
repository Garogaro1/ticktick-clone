# Production Deployment Guide

This guide covers deploying the TickTick Clone to production.

## Prerequisites

- Node.js 22+
- PostgreSQL database (for production) or SQLite (for development)
- Docker (optional, for containerized deployment)
- Domain name (optional)

## Environment Variables

Copy `.env.example` to `.env.production` and configure:

```bash
# Application URL (update with your domain)
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Analytics (optional)
NEXT_PUBLIC_ANALYTICS_PROVIDER=google
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Database (PostgreSQL for production)
DATABASE_URL=postgresql://user:password@host:5432/database

# NextAuth (generate a secure secret)
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=https://your-domain.com

# Error tracking (optional)
NEXT_PUBLIC_SENTRY_DSN=https://...
SENTRY_AUTH_TOKEN=...
```

### Generate Secure Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Deployment Options

### 1. Vercel (Recommended)

Vercel provides the easiest deployment experience for Next.js applications.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Vercel-specific configuration:**

- Set environment variables in Vercel dashboard
- Enable Edge Functions for better performance
- Configure custom domain in dashboard

### 2. Docker

Build and run with Docker:

```bash
# Build image
docker build -t ticktick-clone .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_SECRET="..." \
  -e NEXTAUTH_URL="https://..." \
  ticktick-clone
```

**Using Docker Compose:**

```bash
docker-compose up -d
```

### 3. VPS / Cloud Server

Deploy to a VPS (DigitalOcean, AWS EC2, etc.):

```bash
# Install dependencies
apt update && apt install -y nodejs npm postgresql

# Clone repository
git clone https://github.com/your-repo/ticktick-clone.git
cd ticktick-clone

# Install dependencies
npm ci

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build application
npm run build

# Start with PM2
npm install -g pm2
pm2 start npm --name "ticktick-clone" -- start
pm2 save
pm2 startup
```

### 4. Railway / Render

**Railway:**

1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically on push

**Render:**

1. Create new Web Service
2. Connect GitHub repository
3. Configure build and start commands
4. Add environment variables

## Database Setup

### PostgreSQL (Production)

```bash
# Create database
createdb ticktick_clone

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

### Database Backups

```bash
# Backup with Prisma
npx prisma db pull --schema=./prisma/schema.prisma

# Or use pg_dump
pg_dump -U user -h host database > backup.sql

# Restore
psql -U user -h host -d database < backup.sql
```

## Security Checklist

- [ ] HTTPS enabled
- [ ] Strong NEXTAUTH_SECRET configured
- [ ] Database credentials secured
- [ ] Rate limiting enabled
- [ ] CORS configured for production domain
- [ ] CSP headers configured
- [ ] Error tracking enabled
- [ ] Logging configured
- [ ] Database backups automated
- [ ] Environment variables not committed to git

## Performance Optimization

### Enable Caching

Configure CDN caching for static assets in `vercel.json` or your hosting platform.

### Database Optimization

```bash
# Add indexes for common queries
# In prisma/schema.prisma:
@@index([userId, status])
@@index([dueDate])
```

### Monitoring

- Set up error tracking (Sentry, LogRocket)
- Monitor performance (Vercel Analytics, Google Analytics)
- Set up uptime monitoring (UptimeRobot, Pingdom)

## Post-Deployment

1. **Verify all features work:**
   - User registration/login
   - Task CRUD operations
   - All views (Tasks, Calendar, Kanban, Eisenhower, Habits, Goals, Pomodoro)
   - Mobile responsiveness

2. **Configure DNS:**
   - Add A record pointing to your server
   - Configure SSL certificate (Let's Encrypt)

3. **Set up monitoring:**
   - Error tracking alerts
   - Performance monitoring
   - Uptime monitoring

## Troubleshooting

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Errors

- Verify DATABASE_URL is correct
- Check firewall rules allow database connections
- Ensure database server is running

### Authentication Issues

- Verify NEXTAUTH_SECRET matches between server and client
- Check NEXTAUTH_URL matches your domain
- Clear cookies in browser

## Scaling Considerations

- Use Redis for session storage in distributed deployments
- Implement database read replicas for high traffic
- Use CDN for static asset delivery
- Consider serverless functions for API routes
