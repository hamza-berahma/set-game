# SET Game Documentation

Complete documentation for the SET Game multiplayer application.

## Table of Contents

- [Architecture Overview](./architecture.md)
- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)
- [API Reference](./api/README.md)
- [Database Schema](./database/schema.md)
- [Deployment Guide](./deployment/README.md)
- [Development Guide](./development/README.md)

## Quick Start

1. **Infrastructure Setup**
   - Start PostgreSQL and Redis: See [Infrastructure Setup](../infrastructure/README.md)

2. **Backend Setup**
   - Install dependencies: `cd backend && npm install`
   - Run migrations: See [Database Setup](./database/README.md)
   - Start server: `npm run dev`

3. **Frontend Setup**
   - Install dependencies: `cd frontend && npm install`
   - Start development server: `npm run dev`

## Project Structure

```
set-game/
├── backend/          # Node.js/Express backend
├── frontend/         # React/TypeScript frontend
├── infrastructure/   # Docker Compose configurations
├── docs/            # This documentation
└── paper/           # Educational materials and grading
```

## Key Features

- Real-time multiplayer gameplay via WebSockets
- User authentication with JWT
- Game state caching with Redis
- Event logging for analytics
- Responsive UI with neobrutalist design

## Technology Stack

**Backend:**
- Node.js with Express
- TypeScript
- PostgreSQL
- Redis
- Socket.IO
- JWT authentication

**Frontend:**
- React with TypeScript
- Vite
- Zustand (state management)
- Tailwind CSS
- Socket.IO Client

## Getting Help

- Check the specific documentation sections for detailed information
- Review the API reference for endpoint documentation
- See the deployment guide for production setup

