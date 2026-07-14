# Frontend Structure Guide

## Folder Organization

```
src/
├── components/          # Reusable React components
│   ├── Nav.jsx         # Navigation component
│   └── DebugInfo.jsx   # Development debug panel
│
├── config/              # Configuration files
│   └── api.js          # API configuration (base URL, timeouts, keys)
│
├── services/            # Business logic and API integration
│   ├── api.js          # API client with error handling and logging
│   └── auth.js         # Authentication service
│
├── hooks/               # Custom React hooks
│   └── useAuth.js      # Authentication hook (login, register, logout)
│
├── pages/               # Page components
│   ├── Login.jsx       # Login and registration page
│   ├── Home.jsx        # Home page
│   └── About.jsx       # About page
│
├── utils/               # Utility functions
│   └── logger.js       # Logging utility for debugging
│
├── styles/              # CSS styles
│   └── index.css       # Global styles
│
├── App.jsx             # Root component
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## Key Files Explanation

### Configuration (`src/config/api.js`)
- Manages API endpoints and configurations
- Automatically detects environment (dev/prod/GitHub Pages)
- Defines auth token storage keys

### Services (`src/services/`)
- **api.js**: HTTP client with:
  - Automatic retry logic
  - Timeout handling (30 seconds default)
  - CORS support with credentials
  - Detailed error logging
  - Request/response logging
  
- **auth.js**: Authentication service with:
  - Register/login/logout functions
  - Token and user data management
  - LocalStorage integration
  - Input validation

### Hooks (`src/hooks/useAuth.js`)
- Custom React hook for authentication state
- Provides: `login()`, `register()`, `logout()`, `loading`, `error`, `user`
- Centralized error handling

### Debug (`src/components/DebugInfo.jsx`)
- Development-only component showing:
  - API connection status
  - API base URL
  - Environment mode
- Fixed bottom-right corner widget

### Logger (`src/utils/logger.js`)
- Development logging utility
- Namespaced logs for different modules
- Opens browser DevTools to see logs

## How to Use

### 1. Register a New User
```javascript
const { register, error, loading } = useAuth();
await register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  targetPercentile: 99,
  examDate: '2026-12-23'
});
```

### 2. Login
```javascript
const { login, error, loading } = useAuth();
await login('john@example.com', 'password123');
```

### 3. Make API Calls
```javascript
import { apiClient } from '@/services/api.js';

const data = await apiClient.get('/tasks');
const response = await apiClient.post('/tasks', { title: 'New task' });
```

### 4. Debug
- Open browser DevTools (F12)
- Check the Debug Info panel (bottom-right)
- Look at Console tab for detailed API logs

## Backend Requirements

The frontend expects the backend to be running and providing these endpoints:

```
POST   /api/auth/register      - Create new account
POST   /api/auth/login         - Login user
GET    /api/auth/me            - Get current user
PATCH  /api/auth/profile       - Update user profile
GET    /api/health             - Health check endpoint
```

## Environment Variables

The app uses Vite's environment variables. Development defaults:
- API base: `/api` (proxied to backend)
- Token storage: `localStorage`
- Auth key: `cat_token`

## Troubleshooting

### "Request Failed" Error
1. Check the Debug Info panel (bottom-right)
2. Is API showing as "Connected"?
3. Open DevTools Console and look for API logs
4. Verify backend is running on port 5000

### CORS Errors
- Backend must have `http://localhost:5173` in CORS allowed origins
- Check `backend/server.js` CORS configuration

### Token Not Saving
- Check browser localStorage (DevTools > Application > Local Storage)
- Verify `cat_token` key exists

## Development Tips

1. **Enable API Logging**: Already enabled in development mode
2. **Check Auth State**: `localStorage.getItem('cat_token')`
3. **Clear Cache**: Ctrl+Shift+Delete or use Incognito mode
4. **Backend Debug**: Check `backend/server.js` console output
5. **Network Tab**: DevTools > Network tab shows all API requests
