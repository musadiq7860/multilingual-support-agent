import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getAllTickets, updateTicketStatus } from '../api/client'

export default function AdminDashboard() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()

  useEffect(() => { fetchTickets() }, [])

  const fetchTickets = async () => {
    try {
      const data = await getAllTickets()
      setTickets(data.tickets)
    } catch {
      console.log('Could not fetch tickets')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (ticketId: string, status: string) => {
    try {
      await updateTicketStatus(ticketId, status)
      fetchTickets()
    } catch {
      console.log('Update failed')
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter)
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    high: tickets.filter(t => t.urgency === 'high').length,
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ borderBottom: '1px solid var(--border)', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="dot dot-red pulse" />
          <span style={{ fontFamily: 'Bebas Neue', fontSize: '18px', letterSpacing: '0.1em', color: 'var(--red)' }}>ADMIN PANEL</span>
        </div>
        <button className="btn btn-ghost" onClick={handleLogout} style={{ padding: '7px 14px', fontSize: '12px' }}>Logout</button>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px', width: '100%' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontSize: '42px', marginBottom: '28px' }}>TICKET OVERVIEW</h1>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
            {[
              { label: 'TOTAL', value: stats.total, cls: 'orange' },
              { label: 'OPEN', value: stats.open, cls: 'yellow' },
              { label: 'RESOLVED', value: stats.resolved, cls: 'green' },
              { label: 'HIGH URGENCY', value: stats.high, cls: 'red' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className={`stat-card ${s.cls}`}>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: '44px', lineHeight: '1', marginBottom: '4px', color: s.cls === 'orange' ? 'var(--orange)' : s.cls === 'yellow' ? 'var(--yellow)' : s.cls === 'green' ? 'var(--green)' : 'var(--red)' }}>{s.value}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'Manrope', fontWeight: '600', letterSpacing: '0.1em' }}>{s.label}</div>
              </motion.div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {['all', 'open', 'resolved'].map(f => (
              <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Manrope', alignSelf: 'center' }}>{filtered.length} tickets</span>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Loading...</p>
          ) : filtered.length === 0 ? (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '32px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
              No tickets found
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filtered.map((ticket, i) => (
                <motion.div key={ticket.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className={`ticket-card ${ticket.urgency === 'high' ? 'high-urgency' : 'normal-urgency'}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <span className={`badge badge-${ticket.urgency === 'high' ? 'high' : 'normal'}`}>{ticket.urgency}</span>
                      <span className={`badge badge-${ticket.status}`}>{ticket.status}</span>
                      <span className="badge" style={{ background: 'var(--orange-dim)', color: 'var(--orange)', border: '1px solid var(--border-orange)' }}>{ticket.intent}</span>
                      <span className="badge" style={{ background: 'var(--cream-dim)', color: 'var(--cream)', border: '1px solid rgba(245,240,232,0.1)' }}>{ticket.language}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontFamily: 'Manrope' }}>{new Date(ticket.created_at).toLocaleDateString()}</span>
                  </div>

                  <p style={{ fontSize: '13px', marginBottom: '6px', color: 'var(--cream)' }}>{ticket.original_message}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.5', marginBottom: '14px' }}>{ticket.reply}</p>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleStatusUpdate(ticket.id, 'resolved')}
                      disabled={ticket.status === 'resolved'}
                      style={{ padding: '6px 14px', borderRadius: 'var(--radius)', border: '1px solid rgba(74,222,128,0.25)', background: 'var(--green-dim)', color: 'var(--green)', cursor: ticket.status === 'resolved' ? 'not-allowed' : 'pointer', opacity: ticket.status === 'resolved' ? 0.4 : 1, fontSize: '11px', fontFamily: 'Manrope', fontWeight: '700', letterSpacing: '0.06em' }}>
                      MARK RESOLVED
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(ticket.id, 'open')}
                      disabled={ticket.status === 'open'}
                      style={{ padding: '6px 14px', borderRadius: 'var(--radius)', border: '1px solid rgba(255,211,42,0.25)', background: 'var(--yellow-dim)', color: 'var(--yellow)', cursor: ticket.status === 'open' ? 'not-allowed' : 'pointer', opacity: ticket.status === 'open' ? 0.4 : 1, fontSize: '11px', fontFamily: 'Manrope', fontWeight: '700', letterSpacing: '0.06em' }}>
                      REOPEN
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}