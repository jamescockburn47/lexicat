import React from 'react'
import { Routes, Route } from 'react-router-dom'
import HomeHub from './components/HomeHub'
import SimpleTest from './components/SimpleTest'
import DirectTest from './components/DirectTest'
import AuthTest from './components/AuthTest'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <Routes>
        <Route path="/" element={<HomeHub />} />
        <Route path="/test" element={<SimpleTest />} />
        <Route path="/auth" element={<AuthTest />} />
        <Route path="/direct" element={<DirectTest />} />
        <Route path="/home" element={<HomeHub />} />
      </Routes>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #475569',
          },
        }}
      />
    </div>
  )
}

export default App 