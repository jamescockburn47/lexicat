import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { CalendarEvent } from '../types/calendar'

interface UseCalendarReturn {
  events: CalendarEvent[]
  loading: boolean
  error: string | null
  refreshEvents: () => void
  isConfigured: boolean
}

export const useCalendar = (date: Date): UseCalendarReturn => {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConfigured, setIsConfigured] = useState(false)

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Checking backend configuration...')
      
      // Check if backend is running and configured
      const healthResponse = await fetch('/api/health')
      const healthData = await healthResponse.json()
      
      if (!healthData.oauthConfigured) {
        console.log('❌ Backend OAuth2 not configured')
        setIsConfigured(false)
        setError('Backend OAuth2 not configured. Please check your .env file.')
        setEvents([])
        return
      }

      console.log('✅ Backend is configured')
      setIsConfigured(true)
      
      // Test the connection first
      const testResponse = await fetch('/api/calendar/test')
      console.log('🧪 Connection test result:', testResponse.status)
      
      if (testResponse.status === 401) {
        throw new Error('Authentication required. Please authenticate with Google OAuth2 first.')
      }
      
      if (!testResponse.ok) {
        const errorData = await testResponse.json()
        throw new Error(`Backend connection failed: ${errorData.error || 'Unknown error'}`)
      }
      
      // Get the start and end of the month
      const timeMin = format(startOfMonth(date), "yyyy-MM-dd'T'HH:mm:ss'Z'")
      const timeMax = format(endOfMonth(date), "yyyy-MM-dd'T'HH:mm:ss'Z'")
      
      console.log('📅 Fetching events for:', date.toISOString())
      console.log('Time range:', { timeMin, timeMax })
      
      // Fetch events from backend
      const eventsResponse = await fetch(`/api/calendar/events?timeMin=${timeMin}&timeMax=${timeMax}`)
      
      if (!eventsResponse.ok) {
        const errorData = await eventsResponse.json()
        throw new Error(`Failed to fetch events: ${errorData.error || 'Unknown error'}`)
      }
      
      const data = await eventsResponse.json()
      const calendarEvents = data.items || []
      
      console.log('📋 Received events:', calendarEvents.length)
      console.log('Events:', calendarEvents)
      
      setEvents(calendarEvents)
    } catch (err) {
      console.error('❌ Error fetching events:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch events')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const refreshEvents = () => {
    fetchEvents()
  }

  useEffect(() => {
    fetchEvents()
  }, [date])

  return {
    events,
    loading,
    error,
    refreshEvents,
    isConfigured
  }
} 
