import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { google } from 'googleapis'
import multer from 'multer'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Token storage file
const TOKEN_FILE = 'tokens.json'

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
})

// Middleware
app.use(cors())
app.use(express.json())

// Google OAuth2 configuration
const CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.VITE_GOOGLE_CLIENT_SECRET
const REDIRECT_URI = 'http://localhost:3001/auth/google/callback'
const CALENDAR_ID = process.env.VITE_GOOGLE_CALENDAR_ID || 'primary'

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
)

// Token persistence functions
const saveTokens = (tokens) => {
  try {
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2))
    console.log('✅ Tokens saved to file')
  } catch (error) {
    console.error('❌ Failed to save tokens:', error)
  }
}

const loadTokens = () => {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      const tokens = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'))
      console.log('✅ Tokens loaded from file')
      return tokens
    }
  } catch (error) {
    console.error('❌ Failed to load tokens:', error)
  }
  return null
}

// Load tokens on startup
const savedTokens = loadTokens()
if (savedTokens) {
  oauth2Client.setCredentials(savedTokens)
  console.log('🔐 Restored authentication from saved tokens')
}

// Google Calendar API
const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend proxy is running',
    oauthConfigured: !!(CLIENT_ID && CLIENT_SECRET),
    calendarId: CALENDAR_ID,
    hasTokens: !!(oauth2Client.credentials && oauth2Client.credentials.access_token)
  })
})

// OAuth2 authentication endpoints
app.get('/auth/google', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events'
  ]
  
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  })
  
  res.json({ authUrl })
})

app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query
  
  try {
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)
    
    // Save tokens to file for persistence
    saveTokens(tokens)
    
    res.json({ 
      success: true, 
      message: 'Authentication successful',
      tokens: {
        access_token: tokens.access_token ? '***' : undefined,
        refresh_token: tokens.refresh_token ? '***' : undefined,
        expiry_date: tokens.expiry_date
      }
    })
  } catch (error) {
    console.error('OAuth callback error:', error)
    // Handle invalid client credentials from Google
    if (error.message && error.message.includes('invalid_client')) {
      return res.status(400).json({
        error: 'Invalid OAuth2 client credentials',
        message: 'Invalid client ID or secret. Check VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_CLIENT_SECRET and authorized redirect URI in Google Cloud Console.'
      })
    }
    res.status(500).json({ 
      error: 'Authentication failed',
      message: error.message 
    })
  }
})

// Clear authentication endpoint
app.post('/auth/clear', (req, res) => {
  try {
    oauth2Client.setCredentials({})
    if (fs.existsSync(TOKEN_FILE)) {
      fs.unlinkSync(TOKEN_FILE)
    }
    console.log('🗑️ Authentication cleared')
    res.json({ success: true, message: 'Authentication cleared' })
  } catch (error) {
    console.error('Failed to clear authentication:', error)
    res.status(500).json({ error: 'Failed to clear authentication' })
  }
})

// Root endpoint: redirect to health check for simple port tests
app.get('/', (req, res) => {
  res.redirect('/api/health')
})

// Test Google Calendar API connection
app.get('/api/calendar/test', async (req, res) => {
  try {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      return res.status(400).json({ 
        error: 'OAuth2 not configured',
        message: 'Please set VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_CLIENT_SECRET in your .env file'
      })
    }

    // Check if we have valid credentials
    const credentials = oauth2Client.credentials
    if (!credentials || !credentials.access_token) {
      return res.status(401).json({
        error: 'Not authenticated',
        message: 'Please authenticate with Google OAuth2 first',
        authUrl: '/auth/google'
      })
    }

    console.log('🧪 Testing Google Calendar API connection...')
    
    // Test 1: Get calendar list
    const calendarListResponse = await calendar.calendarList.list()
    console.log('✅ Calendar list test successful')

    // Test 2: Get events from primary calendar
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    const eventsResponse = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: now.toISOString(),
      timeMax: nextWeek.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    })
    
    console.log('✅ Events test successful')

    res.json({
      success: true,
      message: 'Google Calendar API is working correctly',
      tests: {
        calendarList: {
          status: 'passed',
          calendarsFound: calendarListResponse.data.items?.length || 0
        },
        events: {
          status: 'passed',
          eventsFound: eventsResponse.data.items?.length || 0
        }
      },
      calendarId: CALENDAR_ID,
      authenticated: true
    })

  } catch (error) {
    console.error('❌ Backend test failed:', error)
    
    if (error.code === 401) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Please authenticate with Google OAuth2',
        authUrl: '/auth/google'
      })
    } else {
      res.status(500).json({
        error: 'Backend test failed',
        message: error.message
      })
    }
  }
})

