import React, { useState, useEffect, useRef } from 'react'
import { format, startOfDay, endOfDay, isToday, isTomorrow, isYesterday } from 'date-fns'
import { CalendarEvent } from '../types/calendar'
import { useCalendar } from '../hooks/useCalendar'
import { Clock, MapPin, Users, Mic, MicOff, Volume2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import CalendarDisplay from './CalendarDisplay'
import { backendUrl } from '../utils/backend'

const HomeHub: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const { events, loading, error, isConfigured, refreshEvents } = useCalendar(currentDate)
  const [isListening, setIsListening] = useState(true) // Always listening
  const [lastCommand, setLastCommand] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [wakeWordDetected, setWakeWordDetected] = useState(false)
  const [isAwake, setIsAwake] = useState(false)
  // current active view: 'calendar', 'weather', 'news', 'tasks'
  const [activeFunction, setActiveFunction] = useState<'calendar' | 'weather' | 'news' | 'tasks'>('calendar')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const todayEvents = events.filter(event => {
    const eventDateTime = event.start.dateTime || event.start.date
    if (!eventDateTime) return false
    const eventDate = new Date(eventDateTime)
    return eventDate >= startOfDay(currentDate) && eventDate <= endOfDay(currentDate)
  })

  const sortedEvents = todayEvents.sort((a, b) => {
    const aTime = new Date(a.start.dateTime || a.start.date || '')
    const bTime = new Date(b.start.dateTime || b.start.date || '')
    return aTime.getTime() - bTime.getTime()
  })

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    if (isYesterday(date)) return 'Yesterday'
    return format(date, 'EEEE, MMMM d')
  }

  const formatTime = (dateTime: string) => {
    return format(new Date(dateTime), 'h:mm a')
  }

  // Voice-activated recording setup (VAD)
  useEffect(() => {
    let audioContext: AudioContext | null = null
    let analyser: AnalyserNode
    let dataArray: Uint8Array
    let sourceNode: MediaStreamAudioSourceNode | null = null
    let silenceTimer: number | null = null
    let intervalId: number | null = null

    const vadThreshold = 0.1
    const maxSilenceTime = 1000 // ms of silence to stop recording

    navigator.mediaDevices
      .getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      })
      .then((stream) => {
        audioContext = new AudioContext()
        analyser = audioContext.createAnalyser()
        analyser.fftSize = 512
        dataArray = new Uint8Array(analyser.fftSize)

        sourceNode = audioContext.createMediaStreamSource(stream)
        sourceNode.connect(analyser)

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus',
        })
        mediaRecorderRef.current = mediaRecorder
        audioChunksRef.current = []

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data)
        }

        mediaRecorder.onstop = async () => {
          if (audioChunksRef.current.length > 0) {
            setIsProcessing(true)
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
            try {
              await processAudioWithWhisper(audioBlob)
            } catch (error) {
              console.error('Error processing audio:', error)
            } finally {
              setIsProcessing(false)
            }
            audioChunksRef.current = []
          }
        }

        setIsListening(true)

        const checkVolume = () => {
          analyser.getByteTimeDomainData(dataArray)
          let sumSquares = 0
          for (let i = 0; i < dataArray.length; i++) {
            const norm = (dataArray[i] - 128) / 128
            sumSquares += norm * norm
          }
          const rms = Math.sqrt(sumSquares / dataArray.length)
          if (rms > vadThreshold) {
            if (mediaRecorderRef.current?.state === 'inactive') {
              mediaRecorderRef.current.start()
            }
            if (silenceTimer) {
              clearTimeout(silenceTimer)
              silenceTimer = null
            }
          } else if (
            mediaRecorderRef.current?.state === 'recording' &&
            silenceTimer === null
          ) {
            silenceTimer = window.setTimeout(() => {
              mediaRecorderRef.current?.stop()
              silenceTimer = null
            }, maxSilenceTime)
          }
        }

        intervalId = window.setInterval(checkVolume, 100)
      })
      .catch((error) => {
        console.error('Error accessing microphone:', error)
        setIsListening(false)
      })

    return () => {
      if (intervalId) clearInterval(intervalId)
      if (silenceTimer) clearTimeout(silenceTimer)
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop())
      }
      sourceNode?.disconnect()
      analyser?.disconnect()
      audioContext?.close()
    }
  }, [])

  const processAudioWithWhisper = async (audioBlob: Blob) => {
    try {
      console.log('🎤 Processing audio with whisper...')
      
      // Send audio to whisper.cpp endpoint
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.wav')

      const response = await fetch(backendUrl('/api/whisper'), {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        const transcription = result.text.trim().toLowerCase()

        console.log('🎤 Whisper result:', transcription)
        if (transcription) {
          handleVoiceCommand(transcription)
        }
      } else {
        console.error('Whisper API error:', response.statusText)
      }
    } catch (error) {
      console.error('Error calling whisper API:', error)
    }
  }

  const handleVoiceCommand = (command: string) => {
    console.log('Voice command received:', command)
    setLastCommand(command)
    
    const lowerCommand = command.toLowerCase()
    
    // Check for wake word "lexicat"
    if (lowerCommand.includes('lexicat')) {
      setWakeWordDetected(true)
      setIsAwake(true)
      
      // Remove wake word from command
      const cleanCommand = lowerCommand.replace('lexicat', '').trim()
      
      // Handle navigation commands
      if (cleanCommand.includes('tomorrow') || cleanCommand.includes('next day')) {
        const tomorrow = new Date(currentDate)
        tomorrow.setDate(tomorrow.getDate() + 1)
        setCurrentDate(tomorrow)
      } else if (cleanCommand.includes('yesterday') || cleanCommand.includes('previous day')) {
        const yesterday = new Date(currentDate)
        yesterday.setDate(yesterday.getDate() - 1)
        setCurrentDate(yesterday)
      } else if (cleanCommand.includes('today') || cleanCommand.includes('current day')) {
        setCurrentDate(new Date())
      } else if (cleanCommand.includes('next week')) {
        const nextWeek = new Date(currentDate)
        nextWeek.setDate(nextWeek.getDate() + 7)
        setCurrentDate(nextWeek)
      } else if (cleanCommand.includes('previous week') || cleanCommand.includes('last week')) {
        const lastWeek = new Date(currentDate)
        lastWeek.setDate(lastWeek.getDate() - 7)
        setCurrentDate(lastWeek)
      }
      
      // Handle refresh commands
      if (cleanCommand.includes('refresh') || cleanCommand.includes('update')) {
        refreshEvents()
      }
      
      // Handle help commands
      if (cleanCommand.includes('help') || cleanCommand.includes('commands')) {
        // Could show a help overlay or list available voice commands
        console.log('Available commands: lexicat [today|tomorrow|yesterday|next week|previous week|refresh], lexicat switch to [calendar|weather|news|tasks], lexicat help')
      }

      // Handle switch to other functions
      if (cleanCommand.includes('switch to weather') || cleanCommand.includes('weather')) {
        setActiveFunction('weather')
      } else if (cleanCommand.includes('switch to news') || cleanCommand.includes('news')) {
        setActiveFunction('news')
      } else if (cleanCommand.includes('switch to tasks') || cleanCommand.includes('tasks') || cleanCommand.includes('todo')) {
        setActiveFunction('tasks')
      } else if (cleanCommand.includes('switch to calendar') || cleanCommand.includes('calendar')) {
        setActiveFunction('calendar')
      }
      
      // Reset wake word detection after 3 seconds
      setTimeout(() => {
        setWakeWordDetected(false)
        setIsAwake(false)
      }, 3000)
    }
  }

  // Show error display if there's an error
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
        <div className="text-center">
          <div className="text-red-400 text-2xl mb-4">⚠️ Error Loading Calendar</div>
          <div className="text-gray-400 mb-4">{error}</div>
          <button 
            onClick={refreshEvents}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Show setup guide if Google Calendar is not configured
  if (!isConfigured) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
        <div className="text-center">
          <div className="text-yellow-400 text-2xl mb-4">⚙️ Setup Required</div>
          <div className="text-gray-400 mb-4">Google Calendar needs to be configured</div>
          <div className="text-sm text-gray-500">
            Please configure your Google Calendar integration
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center space-x-4">
          <Calendar className="w-6 h-6 text-primary-500" />
          <div>
            <h1 className="text-xl font-bold text-white">Home Hub</h1>
            <p className="text-sm text-gray-400">{getDateLabel(currentDate)}</p>
          </div>
        </div>
        
                  {/* Voice Status */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-sm text-gray-400">
                {isListening ? 'Listening' : 'Mic Off'}
              </span>
            </div>
            {isProcessing && (
              <div className="text-sm text-yellow-400 font-medium animate-pulse">
                Processing...
              </div>
            )}
            {wakeWordDetected && (
              <div className="text-sm text-green-400 font-medium">
                Lexicat detected!
              </div>
            )}
            {lastCommand && (
              <div className="text-sm text-gray-400">
                Last: "{lastCommand}"
              </div>
            )}
          </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {activeFunction === 'calendar' && (
          <>
            {/* Events Panel - Left Side */}
            <div className="w-1/3 p-4 border-r border-white/10">
              <div className="mb-4">
            <h2 className="text-lg font-semibold text-white mb-1">
              {getDateLabel(currentDate)} Events
            </h2>
                <p className="text-sm text-gray-400">
                  {sortedEvents.length} event{sortedEvents.length !== 1 ? 's' : ''} scheduled
                </p>
              </div>

              <div className="space-y-1">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    <span className="ml-2 text-sm text-gray-400">Loading events...</span>
                  </div>
                ) : sortedEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-sm mb-1">No events scheduled</div>
                    <div className="text-xs text-gray-500">Enjoy your free time!</div>
                  </div>
                ) : (
                  sortedEvents.map((event) => (
                    <div key={event.id} className="event-line">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="flex items-center text-xs text-primary-400 mr-3 flex-shrink-0">
                            <Clock className="w-3 h-3 mr-1" />
                            {event.start.dateTime
                              ? formatTime(event.start.dateTime)
                              : 'All day'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-white font-medium truncate">
                              {event.summary}
                            </div>
                            {event.location && (
                              <div className="text-xs text-gray-400 truncate">
                                📍 {event.location}
                              </div>
                            )}
                          </div>
                        </div>
                        {event.attendees && event.attendees.length > 0 && (
                          <div className="flex items-center text-xs text-gray-400 ml-2 flex-shrink-0">
                            <Users className="w-3 h-3 mr-1" />
                            <span>{event.attendees.length}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Monthly Calendar - Right Side */}
            <div className="w-2/3">
              <CalendarDisplay
                events={events}
                currentDate={currentDate}
                onDateChange={setCurrentDate}
              />
            </div>
          </>
        )}
        {activeFunction === 'weather' && (
          <div className="flex-1 p-8 text-center text-white">
            <h2 className="text-2xl font-semibold mb-4">Weather View</h2>
            <p>Weather information will appear here.</p>
          </div>
        )}
        {activeFunction === 'news' && (
          <div className="flex-1 p-8 text-center text-white">
            <h2 className="text-2xl font-semibold mb-4">News View</h2>
            <p>Latest news headlines will appear here.</p>
          </div>
        )}
        {activeFunction === 'tasks' && (
          <div className="flex-1 p-8 text-center text-white">
            <h2 className="text-2xl font-semibold mb-4">Tasks View</h2>
            <p>Your tasks and to-dos will appear here.</p>
          </div>
        )}
      </div>

      {/* Voice Commands Help - Fixed at bottom */}
      <div className="p-3 border-t border-white/10 bg-dark-800/50">
        <div className="text-center text-xs text-gray-400 mb-2">
          <span className="font-medium">Wake Word:</span> "Lexicat" + navigation commands ("today", "tomorrow", "yesterday", "next week", "previous week", "refresh"), or switch commands ("switch to calendar", "switch to weather", "switch to news", "switch to tasks")
        </div>
        <div className="text-center">
            <button
              onClick={() => {
                const testCommands = [
                  'lexicat tomorrow',
                  'lexicat yesterday',
                  'lexicat today',
                  'lexicat next week',
                  'lexicat previous week',
                  'lexicat refresh',
                  'lexicat switch to weather',
                  'lexicat switch to news',
                  'lexicat switch to tasks',
                  'lexicat switch to calendar',
                ]
                const randomCommand = testCommands[Math.floor(Math.random() * testCommands.length)]
                handleVoiceCommand(randomCommand)
              }}
              className="px-3 py-1 text-xs bg-primary-600 hover:bg-primary-700 rounded transition-colors"
            >
              Test Voice Command
            </button>
        </div>
      </div>
    </div>
  )
}

export default HomeHub 
