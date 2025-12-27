# Backend Documentation

Complete documentation for the Node.js/Express backend application.

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Services](#services)
- [Socket Events](#socket-events)
- [Database](#database)
- [Configuration](#configuration)
- [API Routes](#api-routes)
- [Middleware](#middleware)
- [Utilities](#utilities)

## Overview

The backend is a Node.js application built with Express, TypeScript, and Socket.IO. It provides REST APIs for authentication and WebSocket server for real-time multiplayer gameplay.

## Project Structure

```
backend/src/
├── config/            # Configuration modules
│   ├── database.ts    # PostgreSQL connection
│   └── redis.ts       # Redis connection
├── middleware/         # Express middleware
│   ├── auth.ts        # JWT authentication
│   └── validation.ts  # Request validation
├── routes/            # REST API routes
│   └── auth.ts        # Authentication endpoints
├── services/          # Business logic services
│   ├── GameService.ts
│   ├── EventLogService.ts
│   └── RedisCacheService.ts
├── socket/            # WebSocket handlers
│   └── socket.ts      # Socket.IO setup and events
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
│   ├── game.ts        # Game logic utilities
│   ├── jwt.ts         # JWT token utilities
│   └── password.ts    # Password hashing
└── server.ts          # Application entry point
```

## Services

### GameService

Manages game state and game logic.

**Location:** `src/services/GameService.ts`

**Methods:**
- `createGame(roomId, playerIds)`: Creates a new game and initializes board
- `getGame(roomId)`: Retrieves game state from cache or database
- `processCardSelection(roomId, playerId, cardIds)`: Validates and processes SET selection
- `updateGameState(roomId, gameState)`: Updates game state in cache
- `getValidSetsOnBoard(roomId)`: Finds all valid SETs on current board
- `deleteGame(roomId)`: Removes game state from cache

**State Storage:**
- Primary: Redis cache (24h TTL)
- Fallback: In-memory Map

### EventLogService

Logs game events to PostgreSQL database.

**Location:** `src/services/EventLogService.ts`

**Methods:**
- `logRoomCreated(roomId, userId, settings)`: Log room creation
- `logPlayerJoined(roomId, userId, matchId)`: Log player join
- `logPlayerLeft(roomId, userId, matchId)`: Log player leave
- `logGameStarted(roomId, matchId)`: Log game start
- `logSetFound(roomId, matchId, userId, cardIds, score)`: Log SET found
- `logMove(roomId, matchId, userId, cardIds, offsetMs)`: Log move
- `logGameEnded(roomId, matchId, scores)`: Log game end
- `logError(roomId, userId, error, code)`: Log errors

**Event Types:**
- `room_created`
- `player_joined`
- `player_left`
- `game_started`
- `set_found`
- `move_made`
- `game_ended`
- `error`

### RedisCacheService

Manages Redis caching for game states.

**Location:** `src/services/RedisCacheService.ts`

**Methods:**
- `saveGameState(roomId, gameState)`: Save with 24h TTL
- `getGameState(roomId)`: Retrieve game state
- `deleteGameState(roomId)`: Remove from cache
- `isAvailable()`: Check Redis connection status

**Key Pattern:** `game:state:{roomId}`

**TTL:** 24 hours

## Socket Events

### Client to Server

#### `join-room`

Join a game room.

**Payload:**
```typescript
{
  roomId: string;
  token: string;
}
```

**Response:**
- `game:state:update`: Current game state
- `player:joined`: Notification to other players
- `error`: Error if join fails

#### `leave-room`

Leave current room.

**Payload:** None

**Response:**
- `player:left`: Notification to other players

#### `game:select:cards`

Submit card selection for validation.

**Payload:**
```typescript
{
  roomId: string;
  cardIds: string[];
}
```

**Response:**
- `set:found`: If valid SET (broadcast to all)
- `game:state:update`: Updated board state
- `error`: If invalid selection

### Server to Client

#### `game:state:update`

Game state update broadcast.

**Payload:**
```typescript
{
  roomId: string;
  board: Card[];
  deck: Card[];
  scores: Record<string, number>;
  status: "waiting" | "active" | "finished";
  players: string[];
}
```

#### `set:found`

Valid SET found notification.

**Payload:**
```typescript
{
  roomId: string;
  playerId: string;
  playerUsername: string;
  cardIds: string[];
  newScore: number;
}
```

#### `player:joined`

Player joined notification.

**Payload:**
```typescript
{
  roomId: string;
  playerId: string;
  username: string;
  players: string[];
}
```

#### `player:left`

Player left notification.

**Payload:**
```typescript
{
  roomId: string;
  playerId: string;
  username: string;
  players: string[];
}
```

#### `game:ended`

Game finished notification.

**Payload:**
```typescript
{
  roomId: string;
  scores: Record<string, number>;
  reason: string;
}
```

#### `error`

Error notification.

**Payload:**
```typescript
{
  message: string;
  code: string;
}
```

## Database

### Connection

PostgreSQL connection managed in `src/config/database.ts`.

**Configuration:**
- Connection pool management
- Environment variables: `DATABASE_URL`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

**Usage:**
```typescript
import pool from './config/database';

const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
```

### Migrations

Located in `backend/migrations/`.

**Migration Files:**
- `001_initial_schema.sql`: Initial database schema
- `002_room_settings_and_logging.sql`: Room settings and event logging

See [Database Migrations](../database/migrations.md) for details.

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```
DATABASE_URL=postgresql://setgame:yourpassword@localhost:5432/setgame
PORT=5000
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379
```

**Required:**
- `JWT_SECRET`: Secret key for JWT token signing
- Database connection (via `DATABASE_URL` or individual variables)

**Optional:**
- `PORT`: Server port (default: 5000)
- `REDIS_URL`: Redis connection URL (default: redis://localhost:6379)

## API Routes

### Authentication Routes

**Base Path:** `/api/auth`

#### POST `/api/auth/register`

Register a new user.

**Request:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "string",
  "user": {
    "user_id": "uuid",
    "username": "string",
    "email": "string"
  }
}
```

#### POST `/api/auth/login`

Authenticate user.

**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "string",
  "user": {
    "user_id": "uuid",
    "username": "string",
    "email": "string"
  }
}
```

### Protected Routes

#### GET `/api/profile`

Get user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "string",
  "user": {
    "user_id": "uuid",
    "username": "string",
    "email": "string"
  }
}
```

### Utility Routes

#### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

## Middleware

### Authentication Middleware

**Location:** `src/middleware/auth.ts`

Validates JWT tokens and attaches user to request.

**Usage:**
```typescript
import { authenticate } from './middleware/auth';

app.get('/api/profile', authenticate, (req, res) => {
  const user = req.user;
  // ...
});
```

### Validation Middleware

**Location:** `src/middleware/validation.ts`

Validates request bodies using Zod schemas.

**Usage:**
```typescript
import { validate } from './middleware/validation';
import { registerSchema } from '../schemas/auth';

app.post('/api/auth/register', validate(registerSchema), handler);
```

## Utilities

### Game Utilities

**Location:** `src/utils/game.ts`

**Functions:**
- `generateDeck()`: Generates complete SET deck (81 cards)
- `shuffleDeck(deck)`: Shuffles deck array
- `isValidSet(card1, card2, card3)`: Validates if 3 cards form valid SET
- `findValidSets(board)`: Finds all valid SETs on board

### JWT Utilities

**Location:** `src/utils/jwt.ts`

**Functions:**
- `generateToken(userId, username)`: Generate JWT token
- `verifyToken(token)`: Verify and decode JWT token

### Password Utilities

**Location:** `src/utils/password.ts`

**Functions:**
- `hashPassword(password)`: Hash password with bcrypt
- `comparePassword(password, hash)`: Compare password with hash

## Running the Server

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Testing

```bash
npm test
```

## Additional Documentation

- [Event Logging](./event-logging.md)
- [Redis Integration](./redis.md)
- [Database Schema](../database/schema.md)
- [Database Migrations](../database/migrations.md)

