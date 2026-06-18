import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getComplaints } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatCategory, formatStatus } from '../utils/helpers';
import { format } from 'date-fns';
import { Plus, CheckCircle, Clock, FileText, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getComplaints({ limit: 100 })
      .then(({ data }) => setComplaints(data.complaints))
      .catch(() => toast.error('Failed to load complaints'))
      .finally(() => setLoading(false));
  }, []);

  const pending = complaints.filter((c) => !['resolved', 'rejected'].includes(c.status)).length;
  const resolved = complaints.filter((c) => c.status === 'resolved').length;
  const needsVerification = complaints.filter((c) => c.status === 'pending_verification');
  const criticalCount = complaints.filter((c) => c.isCritical && !['resolved', 'rejected'].includes(c.status)).length;

  const STATUS_EMOJI = {
    resolved: '✅', rejected: '❌', in_progress: '🔧', assigned: '👤',
    pending_verification: '🔍', under_review: '👁️', submitted: '📋',
    escalated: '🚨', reopened: '⚡',
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="page-subtitle">Track your grievances and verify resolutions</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/complaints/new')}>
          <Plus size={16} /> Submit Complaint
        </button>
      </div>

      {/* Verification alerts */}
      {needsVerification.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          {needsVerification.map((c) => (
            <div key={c._id} className="alert alert-warning"
              style={{ marginBottom: 8, cursor: 'pointer' }}
              onClick={() => navigate(`/complaints/${c._id}`)}>
              <CheckCircle size={16} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <strong>Action Required: Verify Resolution</strong>
                <div style={{ fontSize: 12, marginTop: 2 }}>{c.title} — Please confirm if your issue is resolved</div>
              </div>
              <button className="btn btn-sm btn-success" onClick={(e) => { e.stopPropagation(); navigate(`/complaints/${c._id}`); }}>
                Verify Now →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-3" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.1)' }}>
            <FileText size={22} color="var(--primary)" />
          </div>
          <div>
            <div className="stat-value" style={{ color: 'var(--primary)' }}>{complaints.length}</div>
            <div className="stat-label">Total Submitted</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)' }}>
            <Clock size={22} color="var(--warning)" />
          </div>
          <div>
            <div className="stat-value" style={{ color: 'var(--warning)' }}>{pending}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>
            <CheckCircle size={22} color="var(--success)" />
          </div>
          <div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>{resolved}</div>
            <div className="stat-label">Resolved</div>
            {complaints.length > 0 && (
              <div className="stat-change" style={{ color: 'var(--success)' }}>
                {Math.round((resolved / complaints.length) * 100)}% rate
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Critical banner */}
      {criticalCount > 0 && (
        <div className="alert alert-critical" style={{ marginBottom: 24, cursor: 'pointer' }}
          onClick={() => navigate('/complaints?priority=critical')}>
          <AlertTriangle size={16} />
          <strong>You have {criticalCount} critical complaint{criticalCount > 1 ? 's' : ''} pending</strong>
          <span style={{ marginLeft: 'auto', fontSize: 12 }}>View →</span>
        </div>
      )}

      {/* Recent complaints */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Recent Complaints</div>
            <div className="card-subtitle">{complaints.length} total submitted</div>
          </div>
          <button className="btn btn-sm btn-ghost" onClick={() => navigate('/complaints')}>View All →</button>
        </div>
        <div className="card-body">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
              <div className="spinner" />
            </div>
          ) : complaints.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-title">No complaints yet</div>
              <div className="empty-state-desc">Submit your first grievance to get started. Our AI will auto-classify and route it to the right department.</div>
              <button className="btn btn-primary" onClick={() => navigate('/complaints/new')}>
                <Plus size={15} /> Submit Your First Complaint
              </button>
            </div>
          ) : (
            <div>
              {complaints.slice(0, 8).map((c) => (
                <div key={c._id}
                  onClick={() => navigate(`/complaints/${c._id}`)}
                  style={{
                    display: 'flex', gap: 14, alignItems: 'center',
                    padding: '13px 0', borderBottom: '1px solid var(--border)',
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.marginLeft = '4px'}
                  onMouseLeave={(e) => e.currentTarget.style.marginLeft = '0'}
                >
                  <div style={{ fontSize: 22, flexShrink: 0, width: 36, textAlign: 'center' }}>
                    {STATUS_EMOJI[c.status] || '📋'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'monospace', background: 'var(--card-hover)', padding: '1px 5px', borderRadius: 4, border: '1px solid var(--border)' }}>{c.ticketId}</span>
                      <span>·</span>
                      <span>{formatCategory(c.category)}</span>
                      <span>·</span>
                      <span>{format(new Date(c.createdAt), 'dd MMM yyyy')}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span className={`badge badge-${c.status}`}>{formatStatus(c.status)}</span>
                    {c.isCritical && <span className="badge badge-critical" style={{ fontSize: 9 }}>CRITICAL</span>}
                  </div>
                </div>
              ))}
              {complaints.length > 8 && (
                <div style={{ textAlign: 'center', paddingTop: 16 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate('/complaints')}>
                    View all {complaints.length} complaints →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
