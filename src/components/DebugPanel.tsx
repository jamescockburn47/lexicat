import React, { useState } from 'react'
import { Bug, RefreshCw, CheckCircle, XCircle, Shield } from 'lucide-react'

const DebugPanel: React.FC = () => {
  const [testResult, setTestResult] = useState<string | null>(null)
  const [isTesting, setIsTesting] = useState(false)

  const runTest = async () => {
    setIsTesting(true)
    setTestResult(null)
    
    try {
      console.log('🧪 Starting debug test...')
      
      // Test 1: Check backend health
      const healthResponse = await fetch('http://localhost:3001/api/health')
      const healthData = await healthResponse.json()
      console.log('Test 1 - Backend health:', healthData.status)
      
      if (!healthData.oauthConfigured) {
        setTestResult('❌ Backend OAuth2 not configured')
        return
      }
      
      // Test 2: Test calendar connection
      const testResponse = await fetch('http://localhost:3001/api/calendar/test')
      console.log('Test 2 - Calendar test:', testResponse.status)
      
      if (testResponse.status === 401) {
        setTestResult('❌ Authentication required - complete OAuth2 flow first')
        return
      }
      
      if (!testResponse.ok) {
        const errorData = await testResponse.json()
        setTestResult(`❌ Connection failed: ${errorData.error}`)
        return
      }
      
      const testData = await testResponse.json()
      console.log('Test 3 - Calendar data:', testData)
      
      setTestResult(`✅ All tests passed! Found ${testData.tests?.events?.eventsFound || 0} events`)
      
    } catch (error) {
      console.error('Debug test failed:', error)
      setTestResult(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-dark-800/90 backdrop-blur-md rounded-lg p-4 border border-white/20 shadow-xl max-w-xs">
        <div className="flex items-center mb-3">
          <Bug className="w-5 h-5 mr-2 text-primary-400" />
          <h3 className="font-semibold text-white text-sm">Debug Panel</h3>
        </div>
        
        <button
          onClick={runTest}
          disabled={isTesting}
          className="flex items-center px-3 py-2 bg-primary-600 hover:bg-primary-700 rounded text-sm transition-colors disabled:opacity-50 w-full"
        >
          {isTesting ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4 mr-2" />
          )}
          {isTesting ? 'Testing...' : 'Test Connection'}
        </button>
        
        {testResult && (
          <div className="mt-3 p-2 rounded text-xs">
            {testResult.startsWith('✅') ? (
              <div className="text-green-400 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                {testResult}
              </div>
            ) : (
              <div className="text-red-400 flex items-center">
                <XCircle className="w-4 h-4 mr-1" />
                {testResult}
              </div>
            )}
          </div>
        )}
        
        <div className="mt-3 text-xs text-gray-400">
          <p>OAuth2 Client ID: {import.meta.env.VITE_GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing'}</p>
          <p>OAuth2 Client Secret: {import.meta.env.VITE_GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing'}</p>
          <p>Calendar ID: {import.meta.env.VITE_GOOGLE_CALENDAR_ID || '❌ Missing'}</p>
        </div>
      </div>
    </div>
  )
}

export default DebugPanel 