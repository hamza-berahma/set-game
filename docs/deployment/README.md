# Deployment Guide

Guide for deploying the SET Game application to production.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 15+ database
- Redis 7+ (optional but recommended)
- Docker and Docker Compose (for infrastructure)
- Domain name and SSL certificate (for production)

## Infrastructure Setup

### Using Docker Compose

1. Start database and Redis:

```bash
cd infrastructure
sudo docker-compose up -d
```

2. Verify services are running:

```bash
sudo docker-compose ps
```

3. Check logs if needed:

```bash
sudo docker-compose logs -f
```

See [Infrastructure README](../../infrastructure/README.md) for more details.

## Backend Deployment

### 1. Environment Setup

Create `.env` file in `backend/`:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/setgame
JWT_SECRET=your-strong-random-secret-key-here
REDIS_URL=redis://localhost:6379
```

### 2. Install Dependencies

```bash
cd backend
npm ci
```

### 3. Build TypeScript

```bash
npm run build
```

### 4. Run Database Migrations

```bash
psql -U setgame -d setgame -f migrations/001_initial_schema.sql
psql -U setgame -d setgame -f migrations/002_room_settings_and_logging.sql
```

See [Database Migrations](../database/migrations.md) for details.

### 5. Start Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

### 6. Process Manager (Production)

Use PM2 or similar process manager:

```bash
npm install -g pm2
pm2 start dist/server.js --name setgame-backend
pm2 save
pm2 startup
```

### 7. Reverse Proxy

Configure Nginx or similar:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Frontend Deployment

### 1. Environment Setup

Create `.env` file in `frontend/`:

```env
VITE_API_URL=https://api.yourdomain.com
```

### 2. Install Dependencies

```bash
cd frontend
npm ci
```

### 3. Build for Production

```bash
npm run build
```

This creates optimized production build in `dist/` directory.

### 4. Deploy Static Files

Deploy the `dist/` directory to your static hosting service:

**Options:**
- Netlify
- Vercel
- AWS S3 + CloudFront
- GitHub Pages
- Nginx static file serving

### 5. Nginx Configuration (Static Serving)

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## SSL/HTTPS Setup

### Using Let's Encrypt with Certbot

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

Certbot will automatically configure Nginx with SSL certificates.

## Environment Variables Checklist

### Backend

- [ ] `NODE_ENV=production`
- [ ] `PORT` (default: 5000)
- [ ] `DATABASE_URL` or database connection variables
- [ ] `JWT_SECRET` (strong random string)
- [ ] `REDIS_URL` (optional)

### Frontend

- [ ] `VITE_API_URL` (backend API URL)

## Database Setup

1. Create production database
2. Run migrations in order
3. Set up database backups
4. Configure connection pooling if needed

## Redis Setup

1. Install Redis on server or use managed service
2. Configure persistence (AOF recommended)
3. Set up Redis password authentication
4. Update `REDIS_URL` with credentials

## Monitoring

### Health Checks

- Backend: `GET /health`
- Database: Connection pool status
- Redis: Connection status

### Logging

- Backend logs: Application logs and errors
- Database logs: Query performance
- Redis logs: Connection issues

### Metrics to Monitor

- Server CPU and memory usage
- Database connection pool usage
- Redis memory usage
- WebSocket connection count
- API response times
- Error rates

## Security Checklist

- [ ] Strong JWT secret
- [ ] Database credentials secured
- [ ] Redis password set (if applicable)
- [ ] HTTPS enabled
- [ ] CORS configured properly
- [ ] Rate limiting implemented (recommended)
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (React escapes by default)
- [ ] Environment variables not committed to git
- [ ] Dependencies up to date

## Scaling Considerations

### Horizontal Scaling

For multiple backend instances:
- Use sticky sessions for WebSocket connections
- Shared Redis instance for game state
- Shared PostgreSQL database
- Load balancer with WebSocket support

### Database Scaling

- Connection pooling configured
- Read replicas for analytics queries
- Indexes optimized
- Query performance monitored

### Redis Scaling

- Redis cluster for high availability
- Memory limits configured
- TTL for cached data

## Backup Strategy

### Database Backups

```bash
pg_dump -U setgame -d setgame > backup.sql
```

Set up automated daily backups.

### Redis Backups

Redis AOF (Append Only File) provides persistence. For additional safety:
- Regular RDB snapshots
- Backup AOF files

## Troubleshooting

### Backend Won't Start

1. Check environment variables
2. Verify database connection
3. Check port availability
4. Review error logs

### Frontend Build Fails

1. Check Node.js version
2. Clear `node_modules` and reinstall
3. Check for TypeScript errors
4. Verify environment variables

### WebSocket Connection Issues

1. Verify CORS settings
2. Check reverse proxy configuration
3. Ensure WebSocket upgrade headers
4. Check firewall rules

### Database Connection Errors

1. Verify connection string
2. Check database is running
3. Verify user permissions
4. Check network connectivity

## Maintenance

### Regular Tasks

- Monitor logs for errors
- Update dependencies monthly
- Review and optimize database queries
- Check Redis memory usage
- Review security updates

### Updates

1. Pull latest code
2. Run migrations if needed
3. Rebuild backend: `npm run build`
4. Restart backend server
5. Rebuild frontend: `npm run build`
6. Deploy new frontend build

