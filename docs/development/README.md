# Development Guide

Guide for setting up and developing the SET Game application.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+
- Redis 7+ (optional)
- Docker and Docker Compose (for infrastructure)
- Git

## Initial Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd set-game
```

### 2. Start Infrastructure

```bash
cd infrastructure
sudo docker-compose up -d
```

Verify services:

```bash
sudo docker-compose ps
```

### 3. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
DATABASE_URL=postgresql://setgame:yourpassword@localhost:5432/setgame
PORT=5000
JWT_SECRET=your-development-secret
REDIS_URL=redis://localhost:6379
```

Run database migrations:

```bash
psql -U setgame -d setgame -f migrations/001_initial_schema.sql
psql -U setgame -d setgame -f migrations/002_room_settings_and_logging.sql
```

Start development server:

```bash
npm run dev
```

Backend should be running on `http://localhost:5000`

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

Start development server:

```bash
npm run dev
```

Frontend should be running on `http://localhost:5173`

## Development Workflow

### Code Style

- TypeScript strict mode enabled
- ESLint for code linting
- Prettier recommended for formatting
- No inline comments in code (documentation in docs folder)

### File Structure

Follow existing project structure:

- `src/`: Source code
- `types/`: TypeScript type definitions
- `services/`: Business logic and API clients
- `components/`: React components
- `pages/`: Route components
- `hooks/`: Custom React hooks
- `utils/`: Utility functions

### Git Workflow

1. Create feature branch from main
2. Make changes and commit
3. Run tests and linting
4. Create pull request
5. Code review and merge

### Testing

**Backend:**

```bash
cd backend
npm test
```

**Frontend:**

If tests are configured:

```bash
cd frontend
npm test
```

### Building

**Backend:**

```bash
cd backend
npm run build
```

**Frontend:**

```bash
cd frontend
npm run build
```

## Common Tasks

### Adding a New API Endpoint

1. Add route handler in `backend/src/routes/`
2. Create validation schema in `backend/src/schemas/`
3. Add middleware if needed
4. Update API documentation in `docs/api/README.md`
5. Test endpoint

### Adding a New Frontend Page

1. Create page component in `frontend/src/pages/`
2. Add route in `frontend/src/App.tsx`
3. Add navigation links if needed
4. Update frontend documentation

### Adding a New Socket Event

1. Add event handler in `backend/src/socket/socket.ts`
2. Update SocketService in frontend if needed
3. Update WebSocket documentation in `docs/api/README.md`
4. Test event flow

### Database Migration

1. Create migration file in `backend/migrations/`
2. Test migration locally
3. Update `docs/database/migrations.md`
4. Apply to production during deployment

## Debugging

### Backend Debugging

- Use `console.log` for debugging (remove before commit)
- Check server logs for errors
- Use Node.js debugger: `node --inspect dist/server.js`
- Check database logs
- Check Redis connection status

### Frontend Debugging

- Use React DevTools browser extension
- Check browser console for errors
- Use `console.log` for debugging (remove before commit)
- Check Network tab for API calls
- Check WebSocket connection status

### Common Issues

**Database Connection Error:**
- Verify PostgreSQL is running
- Check connection string in `.env`
- Verify database user permissions

**Redis Connection Error:**
- Verify Redis is running
- Check Redis URL in `.env`
- Application will work without Redis (uses in-memory fallback)

**WebSocket Connection Failed:**
- Check CORS settings
- Verify backend is running
- Check browser console for errors
- Verify JWT token is valid

**Build Errors:**
- Check TypeScript errors: `npm run build`
- Verify all dependencies installed
- Check for syntax errors
- Clear `node_modules` and reinstall if needed

## Documentation

All documentation is in the `docs/` folder:

- [Main Documentation](../README.md)
- [Architecture](../architecture.md)
- [Frontend Documentation](../frontend/README.md)
- [Backend Documentation](../backend/README.md)
- [API Reference](../api/README.md)
- [Deployment Guide](../deployment/README.md)

When making changes:

1. Update relevant documentation files
2. Keep documentation up to date with code changes
3. Add examples for new features
4. Document breaking changes

## Dependencies

### Backend Key Dependencies

- `express`: Web framework
- `socket.io`: WebSocket server
- `pg`: PostgreSQL client
- `ioredis`: Redis client
- `jsonwebtoken`: JWT authentication
- `bcrypt`: Password hashing
- `zod`: Schema validation

### Frontend Key Dependencies

- `react`: UI library
- `react-router-dom`: Routing
- `zustand`: State management
- `socket.io-client`: WebSocket client
- `axios`: HTTP client
- `tailwindcss`: CSS framework

## Performance Considerations

- Use React.memo for expensive components
- Avoid unnecessary re-renders
- Optimize database queries with indexes
- Use Redis caching for frequently accessed data
- Minimize bundle size
- Lazy load routes if needed

## Security Best Practices

- Never commit `.env` files
- Use strong JWT secrets
- Validate all user input
- Use parameterized SQL queries
- Implement rate limiting in production
- Keep dependencies up to date
- Regular security audits

## Getting Help

- Check documentation in `docs/` folder
- Review existing code for patterns
- Check GitHub issues
- Ask team members

