# Home Hub Setup Guide

## Quick Fix for Google Calendar API Issues

The main issue you're experiencing is that **Google Calendar API requires OAuth2 authentication**, not just API keys. API keys only work for public data, but accessing user calendars requires OAuth2.

## Solution: OAuth2 Authentication

I've updated the backend to use OAuth2 authentication instead of API keys. Here's how to get it working:

### 1. Environment Variables

Update your `.env` file with OAuth2 credentials:

```env
VITE_GOOGLE_CLIENT_ID=your_google_oauth2_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_google_oauth2_client_secret_here
VITE_GOOGLE_CALENDAR_ID=your_calendar_id_here
```

### 2. Google OAuth2 Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"
4. Create OAuth2 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URI: `http://<YOUR_BACKEND_URL>:3001/auth/google/callback`
   - Copy the Client ID and Client Secret to your `.env` file

### 3. Running the Application

You need to run **both** the frontend and backend:

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 4. Testing OAuth2 Authentication

1. Open your browser to `http://localhost:5173`
2. Navigate to the AuthTest component
3. Click "Test Auth" to check current status
4. Click "Authenticate" to start OAuth2 flow
5. Complete Google authentication in the new tab
6. Click "Check Status" to verify authentication

## What Was Fixed

1. **OAuth2 Authentication**: Proper user authentication instead of API keys
2. **CORS Issues**: Backend proxy handles API calls server-side
3. **Better Error Handling**: More detailed diagnostics
4. **Proper Architecture**: Frontend → Backend → Google API with OAuth2

## Troubleshooting

### If you get "OAuth2 not configured":
- Check your `.env` file has `VITE_GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_SECRET`
- Restart both frontend and backend servers

### If you get "Authentication required":
- Click "Authenticate" to start the OAuth2 flow
- Make sure the redirect URI is set correctly in Google Cloud Console

### If you get "Calendar API not enabled":
- Go to Google Cloud Console and enable the Calendar API
- Make sure your OAuth2 client has the correct scopes

## API Endpoints

The backend provides these endpoints:

- `GET /api/health` - Health check
- `GET /auth/google` - Start OAuth2 flow
- `GET /auth/google/callback` - OAuth2 callback
- `GET /api/calendar/test` - Test Google Calendar connection
- `GET /api/calendar/events` - Get calendar events
- `GET /api/calendar/list` - Get calendar list

## Next Steps

Once OAuth2 is working, you can:

1. Update the main calendar components to use the backend
2. Add more calendar functionality (create, update, delete events)
3. Implement voice control features
4. Add more UI improvements

The AuthTest component will guide you through the OAuth2 setup process! 