# Frontend Documentation

Complete documentation for the React/TypeScript frontend application.

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Pages](#pages)
- [Components](#components)
- [Services](#services)
- [Hooks](#hooks)
- [State Management](#state-management)
- [Styling](#styling)
- [Type Definitions](#type-definitions)

## Overview

The frontend is a single-page React application built with TypeScript, providing a real-time multiplayer SET game experience. It communicates with the backend via REST APIs for authentication and WebSockets for real-time gameplay.

## Project Structure

```
frontend/src/
├── pages/              # Route components
├── components/         # Reusable UI components
├── services/           # API and WebSocket services
├── stores/             # State management (Zustand)
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── App.tsx             # Main app component with routing
└── main.tsx            # Application entry point
```

## Pages

### WelcomePage

Entry point of the application. Displays welcome screen with options to register or login.

**Route:** `/`

**Features:**
- Welcome message with SET game logo
- Navigation to registration page
- Navigation to login page

### LoginPage

User authentication page for existing users.

**Route:** `/login`

**Features:**
- Username and password input
- Form validation
- Error modal for authentication failures
- Navigation to registration page
- Redirects to lobby on successful login

### RegisterPage

User registration page for new users.

**Route:** `/register`

**Features:**
- Username, email, and password input
- Form validation (username pattern, password length)
- Error modal for registration failures
- Navigation to login page
- Redirects to lobby on successful registration

### LobbyPage

Main lobby where users can create or join game rooms.

**Route:** `/lobby`

**Features:**
- Protected route (requires authentication)
- Create new room with custom settings
- Join existing room by room ID
- Room settings modal (max players, timer, privacy)
- Logout functionality
- Error handling for room operations

### GameRoomPage

Main game room where gameplay occurs.

**Route:** `/game/:roomId`

**Features:**
- Protected route (requires authentication)
- Real-time game board with 12 cards
- Card selection interface
- Player score display
- Game timer (if enabled)
- Connection status indicator
- WebSocket integration for real-time updates
- Notification modals for game events

## Components

### Card

Renders a single SET game card with shape, number, color, and shading.

**Props:**
- `card`: Card object with id, number, shape, shading, color
- `isSelected`: Boolean indicating if card is currently selected
- `onClick`: Click handler function

**Features:**
- SVG-based shape rendering (diamond, oval, squiggle)
- Three shading types (solid, striped, open)
- Three colors (red, green, purple)
- Visual feedback for selected state
- Responsive sizing

### GameBoard

Displays the game board with 12 cards in a 4x3 grid layout.

**Props:**
- `cards`: Array of Card objects to display
- `onCardSelect`: Callback function when 3 cards are selected
- `isProcessing`: Boolean indicating if selection is being processed

**Features:**
- Fixed 4-column grid layout
- Card selection state management
- Client-side SET validation
- Visual feedback for selected cards
- Selected cards counter
- Invalid SET error modal
- Loading state during validation

### Modal

Reusable modal component for displaying messages and forms.

**Props:**
- `isOpen`: Boolean controlling modal visibility
- `onClose`: Function to close the modal
- `title`: Optional modal title
- `type`: Modal type (success, error, info, warning, white)
- `background`: Optional custom background color
- `children`: Modal content

**Features:**
- Escape key to close
- Click outside to close
- Customizable styling based on type
- Close button
- Accessible design

### RoomSettingsModal

Modal for configuring room settings before creating a game.

**Props:**
- `isOpen`: Boolean controlling modal visibility
- `onClose`: Function to close the modal
- `onSave`: Function called with settings when saved
- `initialSettings`: Optional initial settings values

**Features:**
- Room name input
- Max players selector (2, 3, 4, 6, 8)
- Timer duration selector (No timer, 1-15 minutes)
- Private room checkbox
- Form validation

### ProtectedRoute

Wrapper component for routes that require authentication.

**Props:**
- `children`: React node to render if authenticated

**Features:**
- Checks authentication state
- Redirects to login if not authenticated
- Renders children if authenticated

## Services

### API Service (`services/api.ts`)

Handles all HTTP requests to the backend REST API.

**Features:**
- Axios-based HTTP client
- Request/response interceptors
- JWT token management
- Automatic token refresh
- Error handling and redirection
- Base URL configuration via environment variable

**Methods:**
- `get`: GET request
- `post`: POST request
- `put`: PUT request
- `delete`: DELETE request

### Socket Service (`services/socketService.ts`)

Manages WebSocket connections and game events.

**Features:**
- Socket.IO client wrapper
- Event handler registration
- Room join/leave functionality
- Card selection emission
- Connection lifecycle management

**Methods:**
- `setSocket`: Initialize socket connection
- `joinRoom`: Join a game room
- `leaveRoom`: Leave current room
- `selectCards`: Submit card selection
- `setHandlers`: Register event handlers
- `disconnect`: Close socket connection

## Hooks

### useSocket

Custom hook for managing WebSocket connections.

**Returns:**
- `socket`: Socket.IO client instance
- `isConnected`: Boolean connection status
- `error`: Connection error message

**Features:**
- Automatic connection on mount
- Reconnection logic
- Connection status tracking
- Error handling

### useModal

Custom hook for managing modal open/close state.

**Returns:**
- `isOpen`: Boolean state
- `open`: Function to open modal
- `close`: Function to close modal
- `toggle`: Function to toggle modal state

**Features:**
- Simple state management
- Memoized callbacks

## State Management

### Auth Store (`stores/authStore.ts`)

Zustand store for authentication state.

**State:**
- `user`: Current user object
- `token`: JWT authentication token
- `isAuthenticated`: Boolean authentication status

**Actions:**
- `login`: Authenticate user and store credentials
- `register`: Register new user and authenticate
- `logout`: Clear authentication state

**Features:**
- Persistent storage (localStorage)
- Automatic token management
- User profile storage

## Styling

### Tailwind CSS Configuration

Custom configuration with SET game colors and brutalist design system.

**Colors:**
- `beige`: Background color (#F5F5DC)
- `set-red`: Red cards (#CC0000)
- `set-green`: Green cards (#00AA00)
- `set-purple`: Purple cards (#6600CC)
- `gold`: Accent color

**Typography:**
- Font: Space Grotesk (Google Fonts)
- Uppercase headings
- Letter spacing for headers

**Design System:**
- Neobrutalist aesthetic
- Thick borders (4px, 8px)
- Hard shadows (4px offset)
- No border-radius
- High contrast colors

### CSS Custom Properties

Card styling and grid layout defined in `index.css`:
- Fixed card dimensions (responsive breakpoints)
- Card grid gap spacing
- Card hover and selected states
- SVG pattern definitions for striped shading

## Type Definitions

### Game Types (`types/game.ts`)

- `Card`: Card interface with id, number, shape, shading, color
- `GameState`: Complete game state with board, deck, scores, players
- `RoomSettings`: Room configuration options

### Auth Types (`types/auth.ts`)

- `User`: User object with id, username, email
- `AuthResponse`: Authentication response with token and user
- `LoginRequest`: Login request payload
- `RegisterRequest`: Registration request payload

## Environment Variables

Create a `.env` file in the frontend directory:

```
VITE_API_URL=http://localhost:5000
```

## Building and Deployment

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

Output: `dist/` directory with optimized production assets.

### Preview Production Build

```bash
npm run preview
```

## Testing

Run tests (if configured):

```bash
npm test
```

## Code Style

- TypeScript strict mode enabled
- ESLint for code linting
- Prettier for code formatting (if configured)
- Functional components with hooks
- Type-safe props and state

