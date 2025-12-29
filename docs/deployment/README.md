# Deployment Guide

Complete guide for deploying the SET Game application to production environments.

## Deployment Architecture

```mermaid
graph TB
    subgraph Internet
        Users[Users]
    end
    
    subgraph Load_Balancer[Load Balancer / Reverse Proxy]
        LB[Nginx / Cloudflare]
    end
    
    subgraph Application_Layer[Application Layer]
        FE1[Frontend<br/>Static Files]
        BE1[Backend Instance 1]
        BE2[Backend Instance 2]
    end
    
    subgraph Data_Layer[Data Layer]
        Redis[(Redis<br/>Cache)]
        Postgres[(PostgreSQL<br/>Database)]
    end
    
    Users --> LB
    LB --> FE1
    LB --> BE1
    LB --> BE2
    
    BE1 --> Redis
    BE1 --> Postgres
    BE2 --> Redis
    BE2 --> Postgres
    
    style FE1 fill:#e1f5ff
    style BE1 fill:#fff4e1
    style BE2 fill:#fff4e1
    style Redis fill:#ffebee
    style Postgres fill:#e8f5e9
```

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 15+ database
- Redis 7+ (optional but recommended)
- Docker and Docker Compose (for infrastructure)
- Domain name and SSL certificate (for production)
- Server with sufficient resources (2GB+ RAM recommended)

## Deployment Options

### Option 1: Docker Compose (Recommended for Single Server)

Best for: Single server deployments, development, small-scale production

**Pros:**
- Simple setup
- All services in one place
- Easy to manage

**Cons:**
- Limited scalability
- Single point of failure

### Option 2: Railway.app (Cloud Platform)

Best for: Quick deployment, managed infrastructure

**Setup:**
1. Create Railway account
2. Create PostgreSQL service
3. Create Redis service
4. Deploy backend (set root directory to `backend`)
5. Deploy frontend (set root directory to `frontend`)
6. Configure environment variables
7. Run database migrations

See Railway configuration files: `backend/railway.json`, `frontend/railway.json`

### Option 3: VPS with Docker (Traditional)

Best for: Full control, custom configurations

**Setup:**
1. Provision VPS (DigitalOcean, Linode, AWS EC2, etc.)
2. Install Docker and Docker Compose
3. Clone repository
4. Configure environment variables
5. Start services

### Option 4: Kubernetes (Enterprise)

Best for: Large-scale deployments, high availability

**Setup:**
1. Set up Kubernetes cluster
2. Create PostgreSQL StatefulSet
3. Create Redis deployment
4. Deploy backend as Deployment with Service
5. Deploy frontend as Deployment with Service
6. Configure Ingress for external access

## Infrastructure Setup

### Using Docker Compose

1. Start database and Redis:

```bash
cd infrastructure
sudo docker-compose up -d postgres redis
```

2. Verify services are running:

```bash
sudo docker-compose ps
```

3. Check logs if needed:

```bash
sudo docker-compose logs -f
```

4. Run database migrations:

```bash
psql -U setgame -d setgame -h localhost -f ../backend/migrations/001_initial_schema.sql
psql -U setgame -d setgame -h localhost -f ../backend/migrations/002_room_settings_and_logging.sql
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

Configure Nginx or similar for backend API and WebSocket support:

```nginx
# Backend API and WebSocket
server {
    listen 80;
    server_name api.yourdomain.com;

    # WebSocket support
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # WebSocket timeout
        proxy_read_timeout 86400;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:5000/health;
        access_log off;
    }
}
```

**Important:** WebSocket connections require the `Upgrade` and `Connection` headers. Without these, Socket.IO will fall back to polling, which is less efficient.

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
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

Certbot will automatically configure Nginx with SSL certificates.

### Manual SSL Configuration

If using custom certificates:

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://localhost:5000;
        # ... proxy settings from above
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### WebSocket over HTTPS

WebSockets work over HTTPS/WSS. Ensure your frontend connects to `wss://` (not `ws://`) when using HTTPS:

```typescript
// In frontend .env
VITE_API_URL=https://api.yourdomain.com
```

Socket.IO will automatically use WSS when the page is loaded over HTTPS.

## Environment Variables Checklist

### Backend