// Get calendar events
app.get('/api/calendar/events', async (req, res) => {
  try {
    const { timeMin, timeMax, calendarId = CALENDAR_ID } = req.query

    if (!CLIENT_ID || !CLIENT_SECRET) {
      return res.status(400).json({ 
        error: 'OAuth2 not configured' 
      })
    }

    if (!timeMin || !timeMax) {
      return res.status(400).json({ 
        error: 'timeMin and timeMax parameters are required' 
      })
    }

    const response = await calendar.events.list({
      calendarId: calendarId,
      timeMin: timeMin,
      timeMax: timeMax,
      singleEvents: true,
      orderBy: 'startTime'
    })
    
    res.json(response.data)

  } catch (error) {
    console.error('Error fetching events:', error)
    res.status(500).json({
      error: 'Failed to fetch events',
      message: error.message
    })
  }
})

// Get calendar list
app.get('/api/calendar/list', async (req, res) => {
  try {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      return res.status(400).json({ 
        error: 'OAuth2 not configured' 
      })
    }

    const response = await calendar.calendarList.list()
    res.json(response.data)

  } catch (error) {
    console.error('Error fetching calendar list:', error)
    res.status(500).json({
      error: 'Failed to fetch calendar list',
      message: error.message
    })
  }
})

// Whisper.cpp endpoint for voice transcription
app.post('/api/whisper', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' })
    }

    const audioFilePath = req.file.path
    const whisperPath = process.env.WHISPER_CPP_PATH || './whisper.cpp/main'
    const modelPath = process.env.WHISPER_MODEL_PATH || './whisper.cpp/models/ggml-base.en.bin'

    // Check if whisper.cpp executable exists
    if (!fs.existsSync(whisperPath)) {
      console.error('Whisper.cpp not found at:', whisperPath)
      return res.status(500).json({ 
        error: 'Whisper.cpp not configured',
        message: 'Please install whisper.cpp and set WHISPER_CPP_PATH environment variable'
      })
    }

    // Convert webm to wav if needed (whisper.cpp expects wav)
    const wavFilePath = audioFilePath.replace(/\.[^/.]+$/, '.wav')
    
    // For now, we'll use the original file and let whisper.cpp handle it
    // In production, you might want to convert webm to wav first
    
    // Run whisper.cpp
    const whisperProcess = spawn(whisperPath, [
      '-m', modelPath,
      '-f', audioFilePath,
      '--output-txt',
      '--output-words',
      '--language', 'en',
      '--no-timestamps'
    ])

    let transcription = ''
    let errorOutput = ''

    whisperProcess.stdout.on('data', (data) => {
      transcription += data.toString()
    })

    whisperProcess.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })

    whisperProcess.on('close', (code) => {
      // Clean up uploaded file
      fs.unlinkSync(audioFilePath)

      if (code !== 0) {
        console.error('Whisper.cpp error:', errorOutput)
        return res.status(500).json({
          error: 'Transcription failed',
          message: errorOutput
        })
      }

      // Extract text from whisper output
      const lines = transcription.split('\n')
      const textLine = lines.find(line => line.trim() && !line.startsWith('['))
      const text = textLine ? textLine.trim() : ''

      console.log('🎤 Whisper transcription:', text)
      
      res.json({
        success: true,
        text: text,
        confidence: 0.9 // Mock confidence score
      })
    })

  } catch (error) {
    console.error('Whisper endpoint error:', error)
    res.status(500).json({
      error: 'Transcription failed',
      message: error.message
    })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend proxy server running on http://localhost:${PORT}`)
  console.log(`🔧 OAuth2 configured: ${!!(CLIENT_ID && CLIENT_SECRET)}`)
  console.log(`📅 Calendar ID: ${CALENDAR_ID}`)
  console.log(`🎤 Whisper.cpp path: ${process.env.WHISPER_CPP_PATH || './whisper.cpp/main'}`)
}) 
