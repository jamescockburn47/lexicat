import React from 'react'
import { format, isToday, isTomorrow, isYesterday } from 'date-fns'
import { CalendarEvent } from '../types/calendar'
import { Clock, MapPin, Users, Loader2 } from 'lucide-react'

interface SidebarProps {
  events: CalendarEvent[]
  currentDate: Date
  loading: boolean
}

const Sidebar: React.FC<SidebarProps> = ({ events, currentDate, loading }) => {
  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    if (isYesterday(date)) return 'Yesterday'
    return format(date, 'EEEE, MMMM d')
  }

  const formatTime = (dateTime: string) => {
    return format(new Date(dateTime), 'h:mm a')
  }

  const sortedEvents = events.sort((a, b) => {
    const aTime = new Date(a.start.dateTime || a.start.date)
    const bTime = new Date(b.start.dateTime || b.start.date)
    return aTime.getTime() - bTime.getTime()
  })

  return (
    <div className="w-80 bg-dark-800/50 backdrop-blur-md border-r border-white/10 p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">
          {getDateLabel(currentDate)}
        </h2>
        <p className="text-gray-400">
          {events.length} event{events.length !== 1 ? 's' : ''} today
        </p>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            <span className="ml-2 text-gray-400">Loading events...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">No events scheduled</div>
            <div className="text-sm text-gray-500">
              Enjoy your free time!
            </div>
          </div>
        ) : (
          sortedEvents.map(event => (
            <div
              key={event.id}
              className="sidebar-panel animate-fade-in"
            >
              {/* Event Header */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg leading-tight">
                  {event.summary}
                </h3>
                <div className="flex items-center text-sm text-gray-400">
                  <Clock className="w-4 h-4 mr-1" />
                  {event.start.dateTime ? (
                    formatTime(event.start.dateTime)
                  ) : (
                    'All day'
                  )}
                </div>
              </div>

              {/* Event Details */}
              {event.description && (
                <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                  {event.description}
                </p>
              )}

              {/* Location */}
              {event.location && (
                <div className="flex items-center text-sm text-gray-400 mb-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}

              {/* Attendees */}
              {event.attendees && event.attendees.length > 0 && (
                <div className="flex items-center text-sm text-gray-400">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}</span>
                </div>
              )}

              {/* Time Range */}
              {event.start.dateTime && event.end.dateTime && (
                <div className="mt-3 pt-3 border-t border-white/10 text-xs text-gray-400">
                  {formatTime(event.start.dateTime)} - {formatTime(event.end.dateTime)}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full text-left p-3 rounded-lg hover:bg-white/10 transition-colors">
            <div className="font-medium">Add Event</div>
            <div className="text-sm text-gray-400">Create new calendar event</div>
          </button>
          <button className="w-full text-left p-3 rounded-lg hover:bg-white/10 transition-colors">
            <div className="font-medium">View Week</div>
            <div className="text-sm text-gray-400">See weekly schedule</div>
          </button>
          <button className="w-full text-left p-3 rounded-lg hover:bg-white/10 transition-colors">
            <div className="font-medium">Settings</div>
            <div className="text-sm text-gray-400">Configure calendar</div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar 