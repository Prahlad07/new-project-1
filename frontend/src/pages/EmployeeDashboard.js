import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getComplaints } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatCategory, formatStatus } from '../utils/helpers';
import { format } from 'date-fns';
import { ClipboardList, Clock, CheckCircle, AlertTriangle, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_BG = {
  in_progress: 'rgba(124,58,237,0.08)', assigned: 'rgba(59,130,246,0.08)',
  pending_verification: 'rgba(245,158,11,0.1)', resolved: 'rgba(16,185,129,0.08)',
};

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getComplaints({ limit: 100 })
      .then(({ data }) => setComplaints(data.complaints))
      .catch(() => toast.error('Failed to load tasks'))
      .finally(() => setLoading(false));
  }, []);

  const active = complaints.filter((c) => !['resolved', 'rejected'].includes(c.status));
  const resolved = complaints.filter((c) => c.status === 'resolved');
  const overdue = active.filter((c) => c.dueDate && new Date(c.dueDate) < new Date());
  const pendingVerification = complaints.filter((c) => c.status === 'pending_verification');

  const utilization = user?.bandwidth ? Math.round((user.activeComplaints / user.bandwidth) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Task Dashboard 📋</h1>
          <p className="page-subtitle">
            {user?.designation || 'Field Officer'} · {user?.department?.name || 'Unassigned'}
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/complaints')}>
          View All Complaints →
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-4" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.1)' }}>
            <ClipboardList size={22} color="var(--primary)" />
          </div>
          <div>
            <div className="stat-value" style={{ color: 'var(--primary)' }}>{active.length}</div>
            <div className="stat-label">Active Tasks</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.1)' }}>
            <AlertTriangle size={22} color="var(--danger)" />
          </div>
          <div>
            <div className="stat-value" style={{ color: 'var(--danger)' }}>{overdue.length}</div>
            <div className="stat-label">Overdue</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>
            <CheckCircle size={22} color="var(--success)" />
          </div>
          <div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>{resolved.length}</div>
            <div className="stat-label">Resolved</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)' }}>
            <Clock size={22} color="var(--warning)" />
          </div>
          <div>
            <div className="stat-value" style={{ color: 'var(--warning)' }}>{pendingVerification.length}</div>
            <div className="stat-label">Awaiting Verification</div>
          </div>
        </div>
      </div>

      {/* Capacity */}
      {user?.bandwidth && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <div className="card-title">Workload Capacity</div>
            <span style={{ fontSize: 13, fontWeight: 700, color: utilization > 80 ? 'var(--danger)' : utilization > 60 ? 'var(--warning)' : 'var(--success)' }}>
              {user.activeComplaints} / {user.bandwidth}
            </span>
          </div>
          <div className="card-body">
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{
                width: `${Math.min(utilization, 100)}%`,
                background: utilization > 80 ? 'var(--danger)' : utilization > 60 ? 'var(--warning)' : 'var(--success)',
              }} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              {utilization}% capacity used · {Math.max(0, user.bandwidth - user.activeComplaints)} slots available
            </div>
          </div>
        </div>
      )}

      {/* Overdue alerts */}
      {overdue.length > 0 && (
        <div className="alert alert-critical" style={{ marginBottom: 20 }}>
          <AlertTriangle size={16} />
          <strong>{overdue.length} complaint{overdue.length > 1 ? 's' : ''} are overdue!</strong>
          <span style={{ fontSize: 12, opacity: 0.8 }}>Please update the status immediately</span>
        </div>
      )}

      {/* Task list */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Active Assignments</div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{active.length} tasks</span>
        </div>
        <div className="card-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : active.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎉</div>
              <div className="empty-state-title">No active tasks</div>
              <div className="empty-state-desc">All your assigned complaints have been resolved. Great work!</div>
            </div>
          ) : (
            active.map((c) => {
              const isOverdue = c.dueDate && new Date(c.dueDate) < new Date();
              return (
                <div key={c._id}
                  onClick={() => navigate(`/complaints/${c._id}`)}
                  style={{
                    display: 'flex', gap: 14, padding: '14px 16px', marginBottom: 8,
                    borderRadius: 12, cursor: 'pointer',
                    background: isOverdue ? 'rgba(239,68,68,0.06)' : STATUS_BG[c.status] || 'var(--card-hover)',
                    border: `1px solid ${isOverdue ? 'rgba(239,68,68,0.2)' : 'var(--border)'}`,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                      {c.isCritical && <span style={{ fontSize: 14 }}>🚨</span>}
                      {isOverdue && <span style={{ fontSize: 14 }}>⏰</span>}
                      <span style={{ fontWeight: 700, fontSize: 13 }} className="truncate">{c.title}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <code style={{ background: 'rgba(0,0,0,0.1)', padding: '1px 5px', borderRadius: 4 }}>{c.ticketId}</code>
                      <span>{formatCategory(c.category)}</span>
                      {c.dueDate && (
                        <span style={{ color: isOverdue ? 'var(--danger)' : 'var(--text-muted)' }}>
                          Due: {format(new Date(c.dueDate), 'dd MMM')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                    <span className={`badge badge-${c.status}`}>{formatStatus(c.status)}</span>
                    <span className={`badge badge-${c.priority}`}>{c.priority}</span>
                  </div>
                  <ChevronRight size={16} color="var(--text-muted)" style={{ alignSelf: 'center', flexShrink: 0 }} />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Performance stats */}
      {user?.stats && (
        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-header"><div className="card-title">My Performance Stats</div></div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px,1fr))', gap: 16 }}>
              {[
                { label: 'Total Assigned', value: user.stats.totalAssigned, color: 'var(--primary)' },
                { label: 'Total Resolved', value: user.stats.totalResolved, color: 'var(--success)' },
                { label: 'Avg Resolution', value: `${user.stats.avgResolutionHours || 0}h`, color: 'var(--info)' },
                { label: 'False Closures', value: user.stats.falseClosures, color: 'var(--danger)' },
                { label: 'Avg Rating', value: user.stats.avgSatisfactionScore ? `${user.stats.avgSatisfactionScore}/5 ⭐` : 'N/A', color: 'var(--warning)' },
              ].map((s) => (
                <div key={s.label} style={{ background: 'var(--card-hover)', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
