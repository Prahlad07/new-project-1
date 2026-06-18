import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { trackPublic } from '../services/api';
import { formatStatus, formatCategory } from '../utils/helpers';
import { format } from 'date-fns';
import { Search, MapPin, Clock, CheckCircle, AlertTriangle, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  submitted: 'var(--primary)', under_review: 'var(--info)', assigned: 'var(--info)',
  in_progress: 'var(--purple)', pending_verification: 'var(--warning)',
  resolved: 'var(--success)', reopened: 'var(--warning)', rejected: 'var(--text-muted)',
  escalated: 'var(--danger)',
};

export default function TrackComplaint() {
  const { ticketId: paramTicketId } = useParams();
  const [ticketId, setTicketId] = useState(paramTicketId || '');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e) => {
    e?.preventDefault();
    if (!ticketId.trim()) return toast.error('Please enter a ticket ID');
    setLoading(true);
    try {
      const { data } = await trackPublic(ticketId.trim().toUpperCase());
      setComplaint(data.complaint);
      setSearched(true);
    } catch (err) {
      setComplaint(null);
      setSearched(true);
      toast.error('Ticket not found. Please check the ID.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (paramTicketId) handleTrack();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0b0f1a 0%, #0f2247 40%, #1a3a6b 70%, #0b1120 100%)',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(ellipse at 30% 30%, rgba(59,130,246,0.12) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
            <Link to="/login" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              🏛️ CM Grievance System
            </Link>
            <ChevronRight size={14} color="rgba(255,255,255,0.3)" />
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Track Complaint</span>
          </div>
          <h1 style={{ color: 'white', fontSize: 32, fontWeight: 900, letterSpacing: -1, marginBottom: 10 }}>
            Track Your Grievance
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>
            Enter your ticket ID to check the current status
          </p>
        </div>

        {/* Search box */}
        <div style={{
          background: 'rgba(17,24,39,0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20,
          padding: 28,
          boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
          marginBottom: 28,
        }}>
          <form onSubmit={handleTrack}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
              Ticket ID
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1.5px solid rgba(255,255,255,0.12)',
                  borderRadius: 10,
                  color: 'white',
                  fontSize: 16,
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  letterSpacing: 1,
                  outline: 'none',
                }}
                placeholder="GRV-2025-000001"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value.toUpperCase())}
                onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              />
              <button type="submit" className="btn btn-primary"
                style={{ padding: '12px 22px', fontSize: 14, fontWeight: 700 }} disabled={loading}>
                {loading ? <div className="spinner spinner-sm" style={{ borderTopColor: 'white' }} /> : <><Search size={16} /> Track</>}
              </button>
            </div>
          </form>
        </div>

        {/* Result */}
        {searched && !complaint && !loading && (
          <div style={{
            background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(239,68,68,0.3)', borderRadius: 20, padding: 32,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ color: 'white', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Ticket Not Found</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
              Please check the ticket ID and try again. IDs look like: GRV-2025-000001
            </div>
          </div>
        )}

        {complaint && (
          <div style={{ background: 'rgba(17,24,39,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
            {/* Complaint header */}
            <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 6, background: 'rgba(255,255,255,0.07)', display: 'inline-block', padding: '3px 10px', borderRadius: 6 }}>
                    {complaint.ticketId}
                  </div>
                  <h2 style={{ color: 'white', fontSize: 20, fontWeight: 800, letterSpacing: -0.4, marginBottom: 4 }}>{complaint.title}</h2>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', color: 'rgba(255,255,255,0.5)', fontSize: 13, alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} />{complaint.address}</span>
                    {complaint.department && <span>· {complaint.department}</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge badge-${complaint.status}`} style={{ fontSize: 12, padding: '5px 12px' }}>
                    {formatStatus(complaint.status)}
                  </span>
                  {complaint.isCritical && (
                    <div style={{ marginTop: 6 }}><span className="badge badge-critical">CRITICAL</span></div>
                  )}
                </div>
              </div>

              {/* Meta row */}
              <div style={{ display: 'flex', gap: 20, marginTop: 16, flexWrap: 'wrap' }}>
                {[
                  { label: 'Category', value: formatCategory(complaint.category) },
                  { label: 'Priority', value: complaint.priority?.toUpperCase() },
                  { label: 'Submitted', value: format(new Date(complaint.createdAt), 'dd MMM yyyy') },
                  complaint.resolvedAt ? { label: 'Resolved', value: format(new Date(complaint.resolvedAt), 'dd MMM yyyy') } : null,
                  complaint.dueDate ? { label: 'Due Date', value: format(new Date(complaint.dueDate), 'dd MMM yyyy') } : null,
                  complaint.upvoteCount ? { label: 'Upvotes', value: complaint.upvoteCount } : null,
                ].filter(Boolean).map((m) => (
                  <div key={m.label}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 700 }}>{m.label}</div>
                    <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600 }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            {complaint.timeline?.length > 0 && (
              <div style={{ padding: '24px 28px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 20 }}>
                  Update Timeline
                </div>
                <div className="timeline">
                  {[...complaint.timeline].reverse().map((t, i) => (
                    <div key={i} className="timeline-item">
                      <div className="timeline-dot" style={{ background: STATUS_COLORS[t.status] || '#3b82f6', boxShadow: `0 0 0 3px rgba(17,24,39,0.8), 0 0 0 5px ${STATUS_COLORS[t.status] || '#3b82f6'}44` }}>
                        {t.status === 'resolved' ? '✓' : t.status === 'escalated' ? '!' : '·'}
                      </div>
                      <div className="timeline-content">
                        <div style={{ fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>{formatStatus(t.status)}</div>
                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 2 }}>{t.message}</div>
                        <div className="timeline-time">{format(new Date(t.timestamp), 'dd MMM yyyy, h:mm a')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Login CTA */}
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <Link to="/login" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textDecoration: 'none' }}>
            Have an account? <span style={{ color: '#60a5fa', fontWeight: 600 }}>Sign in for full access →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
