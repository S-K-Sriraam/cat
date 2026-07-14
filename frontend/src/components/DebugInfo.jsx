import { useEffect, useState } from 'react'
import { API_BASE_URL } from '../config/api.js'

/**
 * Debug info component - shows API connection status
 * Only visible in development mode
 */
export function DebugInfo() {
  const [apiStatus, setApiStatus] = useState('checking')
  const [backendUrl, setBackendUrl] = useState(API_BASE_URL)

  useEffect(() => {
    const checkAPI = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/health`, {
          method: 'GET',
          credentials: 'include'
        })
        if (response.ok) {
          setApiStatus('connected')
        } else {
          setApiStatus('error')
        }
      } catch (error) {
        setApiStatus('unreachable')
        console.error('Debug Info - API Status Check Error:', error)
      }
    }

    checkAPI()
  }, [])

  const isDevelopment = import.meta.env.MODE === 'development'
  if (!isDevelopment) return null

  const statusColor = {
    checking: '#667085',
    connected: '#16a34a',
    error: '#ea580c',
    unreachable: '#dc2626'
  }

  const statusText = {
    checking: 'Checking...',
    connected: 'Connected ✓',
    error: 'Error',
    unreachable: 'Unreachable'
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: '#1f2937',
      color: 'white',
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 9999,
      fontFamily: 'monospace',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      maxWidth: '280px'
    }}>
      <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
        🐛 Debug Info
      </div>
      <div style={{ marginBottom: '6px' }}>
        API: <span style={{ color: statusColor[apiStatus] }}>{statusText[apiStatus]}</span>
      </div>
      <div style={{ marginBottom: '6px', wordBreak: 'break-all' }}>
        URL: <code style={{ color: '#60a5fa' }}>{backendUrl}</code>
      </div>
      <div style={{ marginBottom: '6px' }}>
        Mode: <code style={{ color: '#34d399' }}>{import.meta.env.MODE}</code>
      </div>
      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #4b5563', fontSize: '11px', color: '#9ca3af' }}>
        Open browser DevTools (F12) to see detailed logs
      </div>
    </div>
  )
}

export default DebugInfo
