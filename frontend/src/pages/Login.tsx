import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { loginUser } from '../api/client'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!email || !password) return setError('Fill in all fields')
    setLoading(true)
    setError('')
    try {
      const data = await loginUser(email, password)
      localStorage.setItem('token', data.token)
      localStorage.setItem('name', data.name)
      localStorage.setItem('email', data.email)
      if (data.email === 'admin@support.com') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-base)' }}>
      <div style={{ width: '42%', background: 'var(--bg-surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,53,0.08) 0%, transparent 70%)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="dot dot-orange pulse" />
          <span style={{ fontFamily: 'Manrope', fontWeight: '700', fontSize: '13px', letterSpacing: '0.08em', color: 'var(--orange)' }}>SUPPORT AGENT</span>
        </div>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <h1 style={{ fontSize: '72px', lineHeight: '0.92', marginBottom: '24px', color: 'var(--cream)' }}>
            MULTI<br />
            <span style={{ color: 'var(--orange)', WebkitTextStroke: '1px var(--orange)', WebkitTextFillColor: 'transparent' }}>LINGUAL</span><br />
            SUPPORT
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.7', maxWidth: '280px' }}>
            AI-powered customer support in any language — Urdu, Arabic, French, and more.
          </p>
        </motion.div>
        <div style={{ display: 'flex', gap: '20px' }}>
          {['99% uptime', 'Any language', 'AI triage'].map(tag => (
            <span key={tag} style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Manrope', fontWeight: '600', letterSpacing: '0.06em' }}>{tag}</span>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} style={{ width: '100%', maxWidth: '380px' }}>
          <div style={{ marginBottom: '36px' }}>
            <h2 style={{ fontSize: '36px', marginBottom: '6px' }}>SIGN IN</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Enter your credentials to continue</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label className="label">Email address</label>
              <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
            {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="error-box">{error}</motion.div>}
            <button className="btn btn-orange" onClick={handleLogin} disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px' }}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
            <div className="divider" />
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>
              No account?{' '}
              <Link to="/register" style={{ color: 'var(--orange)', textDecoration: 'none', fontWeight: '600' }}>Create one</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}