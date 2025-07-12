import React, { useState } from 'react'
import { Shield, CheckCircle, XCircle, Loader, ExternalLink } from 'lucide-react'

const AuthTest: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [authUrl, setAuthUrl] = useState<string | null>(null)

  const testAuth = async () => {
    setIsLoading(true)
    setAuthStatus(null)
    setAuthUrl(null)

    try {
      console.log('🔐 Testing OAuth2 authentication...')
      
      // Test 1: Check if backend is configured
      const healthResponse = await fetch('http://localhost:3001/api/health')
      const healthData = await healthResponse.json()
      
      if (!healthData.oauthConfigured) {
        setAuthStatus('❌ OAuth2 not configured - check your .env file')
        return
      }

      console.log('✅ Backend is configured')

      // Test 2: Try to test calendar API (will fail if not authenticated)
      const testResponse = await fetch('http://localhost:3001/api/calendar/test')
      const testData = await testResponse.json()

      if (testResponse.status === 401) {
        // Need to authenticate
        console.log('🔐 Authentication required')
        setAuthStatus('🔐 Authentication required - click "Authenticate" below')
        setAuthUrl(testData.authUrl)
        return
      }

      if (testResponse.ok) {
        setAuthStatus('✅ Already authenticated and working!')
        return
      }

      setAuthStatus(`❌ Test failed: ${testData.error}`)

    } catch (error) {
      console.error('❌ Auth test failed:', error)
      setAuthStatus(`❌ Auth test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const startAuth = async () => {
    setIsLoading(true)
    setAuthStatus(null)

    try {
      console.log('🔐 Starting OAuth2 flow...')
      
      const authResponse = await fetch('http://localhost:3001/auth/google')
      const authData = await authResponse.json()
      
      if (authData.authUrl) {
        console.log('🔗 Opening auth URL:', authData.authUrl)
        setAuthUrl(authData.authUrl)
        setAuthStatus('🔐 Click the link below to authenticate with Google')
      } else {
        setAuthStatus('❌ Failed to get auth URL')
      }

    } catch (error) {
      console.error('❌ Auth start failed:', error)
      setAuthStatus(`❌ Auth start failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const checkAuthStatus = async () => {
    setIsLoading(true)
    setAuthStatus(null)

    try {
      console.log('🔍 Checking authentication status...')
      
      const testResponse = await fetch('http://localhost:3001/api/calendar/test')
      const testData = await testResponse.json()

      if (testResponse.ok) {
        setAuthStatus('✅ Successfully authenticated! Calendar API is working.')
      } else {
        setAuthStatus(`❌ Still not authenticated: ${testData.error}`)
      }

    } catch (error) {
      console.error('❌ Status check failed:', error)
      setAuthStatus(`❌ Status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="max-w-2xl mx-auto p-8 glass-effect rounded-2xl text-center">
        <Shield className="w-16 h-16 mx-auto mb-4 text-blue-500" />
        <h1 className="text-2xl font-bold mb-4">Google Calendar OAuth2 Test</h1>
        <p className="text-gray-400 mb-6">Testing OAuth2 authentication for Google Calendar API</p>

        <div className="flex gap-4 mb-6">
          <button
            onClick={testAuth}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Shield className="w-5 h-5 mr-2" />
            )}
            {isLoading ? 'Testing...' : 'Test Auth'}
          </button>

          <button
            onClick={startAuth}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <ExternalLink className="w-5 h-5 mr-2" />
            )}
            {isLoading ? 'Starting...' : 'Authenticate'}
          </button>

          <button
            onClick={checkAuthStatus}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5 mr-2" />
            )}
            {isLoading ? 'Checking...' : 'Check Status'}
          </button>
        </div>

        {authStatus && (
          <div className="p-4 rounded-lg bg-dark-700/50 mb-4">
            {authStatus.startsWith('✅') ? (
              <div className="text-green-400 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                {authStatus}
              </div>
            ) : authStatus.startsWith('🔐') ? (
              <div className="text-blue-400 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                {authStatus}
              </div>
            ) : (
              <div className="text-red-400 flex items-center">
                <XCircle className="w-5 h-5 mr-2" />
                {authStatus}
              </div>
            )}
          </div>
        )}

        {authUrl && (
          <div className="mt-4 p-4 rounded-lg bg-dark-700/50">
            <h3 className="text-sm font-semibold mb-2 text-gray-300">Authentication URL:</h3>
            <a 
              href={authUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 break-all"
            >
              {authUrl}
            </a>
            <p className="text-xs text-gray-400 mt-2">
              Click the link above to authenticate with Google, then come back and click "Check Status"
            </p>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-400">
          <p>OAuth2 Client ID: {import.meta.env.VITE_GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing'}</p>
          <p>OAuth2 Client Secret: {import.meta.env.VITE_GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing'}</p>
          <p>Calendar ID: {import.meta.env.VITE_GOOGLE_CALENDAR_ID || '❌ Missing'}</p>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>💡 <strong>Step 1:</strong> Click "Test Auth" to check current status</p>
          <p>💡 <strong>Step 2:</strong> Click "Authenticate" to start OAuth2 flow</p>
          <p>💡 <strong>Step 3:</strong> Complete Google authentication in new tab</p>
          <p>💡 <strong>Step 4:</strong> Click "Check Status" to verify authentication</p>
        </div>
      </div>
    </div>
  )
}

export default AuthTest 