**Required:**
- [ ] `NODE_ENV=production`
- [ ] `PORT` (default: 5000)
- [ ] `DATABASE_URL` or individual DB variables (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`)
- [ ] `JWT_SECRET` (strong random string, min 32 characters)

**Optional:**
- [ ] `REDIS_URL` (default: `redis://localhost:6379`)
- [ ] `CORS_ORIGIN` (comma-separated list of allowed origins)
- [ ] `DB_MAX_CONNECTIONS` (default: 20)

**Example `.env` file:**
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://setgame:password@localhost:5432/setgame
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

### Frontend

**Required:**
- [ ] `VITE_API_URL` (backend API URL, must include protocol: `https://api.yourdomain.com`)

**Example `.env` file:**
```env
VITE_API_URL=https://api.yourdomain.com
```

**Note:** Frontend environment variables must be prefixed with `VITE_` to be accessible in the browser. They are embedded at build time, so rebuild after changing.

## Database Setup

### 1. Create Production Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE setgame;
CREATE USER setgame WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE setgame TO setgame;

# Connect to setgame database
\c setgame

# Grant schema privileges
GRANT ALL ON SCHEMA public TO setgame;
```

### 2. Run Migrations

Run migrations in order:

```bash
# Migration 1: Core schema
psql -U setgame -d setgame -h localhost -f backend/migrations/001_initial_schema.sql

# Migration 2: Room settings and logging
psql -U setgame -d setgame -h localhost -f backend/migrations/002_room_settings_and_logging.sql
```

### 3. Verify Schema

```sql
-- Check tables exist
\dt

-- Check indexes
\di

-- Verify foreign keys
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

### 4. Connection Pooling

PostgreSQL connection pooling is configured in `backend/src/config/database.ts`:

```typescript
max: parseInt(process.env.DB_MAX_CONNECTIONS || "20")
```

Adjust based on your server capacity and expected load.

### 5. Database Backups

**Automated Backup Script:**

```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/setgame"
DB_NAME="setgame"
DB_USER="setgame"

mkdir -p $BACKUP_DIR

pg_dump -U $DB_USER -d $DB_NAME -F c -f $BACKUP_DIR/setgame_$DATE.dump

# Keep only last 7 days
find $BACKUP_DIR -name "setgame_*.dump" -mtime +7 -delete
```

**Cron Job (daily at 2 AM):**
```bash
0 2 * * * /path/to/backup-db.sh
```

### 6. Database Performance

**Monitor Query Performance:**
```sql
-- Enable query logging
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1s
SELECT pg_reload_conf();

-- View slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

**Connection Monitoring:**
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check connection pool usage
SELECT 
    datname,
    count(*) as connections,
    max_conn as max_connections
FROM pg_stat_database
JOIN pg_database ON pg_stat_database.datid = pg_database.oid
WHERE datname = 'setgame';
```

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

The application supports horizontal scaling through the Socket.IO Redis adapter.

**Architecture:**
```mermaid
graph TB
    subgraph LoadBalancer[Load Balancer]
        LB[Nginx]
    end
    
    subgraph BackendInstances[Backend Instances]
        BE1[Backend 1]
        BE2[Backend 2]
        BE3[Backend 3]
    end
    
    subgraph RedisLayer[Redis]
        RedisPub[(Pub/Sub)]
        RedisCache[(Cache)]
    end
    
    subgraph Database[Database]
        Postgres[(PostgreSQL)]
    end
    
    LB --> BE1
    LB --> BE2
    LB --> BE3
    
    BE1 --> RedisPub
    BE1 --> RedisCache
    BE2 --> RedisPub
    BE2 --> RedisCache
    BE3 --> RedisPub
    BE3 --> RedisCache
    
    BE1 --> Postgres
    BE2 --> Postgres
    BE3 --> Postgres
```

**Requirements:**
- **Redis Adapter**: Socket.IO uses Redis pub/sub for cross-instance communication
  - Set `REDIS_URL` environment variable
  - Same Redis instance can be used for caching and adapter
- **Shared Redis**: All instances connect to the same Redis server
- **Shared PostgreSQL**: All instances use the same database
- **Load Balancer**: Must support WebSocket upgrades
  - Nginx, HAProxy, or cloud load balancers
  - Sticky sessions **not required** (Socket.IO handles this)

**Configuration:**
```env
# All backend instances use the same Redis
REDIS_URL=redis://your-redis-host:6379

# All instances use the same database
DATABASE_URL=postgresql://user:pass@host:5432/setgame
```

**Benefits:**
- Events broadcast across all instances
- Players can connect to any instance
- Automatic failover if one instance goes down
- Linear scaling with additional instances

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

