import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { registerUser, loginUser } from '../api/client'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async () => {
    if (!name || !email || !password) return setError('Fill in all required fields')
    setLoading(true)
    setError('')
    try {
      await registerUser(name, email, password, phone)
      const data = await loginUser(email, password)
      localStorage.setItem('token', data.token)
      localStorage.setItem('name', data.name)
      localStorage.setItem('email', data.email)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-base)' }}>
      <div style={{ width: '42%', background: 'var(--bg-surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,222,128,0.07) 0%, transparent 70%)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="dot dot-green pulse" />
          <span style={{ fontFamily: 'Manrope', fontWeight: '700', fontSize: '13px', letterSpacing: '0.08em', color: 'var(--green)' }}>NEW ACCOUNT</span>
        </div>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <h1 style={{ fontSize: '72px', lineHeight: '0.92', marginBottom: '24px', color: 'var(--cream)' }}>
            JOIN<br />
            <span style={{ color: 'var(--green)', WebkitTextStroke: '1px var(--green)', WebkitTextFillColor: 'transparent' }}>THE</span><br />
            SYSTEM
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.7', maxWidth: '280px' }}>
            Create your account and start submitting support requests in your own language.
          </p>
        </motion.div>
        <div style={{ display: 'flex', gap: '20px' }}>
          {['Free forever', 'Instant setup', 'AI powered'].map(tag => (
            <span key={tag} style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Manrope', fontWeight: '600', letterSpacing: '0.06em' }}>{tag}</span>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} style={{ width: '100%', maxWidth: '380px' }}>
          <div style={{ marginBottom: '36px' }}>
            <h2 style={{ fontSize: '36px', marginBottom: '6px' }}>CREATE ACCOUNT</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Fill in your details below</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="label">Full name *</label>
              <input className="input" type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="label">Email *</label>
              <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" type="text" placeholder="03001234567" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="label">Password *</label>
              <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleRegister()} />
            </div>
            {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="error-box">{error}</motion.div>}
            <button className="btn btn-orange" onClick={handleRegister} disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px' }}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
            <div className="divider" />
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--orange)', textDecoration: 'none', fontWeight: '600' }}>Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}