export interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  end: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  location?: string
  attendees?: Array<{
    email: string
    displayName?: string
    responseStatus?: string
  }>
  organizer?: {
    email: string
    displayName?: string
  }
  colorId?: string
  htmlLink?: string
}

export interface CalendarApiResponse {
  items: CalendarEvent[]
  nextPageToken?: string
  timeZone: string
  updated: string
}

export interface VoiceCommand {
  type: 'navigate' | 'add_event' | 'search' | 'help'
  payload: any
} 