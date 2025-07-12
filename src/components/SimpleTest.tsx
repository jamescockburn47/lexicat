import React, { useState } from 'react'
import { TestTube, CheckCircle, XCircle, Loader } from 'lucide-react'

const SimpleTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testAPI = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      const apiKey = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY
      const calendarId = import.meta.env.VITE_GOOGLE_CALENDAR_ID

      console.log('🧪 Testing with:')
      console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET')
      console.log('Calendar ID:', calendarId)

      // Test 1: Basic API access
      const testUrl = `https://www.googleapis.com/calendar/v3/users/me/calendarList?key=${apiKey}`
      console.log('🔗 Testing URL:', testUrl)

      const response = await fetch(testUrl)
      console.log('📡 Response status:', response.status)
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Error response:', errorText)
        console.error('❌ Full error details:', {
          status: response.status,
          statusText: response.statusText,
          url: testUrl,
          apiKeyLength: apiKey.length
        })
        throw new Error(`API Error: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ API Response:', data)

      // Test 2: Try to get calendar events
      const now = new Date()
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      
      const eventsUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${apiKey}&timeMin=${now.toISOString()}&timeMax=${nextWeek.toISOString()}&singleEvents=true`
      
      console.log('🔗 Events URL:', eventsUrl)
      
      const eventsResponse = await fetch(eventsUrl)
      console.log('📡 Events response status:', eventsResponse.status)

      if (!eventsResponse.ok) {
        const errorText = await eventsResponse.text()
        console.error('❌ Events error:', errorText)
        throw new Error(`Events API Error: ${eventsResponse.status} - ${eventsResponse.statusText}`)
      }

      const eventsData = await eventsResponse.json()
      console.log('✅ Events data:', eventsData)

      setTestResult(`✅ Success! Found ${eventsData.items?.length || 0} events`)

    } catch (error) {
      console.error('❌ Test failed:', error)
      setTestResult(`❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="max-w-md mx-auto p-8 glass-effect rounded-2xl text-center">
        <TestTube className="w-16 h-16 mx-auto mb-4 text-primary-500" />
        <h1 className="text-2xl font-bold mb-4">Google Calendar API Test</h1>
        <p className="text-gray-400 mb-6">Testing your API configuration</p>

        <button
          onClick={testAPI}
          disabled={isLoading}
          className="flex items-center justify-center w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 mb-6"
        >
          {isLoading ? (
            <Loader className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <TestTube className="w-5 h-5 mr-2" />
          )}
          {isLoading ? 'Testing...' : 'Run API Test'}
        </button>

        {testResult && (
          <div className="p-4 rounded-lg bg-dark-700/50">
            {testResult.startsWith('✅') ? (
              <div className="text-green-400 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
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

        <div className="mt-6 text-sm text-gray-400">
          <p>API Key: {import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY ? '✅ Set' : '❌ Missing'}</p>
          <p>Calendar ID: {import.meta.env.VITE_GOOGLE_CALENDAR_ID || '❌ Missing'}</p>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>Check browser console (F12) for detailed logs</p>
        </div>
      </div>
    </div>
  )
}

export default SimpleTest 