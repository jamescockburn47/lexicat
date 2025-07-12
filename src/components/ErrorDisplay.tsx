import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorDisplayProps {
  error: string | null
  onRetry: () => void
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
  if (!error) return null

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="max-w-md mx-auto p-8 glass-effect rounded-2xl text-center">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
        <h2 className="text-2xl font-bold mb-4 text-red-400">Error Loading Calendar</h2>
        <p className="text-gray-300 mb-6">{error}</p>
        
        <div className="space-y-4">
          <button
            onClick={onRetry}
            className="flex items-center justify-center w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
          
          <div className="text-sm text-gray-400">
            <p>Common issues:</p>
            <ul className="mt-2 space-y-1 text-left">
              <li>• Check your API key is correct</li>
              <li>• Verify your calendar ID</li>
              <li>• Ensure Calendar API is enabled</li>
              <li>• Check browser console for details</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorDisplay 