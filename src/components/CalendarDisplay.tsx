import React from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek } from 'date-fns'
import { CalendarEvent } from '../types/calendar'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarDisplayProps {
  events: CalendarEvent[]
  currentDate: Date
  onDateChange: (date: Date) => void
}

const CalendarDisplay: React.FC<CalendarDisplayProps> = ({ 
  events, 
  currentDate, 
  onDateChange 
}) => {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  
  // Get the start and end of the week that contains the month
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  
  // Get all days for the calendar grid (including padding days)
  const daysInCalendar = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start.dateTime || event.start.date || '')
      return isSameDay(eventDate, day)
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    onDateChange(newDate)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 glass-effect">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          title="Previous month"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <h1 className="text-3xl font-bold">
          {format(currentDate, 'MMMM yyyy')}
        </h1>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          title="Next month"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 p-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-300 p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {daysInCalendar.map((day, index) => {
            const dayEvents = getEventsForDay(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isCurrentDay = isToday(day)

            return (
              <div
                key={index}
                className={`
                  min-h-[120px] p-2 rounded-lg border border-white/10
                  ${isCurrentMonth ? 'bg-white/5' : 'bg-white/2 text-gray-500'}
                  ${isCurrentDay ? 'ring-2 ring-primary-500 bg-primary-500/20' : ''}
                  hover:bg-white/10 transition-colors cursor-pointer
                `}
                onClick={() => onDateChange(day)}
              >
                <div className="text-sm font-medium mb-1">
                  {format(day, 'd')}
                </div>
                
                {/* Events for this day */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      className="text-xs p-1 rounded calendar-event truncate"
                      title={event.summary}
                    >
                      {event.summary}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-400">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CalendarDisplay 