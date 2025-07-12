import React, { useState } from 'react'
import { Zap, CheckCircle, XCircle, Loader, AlertTriangle, Shield, ExternalLink } from 'lucide-react'
import { backendUrl } from '../utils/backend'

const DirectTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [diagnostics, setDiagnostics] = useState<string[]>([])
  const [authUrl, setAuthUrl] = useState<string | null>(null)

  const addDiagnostic = (message: string) => {
    setDiagnostics(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testDirectAPI = async () => {
    setIsLoading(true)
    setTestResult(null)
    setDiagnostics([])

    try {
      addDiagnostic('Testing direct API call (will fail due to CORS)...')

      // Test 1: Simple calendar list request - this will fail due to CORS
      const url = `https://www.googleapis.com/calendar/v3/users/me/calendarList`
      addDiagnostic(`Making direct request to: ${url}`)

      const response = await fetch(url)
      addDiagnostic(`Response status: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        const errorText = await response.text()
        addDiagnostic(`Error response: ${errorText.substring(0, 200)}...`)
        
        if (response.status === 401) {
          setTestResult('❌ Direct API requires OAuth2 authentication (expected)')
        } else if (response.status === 403) {
          setTestResult('❌ Direct API blocked by CORS (expected)')
        } else {
          setTestResult(`❌ Direct API Error: ${response.status} - ${response.statusText}`)
        }
        return
      }

      const data = await response.json()
      addDiagnostic(`Success! Found ${data.items?.length || 0} calendars`)
      setTestResult(`✅ Direct API Success! Found ${data.items?.length || 0} calendars`)

    } catch (error) {
      addDiagnostic(`Exception caught: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      // Check for CORS error specifically
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        setTestResult('❌ CORS Error: Browser blocked the request. This is expected - you need a backend proxy.')
      } else {
        setTestResult(`❌ Direct test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const testWithProxy = async () => {
    setIsLoading(true)
    setTestResult(null)
    setDiagnostics([])

    try {
      addDiagnostic('Testing with backend proxy approach...')
      
      // Test 1: Check backend health
      const healthResponse = await fetch(backendUrl('/api/health'))
      const healthData = await healthResponse.json()
      addDiagnostic(`Backend health: ${healthData.status}`)
      addDiagnostic(`OAuth2 configured: ${healthData.oauthConfigured}`)
      
      if (!healthData.oauthConfigured) {
        setTestResult('❌ Backend OAuth2 not configured - check your .env file')
        return
      }

      // Test 2: Try to test calendar API
      const testResponse = await fetch(backendUrl('/api/calendar/test'))
      addDiagnostic(`Calendar test response: ${testResponse.status}`)

      if (testResponse.status === 401) {
        const testData = await testResponse.json()
        addDiagnostic('Authentication required - this is expected')
        setTestResult('🔐 Authentication required - click "Authenticate" to start OAuth2 flow')
        return
      }

      if (!testResponse.ok) {
        const errorText = await testResponse.text()
        addDiagnostic(`Proxy error: ${errorText}`)
        setTestResult('❌ Backend proxy error')
        return
      }

      const data = await testResponse.json()
      addDiagnostic('✅ Backend proxy test successful!')
      setTestResult(`✅ Proxy test successful! Calendar API is working.`)

    } catch (error) {
      addDiagnostic(`Proxy test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setTestResult('❌ Backend proxy not available - make sure server is running')
    } finally {
      setIsLoading(false)
    }
  }

  const testOAuth2Auth = async () => {
    setIsLoading(true)
    setTestResult(null)
    setDiagnostics([])

    try {
      addDiagnostic('Testing OAuth2 authentication flow...')
      
      // Get auth URL from backend
      const authResponse = await fetch(backendUrl('/auth/google'))
      const authData = await authResponse.json()
      
      if (authData.authUrl) {
        addDiagnostic('✅ Auth URL received from backend')
        setAuthUrl(authData.authUrl)
        setTestResult('🔐 OAuth2 flow ready - click the link below to authenticate')
      } else {
        setTestResult('❌ Failed to get auth URL from backend')
      }

    } catch (error) {
      addDiagnostic(`OAuth2 test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setTestResult('❌ OAuth2 test failed - check backend server')
    } finally {
      setIsLoading(false)
    }
  }

  const startAuth = async () => {
    setIsLoading(true)
    setTestResult(null)
    setDiagnostics([])

    try {
      addDiagnostic('Starting OAuth2 authentication...')
      
      const authResponse = await fetch(backendUrl('/auth/google'))
      const authData = await authResponse.json()
      
      if (authData.authUrl) {
        addDiagnostic('✅ Auth URL received')
        setAuthUrl(authData.authUrl)
        setTestResult('🔐 Click the link below to authenticate with Google')
      } else {
        setTestResult('❌ Failed to get auth URL')
      }

    } catch (error) {
      addDiagnostic(`Auth start failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setTestResult('❌ Failed to start authentication')
    } finally {
      setIsLoading(false)
    }
  }

  const checkAuthStatus = async () => {
    setIsLoading(true)
    setTestResult(null)
    setDiagnostics([])

    try {
      addDiagnostic('Checking authentication status...')
      
      const testResponse = await fetch(backendUrl('/api/calendar/test'))
      addDiagnostic(`Status check response: ${testResponse.status}`)

      if (testResponse.ok) {
        const data = await testResponse.json()
        addDiagnostic('✅ Successfully authenticated!')
        setTestResult('✅ Successfully authenticated! Calendar API is working.')
      } else {
        const errorData = await testResponse.json()
        addDiagnostic(`Still not authenticated: ${errorData.error}`)
        setTestResult('❌ Still not authenticated - complete the OAuth2 flow first')
      }

    } catch (error) {
      addDiagnostic(`Status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setTestResult('❌ Status check failed - check backend server')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="max-w-2xl mx-auto p-8 glass-effect rounded-2xl text-center">
        <Zap className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
        <h1 className="text-2xl font-bold mb-4">Google Calendar API Test</h1>
        <p className="text-gray-400 mb-6">Testing different approaches to access Google Calendar API</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <button
            onClick={testDirectAPI}
            disabled={isLoading}
            className="flex items-center justify-center px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Zap className="w-5 h-5 mr-2" />
            )}
            {isLoading ? 'Testing...' : 'Test Direct API'}
          </button>

          <button
            onClick={testWithProxy}
            disabled={isLoading}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <AlertTriangle className="w-5 h-5 mr-2" />
            )}
            {isLoading ? 'Testing...' : 'Test Proxy'}
          </button>

          <button
            onClick={testOAuth2Auth}
            disabled={isLoading}
            className="flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Shield className="w-5 h-5 mr-2" />
            )}
            {isLoading ? 'Testing...' : 'Test OAuth2'}
          </button>
        </div>

        {/* OAuth2 Authentication Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={startAuth}
            disabled={isLoading}
            className="flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
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
            className="flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5 mr-2" />
            )}
            {isLoading ? 'Checking...' : 'Check Status'}
          </button>
        </div>

        {testResult && (
          <div className="p-4 rounded-lg bg-dark-700/50 mb-4">
            {testResult.startsWith('✅') ? (
              <div className="text-green-400 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                {testResult}
              </div>
            ) : testResult.startsWith('🔐') ? (
              <div className="text-blue-400 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                {testResult}
              </div>
            ) : (
              <div className="text-red-400 flex items-center">
                <XCircle className="w-5 h-5 mr-2" />
                {testResult}
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

        {diagnostics.length > 0 && (
          <div className="mt-4 p-4 rounded-lg bg-dark-700/50 text-left">
            <h3 className="text-sm font-semibold mb-2 text-gray-300">Diagnostics:</h3>
            <div className="text-xs text-gray-400 space-y-1 max-h-40 overflow-y-auto">
              {diagnostics.map((msg, index) => (
                <div key={index} className="font-mono">{msg}</div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-400">
          <p>OAuth2 Client ID: {import.meta.env.VITE_GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing'}</p>
          <p>OAuth2 Client Secret: {import.meta.env.VITE_GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing'}</p>
          <p>Calendar ID: {import.meta.env.VITE_GOOGLE_CALENDAR_ID || '❌ Missing'}</p>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>💡 <strong>Expected Results:</strong></p>
          <p>• Direct API: Will fail due to CORS (expected)</p>
          <p>• Test Proxy: Will work if backend is running</p>
          <p>• Test OAuth2: Will show authentication flow</p>
          <p>• Authenticate: Start OAuth2 flow</p>
          <p>• Check Status: Verify authentication</p>
        </div>
      </div>
    </div>
  )
}

export default DirectTest 