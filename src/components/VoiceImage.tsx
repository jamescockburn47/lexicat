import React, { useState } from 'react'
import VoiceControl from './VoiceControl'
import { Image, Loader } from 'lucide-react'
import { backendUrl } from '../utils/backend'

const VoiceImage: React.FC = () => {
  const [isListening, setIsListening] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleCommand = async (command: string) => {
    setPrompt(command)
    setIsLoading(true)
    setImageUrl(null)

    try {
      const response = await fetch(backendUrl('/api/image'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: command })
      })

      const data = await response.json()
      if (response.ok && data.url) {
        setImageUrl(data.url as string)
      } else {
        console.error('Image generation failed:', data)
      }
    } catch (error) {
      console.error('Image generation error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="glass-effect p-8 rounded-xl text-center w-full max-w-md">
        <Image className="w-16 h-16 mx-auto mb-4 text-primary-500" />
        <h1 className="text-2xl font-bold mb-2">Voice Image Generator</h1>
        <p className="text-gray-400 mb-6">Speak a prompt to create an image with OpenAI</p>
        <div className="flex justify-center mb-4">
          <VoiceControl
            isListening={isListening}
            onListeningChange={setIsListening}
            onCommand={handleCommand}
          />
        </div>
        {prompt && <p className="text-sm text-gray-400">Prompt: "{prompt}"</p>}
        {isLoading && <Loader className="w-6 h-6 mx-auto mt-4 animate-spin" />}
        {imageUrl && (
          <div className="mt-4">
            <img src={imageUrl} alt="Generated" className="rounded-lg mx-auto" />
          </div>
        )}
      </div>
    </div>
  )
}

export default VoiceImage
