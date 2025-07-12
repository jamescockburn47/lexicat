import { CalendarEvent, CalendarApiResponse } from '../types/calendar'

const BACKEND_API_BASE = 'http://localhost:3001/api'

interface GoogleCalendarConfig {
  apiKey: string
  calendarId: string
}

class GoogleCalendarService {
  private config: GoogleCalendarConfig

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY || '',
      calendarId: import.meta.env.VITE_GOOGLE_CALENDAR_ID || 'primary'
    }
    console.log('🔧 GoogleCalendarService initialized with:')
    console.log('  API Key:', this.config.apiKey ? `${this.config.apiKey.substring(0, 10)}...` : 'NOT SET')
    console.log('  Calendar ID:', this.config.calendarId)
    console.log('  Backend API:', BACKEND_API_BASE)
  }

  private async makeBackendRequest(endpoint: string, params: Record<string, string> = {}) {
    const url = new URL(`${BACKEND_API_BASE}${endpoint}`)
    
    // Add parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })

    console.log('🔗 Backend request URL:', url.toString())
    console.log('📡 Making backend request...')

    const response = await fetch(url.toString())
    
    console.log('📡 Backend response status:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Backend API Error response:', errorText)
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('✅ Backend API request successful')
    return data
  }

  async getEvents(timeMin: string, timeMax: string): Promise<CalendarEvent[]> {
    try {
      console.log('🌐 Making backend request for events...')
      console.log('Calendar ID:', this.config.calendarId)
      
      const params = {
        timeMin,
        timeMax,
        calendarId: this.config.calendarId
      }

      console.log('📤 Request params:', params)

      const data: CalendarApiResponse = await this.makeBackendRequest('/calendar/events', params)

      console.log('📥 Backend Response:', data)
      console.log('📋 Events count:', data.items?.length || 0)

      return data.items || []
    } catch (error) {
      console.error('❌ Error fetching events via backend:', error)
      throw error
    }
  }

  async createEvent(event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      const response = await fetch(`${BACKEND_API_BASE}/calendar/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...event,
          calendarId: this.config.calendarId
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to create event: ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      console.error('Error creating Google Calendar event:', error)
      throw error
    }
  }

  async updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      const response = await fetch(`${BACKEND_API_BASE}/calendar/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...event,
          calendarId: this.config.calendarId
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update event: ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      console.error('Error updating Google Calendar event:', error)
      throw error
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    try {
      const response = await fetch(`${BACKEND_API_BASE}/calendar/events/${eventId}?calendarId=${encodeURIComponent(this.config.calendarId)}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Failed to delete event: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error deleting Google Calendar event:', error)
      throw error
    }
  }

  isConfigured(): boolean {
    const configured = !!this.config.apiKey
    console.log('🔍 Configuration check:', configured ? '✅ Configured' : '❌ Not configured')
    return configured
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing backend connection...')
      const response = await fetch(`${BACKEND_API_BASE}/calendar/test`)
      console.log('🧪 Backend test response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('🧪 Backend test failed:', errorData)
        return false
      }
      
      const data = await response.json()
      console.log('🧪 Backend test successful:', data)
      return true
    } catch (error) {
      console.error('🧪 Backend test connection failed:', error)
      return false
    }
  }

  async getCalendarList(): Promise<any[]> {
    try {
      console.log('📋 Fetching calendar list via backend...')
      const data = await this.makeBackendRequest('/calendar/list')
      return data.items || []
    } catch (error) {
      console.error('Error fetching calendar list:', error)
      throw error
    }
  }
}

export const googleCalendarService = new GoogleCalendarService() 