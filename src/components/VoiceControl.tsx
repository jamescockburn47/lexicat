import React, { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Volume2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface VoiceControlProps {
  isListening: boolean
  onListeningChange: (listening: boolean) => void
  onCommand: (command: string) => void
}

const VoiceControl: React.FC<VoiceControlProps> = ({
  isListening,
  onListeningChange,
  onCommand
}) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        setIsProcessing(true)
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        
        try {
          // Here you would integrate with Whisper API
          // For now, we'll simulate the transcription
          await processAudioWithWhisper(audioBlob)
        } catch (error) {
          console.error('Error processing audio:', error)
          toast.error('Failed to process voice command')
        } finally {
          setIsProcessing(false)
        }
      }

      mediaRecorder.start()
      onListeningChange(true)
      toast.success('Listening...')
    } catch (error) {
      console.error('Error accessing microphone:', error)
      toast.error('Microphone access denied')
    }
  }

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      onListeningChange(false)
    }
  }

  const processAudioWithWhisper = async (audioBlob: Blob) => {
    // Simulate Whisper API call
    // In a real implementation, you would send the audio to Whisper API
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock transcription result - updated for Pi 5 use case
    const mockCommands = [
      'tomorrow',
      'yesterday',
      'today',
      'next week',
      'previous week',
      'refresh',
      'help'
    ]
    
    const randomCommand = mockCommands[Math.floor(Math.random() * mockCommands.length)]
    
    // Process the command
    onCommand(randomCommand)
    toast.success(`Command: ${randomCommand}`)
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return (
    <div className="relative">
      <button
        onClick={toggleListening}
        disabled={isProcessing}
        className={`
          relative w-16 h-16 rounded-full flex items-center justify-center
          transition-all duration-300 transform hover:scale-110
          ${isListening 
            ? 'voice-indicator shadow-lg' 
            : 'bg-primary-600 hover:bg-primary-700'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        title={isListening ? 'Stop listening' : 'Start voice control'}
      >
        {isProcessing ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isListening ? (
          <MicOff className="w-6 h-6 text-white" />
        ) : (
          <Mic className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Voice indicator ring */}
      {isListening && (
        <div className="absolute inset-0 rounded-full border-2 border-primary-400 animate-ping" />
      )}

      {/* Status indicator */}
      <div className="absolute -top-2 -right-2">
        <div className={`
          w-3 h-3 rounded-full
          ${isListening ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}
        `} />
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-dark-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
        {isListening ? 'Listening...' : 'Voice Control'}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-dark-800" />
      </div>
    </div>
  )
}

export default VoiceControl 