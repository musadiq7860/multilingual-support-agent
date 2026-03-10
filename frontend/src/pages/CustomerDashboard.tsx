import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { analyzeMessage, getMyTickets } from '../api/client'

export default function CustomerDashboard() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [tickets, setTickets] = useState<any[]>([])
  const [ticketsLoading, setTicketsLoading] = useState(true)
  const navigate = useNavigate()
  const name = localStorage.getItem('name') || 'Customer'

  useEffect(() => { fetchTickets() }, [])

  const fetchTickets = async () => {
    try {
      const data = await getMyTickets()
      setTickets(data.tickets)
    } catch {
      console.log('Could not fetch tickets')
    } finally {
      setTicketsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!message.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const data = await analyzeMessage(message)
      setResult(data)
      setMessage('')
      fetchTickets()
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ borderBottom: '1px solid var(--border)', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="dot dot-orange pulse" />
          <span style={{ fontFamily: 'Bebas Neue', fontSize: '18px', letterSpacing: '0.1em', color: 'var(--brand-secondary)' }}>SUPPORT AGENT</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'Manrope' }}>
            Logged in as <span style={{ color: 'var(--text-primary)' }}>{name}</span>
          </span>
          <button className="btn btn-ghost" onClick={handleLogout} style={{ padding: '7px 14px', fontSize: '12px' }}>Logout</button>
        </div>
      </div>

      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '40px 24px', width: '100%' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '42px', marginBottom: '4px' }}>SUBMIT COMPLAINT</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Write in any language — Urdu, English, French, Arabic and more</p>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '20px' }}>
            <label className="label" style={{ marginBottom: '10px' }}>Your message</label>
            <textarea
              className="input"
              placeholder="Describe your issue in any language..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              style={{ minHeight: '110px', resize: 'vertical', marginBottom: '14px' }}
            />
            <button className="btn btn-orange" onClick={handleSubmit} disabled={loading || !message.trim()} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
              {loading ? '— AI is analyzing —' : 'Submit Complaint →'}
            </button>
          </div>
        </motion.div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-orange)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <span className="dot dot-orange" />
                <span style={{ fontFamily: 'Manrope', fontWeight: '700', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--brand-secondary)' }}>AI ANALYSIS</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                {[
                  { label: 'LANGUAGE', value: result.language?.language?.toUpperCase(), sub: `${result.language?.confidence}% confidence`, color: 'var(--brand-secondary)' },
                  { label: 'INTENT', value: result.intent?.intent, sub: `${result.intent?.confidence}% confidence`, color: 'var(--text-primary)' },
                  { label: 'SENTIMENT', value: result.sentiment?.sentiment, sub: `${result.sentiment?.confidence}% confidence`, color: result.sentiment?.sentiment === 'negative' ? 'var(--red)' : result.sentiment?.sentiment === 'positive' ? 'var(--green)' : 'var(--text-primary)' },
                  { label: 'URGENCY', value: result.urgency?.toUpperCase(), sub: result.urgency === 'high' ? 'Escalated priority' : 'Standard priority', color: result.urgency === 'high' ? 'var(--red)' : 'var(--green)' },
                ].map(cell => (
                  <div key={cell.label} style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'Manrope', fontWeight: '600', letterSpacing: '0.1em', marginBottom: '6px' }}>{cell.label}</div>
                    <div style={{ fontFamily: 'Bebas Neue', fontSize: '22px', color: cell.color, letterSpacing: '0.04em' }}>{cell.value}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{cell.sub}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderLeft: '3px solid var(--brand-secondary)', borderRadius: 'var(--radius)', padding: '14px 16px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'Manrope', fontWeight: '600', letterSpacing: '0.1em', marginBottom: '8px' }}>AI REPLY</div>
                <p style={{ fontSize: '13px', lineHeight: '1.65', color: 'var(--text-primary)' }}>{result.reply?.reply}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '28px' }}>YOUR TICKETS</h2>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'Manrope' }}>{tickets.length} total</span>
          </div>

          {ticketsLoading ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Loading...</p>
          ) : tickets.length === 0 ? (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '32px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
              No tickets yet — submit your first complaint above
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {tickets.map((ticket, i) => (
                <motion.div key={ticket.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className={`ticket-card ${ticket.urgency === 'high' ? 'high-urgency' : 'normal-urgency'}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <span className={`badge badge-${ticket.urgency === 'high' ? 'high' : 'normal'}`}>{ticket.urgency}</span>
                      <span className={`badge badge-${ticket.status}`}>{ticket.status}</span>
                      <span className="badge" style={{ background: 'var(--brand-secondary-dim)', color: 'var(--brand-secondary)', border: '1px solid var(--border-orange)' }}>{ticket.intent}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontFamily: 'Manrope' }}>{new Date(ticket.created_at).toLocaleDateString()}</span>
                  </div>
                  <p style={{ fontSize: '13px', marginBottom: '6px', color: 'var(--text-primary)' }}>{ticket.original_message}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.5' }}>{ticket.reply}</p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}