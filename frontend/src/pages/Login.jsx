import { useState } from 'react'
import '../styles/auth.css'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  
  // Register form
  const [registerName, setRegisterName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [targetPercentile, setTargetPercentile] = useState('99')
  const [examDate, setExamDate] = useState('')

  const API = '/api'

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const res = await fetch(API + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword
        })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`)
      }
      
      localStorage.setItem('cat_token', data.token)
      window.location.href = '/cat/'
    } catch (err) {
      setError(err.message || 'Login failed. Please check your email and password.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const res = await fetch(API + '/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: registerName.trim(),
          email: registerEmail.trim(),
          password: registerPassword,
          targetPercentile: Number(targetPercentile),
          examDate: examDate
        })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`)
      }
      
      localStorage.setItem('cat_token', data.token)
      window.location.href = '/cat/'
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      <div style={{
        flex: '1.05',
        background: 'linear-gradient(135deg, #0f172a, #115e59)',
        color: 'white',
        padding: '56px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', lineHeight: '0.98', margin: 0, maxWidth: '760px' }}>
            Plan every day around the topics that move your percentile.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.76)', maxWidth: '640px', fontSize: '18px', lineHeight: 1.7, marginTop: '24px' }}>
            Built from your syllabus images: DILR, QA and VARC priorities, daily scheduling, progress tracking, MongoDB login, and an inbuilt AI study coach.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '32px', maxWidth: '760px' }}>
            <div style={{ border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', padding: '14px' }}>
              <strong style={{ display: 'block', fontSize: '22px' }}>40-50%</strong>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>QA arithmetic block priority</span>
            </div>
            <div style={{ border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', padding: '14px' }}>
              <strong style={{ display: 'block', fontSize: '22px' }}>22+</strong>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>DILR practice sets focus</span>
            </div>
            <div style={{ border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', padding: '14px' }}>
              <strong style={{ display: 'block', fontSize: '22px' }}>Daily</strong>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>AI guided planner</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: '0.95', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
            <button
              onClick={() => { setMode('login'); setError('') }}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                background: mode === 'login' ? '#0f766e' : '#f7f8fb',
                color: mode === 'login' ? 'white' : '#101828',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Login
            </button>
            <button
              onClick={() => { setMode('register'); setError('') }}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                background: mode === 'register' ? '#0f766e' : '#f7f8fb',
                color: mode === 'register' ? 'white' : '#101828',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Register
            </button>
          </div>

          <h2 style={{ margin: '0 0 8px 0', textAlign: 'center' }}>Welcome back</h2>
          <p style={{ color: '#667085', textAlign: 'center', marginBottom: '24px' }}>
            {mode === 'login' ? 'Login or create your prep account.' : 'Login or create your prep account.'}
          </p>

          {error && (
            <div style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d9e0ea',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d9e0ea',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#0f766e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Name</label>
                <input
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d9e0ea',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email</label>
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d9e0ea',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Password</label>
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  minLength="6"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d9e0ea',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Target percentile</label>
                <select
                  value={targetPercentile}
                  onChange={(e) => setTargetPercentile(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d9e0ea',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option>99.5</option>
                  <option>99</option>
                  <option>98</option>
                  <option>95</option>
                  <option>90</option>
                </select>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>CAT exam date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d9e0ea',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#0f766e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
