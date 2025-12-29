# Architecture Overview

This document provides a high-level overview of the SET Game application architecture.

## System Architecture

The application follows a client-server architecture with real-time communication:

```mermaid
graph TD
    subgraph Client_Layer[Client Layer]
        Frontend[React Frontend<br/>Vite/TypeScript]
    end
    
    subgraph Server_Layer[Server Layer]
        Backend[Express Backend<br/>Node.js/TypeScript]
        SocketIO[Socket.IO Server<br/>Real-time Events]
    end
    
    subgraph Data_Layer[Data Layer]
        Postgres[(PostgreSQL<br/>Persistent Storage)]
        Redis[(Redis<br/>Caching/Session)]
    end
    
    Frontend -->|HTTP/REST<br/>Auth & Profile| Backend
    Frontend -->|WebSocket<br/>Real-time Gameplay| SocketIO
    
    Backend -->|SQL Queries| Postgres
    Backend -->|Key-Value Ops| Redis
    
    SocketIO -->|State Management| Redis
    SocketIO -->|Event Logging| Postgres
```

## Components

### Frontend (React Application)

The frontend is a single-page application built with React and TypeScript.

**Key Components:**
- **Pages**: WelcomePage, LoginPage, RegisterPage, LobbyPage, GameRoomPage
- **Components**: Card, GameBoard, Modal, RoomSettingsModal, ProtectedRoute
- **Services**: API client, Socket service
- **State Management**: Zustand store for authentication
- **Styling**: Tailwind CSS with custom neobrutalist theme

**Architecture Patterns:**
- Component-based UI architecture
- Custom hooks for reusable logic (useSocket, useModal)
- Service layer for API and WebSocket communication
- Protected routes for authenticated pages

### Backend (Node.js/Express)

The backend provides RESTful APIs and WebSocket server for real-time gameplay.

**Key Modules:**
- **Routes**: Authentication endpoints
- **Services**: GameService, EventLogService, RedisCacheService
- **Socket**: Real-time game communication
- **Middleware**: Authentication, validation
- **Config**: Database, Redis connections

**Architecture Patterns:**
- Service layer for business logic
- Repository pattern for data access (future)
- Middleware for cross-cutting concerns
- Event-driven architecture for game events

## Data Flow

### Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant DB as PostgreSQL
    
    User->>Frontend: Enter credentials
    Frontend->>Backend: POST /api/auth/login
    Backend->>DB: Validate credentials
    DB-->>Backend: User data
    Backend->>Backend: Generate JWT token
    Backend-->>Frontend: Token + User info
    Frontend->>Frontend: Store in Zustand
    Frontend->>Frontend: Include token in headers
```

### Game Flow

```mermaid
sequenceDiagram
    participant Player as User
    participant Frontend
    participant Socket as Socket.IO
    participant Redis
    participant DB as PostgreSQL
    
    Player->>Frontend: Join room
    Frontend->>Socket: join-room event
    Socket->>Redis: Check game state
    alt Game exists
        Redis-->>Socket: Return state
    else New game
        Socket->>Socket: Create new game
        Socket->>Redis: Save state
        Socket->>DB: Log game start
    end
    Socket-->>Frontend: game:state:update
    
    Player->>Frontend: Select 3 cards
    Frontend->>Frontend: Client validation
    Frontend->>Socket: game:select:cards
    Socket->>Socket: Server validation
    
    alt Valid SET
        Socket->>Redis: Update game state
        Socket->>DB: Log move
        Socket->>Socket: Broadcast to room
        Socket-->>Frontend: set:found + state update
    else Invalid SET
        Socket-->>Frontend: error
    end
```

### State Management

**Frontend:**
- Local component state for UI
- Zustand store for global auth state
- Socket.IO for real-time game state

**Backend:**
- Redis cache for active game states (24h TTL)
- In-memory Map as fallback
- PostgreSQL for persistent data (users, events, matches)

## Communication Protocols

### REST API

Used for:
- User authentication (login, register)
- Profile retrieval
- Health checks

Endpoints follow RESTful conventions with JSON payloads.

```mermaid
graph LR
    Frontend[Frontend] -->|POST /api/auth/login| Auth[Auth Endpoint]
    Frontend -->|POST /api/auth/register| Register[Register Endpoint]
    Frontend -->|GET /api/profile| Profile[Profile Endpoint]
    Frontend -->|GET /health| Health[Health Check]
    
    Auth --> DB[(PostgreSQL)]
    Register --> DB
    Profile --> DB
```

### WebSocket (Socket.IO)

Used for:
- Real-time game state synchronization
- Player join/leave events
- Card selection validation
- Score updates
- Game end notifications

```mermaid
graph TD
    Frontend[Frontend] -->|WebSocket Connection| Socket[Socket.IO Server]
    
    Socket -->|join-room| Room[Room Manager]
    Socket -->|game:select:cards| Game[Game Service]
    Socket -->|leave-room| Room
    
    Room --> Redis[(Redis Cache)]
    Game --> Redis
    Game --> DB[(PostgreSQL)]
    
    Socket -->|Broadcast| Frontend
```

**Events:**
- `join-room`: Player joins a game room
- `leave-room`: Player leaves a room
- `game:select:cards`: Submit card selection
- `game:state:update`: Broadcast updated game state
- `set:found`: Notify when SET is found
- `player:joined`: Player joined notification
- `player:left`: Player left notification
- `game:ended`: Game finished notification
- `error`: Error notification

## Security

- JWT tokens for authentication
- Password hashing with bcrypt
- Input validation with Zod schemas
- Protected routes on frontend
- Authentication middleware on backend
- SQL injection prevention via parameterized queries

## Scalability Considerations

- Redis caching for game state reduces database load
- Stateless backend design (JWT tokens)
- WebSocket connections can be load-balanced with sticky sessions
- Database indexes for efficient queries
- Event logging enables analytics and replay

## Error Handling

- Frontend: Modal-based error display
- Backend: Centralized error middleware
- Graceful degradation (Redis fallback to memory)
- Validation errors return meaningful messages
- Network errors handled with retry logic

## Future Improvements

- Redis cluster for horizontal scaling
- Database connection pooling optimization
- WebSocket connection pooling
- Real-time analytics dashboard
- Game replay functionality
- Mobile app support

