import React from 'react'
import { Settings, Calendar, Shield, Copy, ExternalLink } from 'lucide-react'

const SetupGuide: React.FC = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="max-w-2xl mx-auto p-8 glass-effect rounded-2xl">
        <div className="text-center mb-8">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-primary-500" />
          <h1 className="text-3xl font-bold mb-2">Welcome to Home Hub</h1>
          <p className="text-gray-400">Set up Google Calendar OAuth2 integration to get started</p>
        </div>

        <div className="space-y-6">
          {/* Step 1: Google Cloud Console */}
          <div className="bg-dark-800/50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                1
              </div>
              <h3 className="text-lg font-semibold">Create Google Cloud Project</h3>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 ml-11">
              <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">Google Cloud Console</a></li>
              <li>Create a new project or select an existing one</li>
              <li>Enable the Google Calendar API</li>
              <li>Create OAuth2 credentials (not API key)</li>
              <li>Add redirect URI: <code className="bg-dark-700 px-2 py-1 rounded">http://localhost:3001/auth/google/callback</code></li>
            </ol>
          </div>

          {/* Step 2: Environment Variables */}
          <div className="bg-dark-800/50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                2
              </div>
              <h3 className="text-lg font-semibold">Configure Environment Variables</h3>
            </div>
            <p className="text-gray-300 mb-4">Create a <code className="bg-dark-700 px-2 py-1 rounded">.env</code> file in the project root:</p>
            
            <div className="bg-dark-700 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Environment Variables</span>
                <button 
                  onClick={() => copyToClipboard(`VITE_GOOGLE_CLIENT_ID=your_oauth2_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_oauth2_client_secret_here
VITE_GOOGLE_CALENDAR_ID=your_calendar_id_here`)}
                  className="text-primary-400 hover:text-primary-300 text-sm flex items-center"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </button>
              </div>
              <pre className="text-sm text-green-400 overflow-x-auto">
{`VITE_GOOGLE_CLIENT_ID=your_oauth2_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_oauth2_client_secret_here
VITE_GOOGLE_CALENDAR_ID=your_calendar_id_here`}
              </pre>
            </div>
          </div>

          {/* Step 3: OAuth2 Setup */}
          <div className="bg-dark-800/50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                3
              </div>
              <h3 className="text-lg font-semibold">OAuth2 Configuration</h3>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 ml-11">
              <li>Go to <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">OAuth Consent Screen</a></li>
              <li>Add your email as a test user</li>
              <li>Or change publishing status to "In production"</li>
              <li>Make sure Calendar API scopes are enabled</li>
            </ol>
          </div>

          {/* Step 4: Authentication */}
          <div className="bg-dark-800/50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                4
              </div>
              <h3 className="text-lg font-semibold">Authenticate with Google</h3>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 ml-11">
              <li>Start the backend server: <code className="bg-dark-700 px-2 py-1 rounded">npm run server</code></li>
              <li>Go to <a href="http://localhost:5173/auth" className="text-primary-400 hover:underline">Authentication Test</a></li>
              <li>Click "Authenticate" to start OAuth2 flow</li>
              <li>Complete Google authentication in new tab</li>
              <li>Click "Check Status" to verify</li>
            </ol>
          </div>

          {/* Step 5: Restart */}
          <div className="bg-dark-800/50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                5
              </div>
              <h3 className="text-lg font-semibold">Access Home Hub</h3>
            </div>
            <p className="text-gray-300">After authentication is complete, access the main application:</p>
            <div className="bg-dark-700 rounded-lg p-4 mt-2">
              <a href="http://localhost:5173/home" className="text-primary-400 hover:text-primary-300 flex items-center">
                <ExternalLink className="w-4 h-4 mr-2" />
                Go to Home Hub
              </a>
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
            <h4 className="text-yellow-400 font-semibold mb-2">Troubleshooting</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Make sure both frontend and backend servers are running</li>
              <li>• Verify OAuth2 credentials are correct in .env file</li>
              <li>• Check that you're added as a test user in OAuth consent screen</li>
              <li>• Ensure redirect URI matches exactly: http://localhost:3001/auth/google/callback</li>
              <li>• Try the authentication test at /auth route first</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SetupGuide 