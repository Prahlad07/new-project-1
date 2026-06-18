import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getDashboardStats, getComplaints, getAiAnomalies } from '../services/api';
import { formatCategory, formatStatus, DATE_RANGE_PRESETS } from '../utils/helpers';
import { SkeletonStatsGrid } from '../components/shared/Skeletons';
import { AlertTriangle, MapPin, Brain, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';

const CHART_COLORS = ['#3b82f6','#f97316','#10b981','#f59e0b','#8b5cf6','#06b6d4','#ec4899','#84cc16'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--shadow-lg)', fontSize: 13 }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

function StatCard({ icon, label, value, change, color, bgColor, onClick, wide }) {
  return (
    <div className="stat-card" style={{ cursor: onClick ? 'pointer' : 'default', gridColumn: wide ? 'span 2' : undefined }}
      onClick={onClick}>
      <div className="stat-icon" style={{ background: bgColor || '#eff6ff' }}>
        {typeof icon === 'string' ? icon : icon}
      </div>
      <div style={{ flex: 1 }}>
        <div className="stat-value" style={{ color }}>{value}</div>
        <div className="stat-label">{label}</div>
        {change !== undefined && (
          <div className="stat-change" style={{ color: change > 0 ? 'var(--danger)' : change < 0 ? 'var(--success)' : 'var(--text-muted)' }}>
            {change > 0 ? <TrendingUp size={11} /> : change < 0 ? <TrendingDown size={11} /> : <Minus size={11} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
    </div>
  );
}

export default function CMDashboard() {
  const [stats, setStats] = useState(null);
  const [criticalComplaints, setCriticalComplaints] = useState([]);
  const [anomalies, setAnomalies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rangeDays, setRangeDays] = useState(7);
  const navigate = useNavigate();

  const fetchStats = useCallback(() => {
    setLoading(true);
    Promise.all([
      getDashboardStats(rangeDays === null ? {} : { days: rangeDays }),
      getComplaints({ priority: 'critical', status: 'submitted,under_review,assigned,in_progress', limit: 5 }),
      getAiAnomalies(),
    ]).then(([statsRes, critRes, anomalyRes]) => {
      setStats(statsRes.data.stats);
      setCriticalComplaints(critRes.data.complaints);
      setAnomalies(anomalyRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [rangeDays]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading && !stats) {
    return (
      <div>
        <div style={{ marginBottom: 28 }}>
          <div className="skeleton" style={{ width: 300, height: 32, borderRadius: 8 }} />
          <div className="skeleton" style={{ width: 220, height: 18, borderRadius: 6, marginTop: 8 }} />
        </div>
        <SkeletonStatsGrid count={8} />
      </div>
    );
  }

  const categoryData = stats?.categoryCounts?.map((c) => ({ name: formatCategory(c._id), value: c.count })) || [];
  const trendData = stats?.trend?.map((t) => ({ date: t._id?.slice(5), complaints: t.count })) || [];
  const hasAnomalies = anomalies && (anomalies.officerAnomalies?.length > 0 || anomalies.departmentBottlenecks?.length > 0);

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">🏛️ CM Grievance Dashboard</h1>
          <p className="page-subtitle">Delhi Grievance Intelligence System · {format(new Date(), 'EEEE, d MMMM yyyy')}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div className="date-range-pills">
            {DATE_RANGE_PRESETS.map((p) => (
              <button key={p.label} className={`date-pill${rangeDays === p.days ? ' active' : ''}`}
                onClick={() => setRangeDays(p.days)} disabled={loading}>{p.label}</button>
            ))}
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/map')}>
            <MapPin size={13} /> Grievance Map
          </button>
        </div>
      </div>

      {/* Critical alert banner */}
      {criticalComplaints.length > 0 && (
        <div className="alert alert-critical" style={{ marginBottom: 24, cursor: 'pointer' }}
          onClick={() => navigate('/complaints?priority=critical')}>
          <AlertTriangle size={18} />
          <div style={{ flex: 1 }}>
            <strong>🚨 {criticalComplaints.length} CRITICAL complaint{criticalComplaints.length > 1 ? 's' : ''} require immediate attention</strong>
            <div style={{ fontSize: 12, marginTop: 2, opacity: 0.8 }}>
              Latest: {criticalComplaints[0]?.title} — {criticalComplaints[0]?.address}
            </div>
          </div>
          <span style={{ fontSize: 12, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>View all →</span>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-4" style={{ marginBottom: 28 }}>
        <StatCard icon="📋" label="Total Complaints" value={stats?.total || 0} color="var(--primary)" bgColor="rgba(59,130,246,0.1)" />
        <StatCard icon="⏳" label="Pending Action" value={stats?.pending || 0} color="var(--warning)" bgColor="rgba(245,158,11,0.1)" onClick={() => navigate('/complaints?status=submitted')} />
        <StatCard icon="✅" label="Resolved" value={stats?.resolved || 0} color="var(--success)" bgColor="rgba(16,185,129,0.1)"
          change={stats?.resolutionRate ? parseFloat(stats.resolutionRate) : undefined} />
        <StatCard icon="🚨" label="Critical Alerts" value={stats?.critical || 0} color="var(--danger)" bgColor="rgba(239,68,68,0.1)" onClick={() => navigate('/complaints?priority=critical')} />
        <StatCard icon="⚠️" label="False Closures Caught" value={stats?.falseClosures || 0} color="var(--danger)" bgColor="rgba(239,68,68,0.08)" />
        <StatCard icon="📅" label="Overdue Complaints" value={stats?.overdueCount || 0} color="var(--warning)" bgColor="rgba(245,158,11,0.08)" />
        <StatCard icon="📈" label="Resolution Rate" value={`${stats?.resolutionRate || 0}%`} color="var(--success)" bgColor="rgba(16,185,129,0.08)" wide />
      </div>

      {/* AI Anomalies */}
      {hasAnomalies && (
        <div className="card" style={{ marginBottom: 28, border: '1px solid rgba(124,58,237,0.3)' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(124,58,237,0.06))', borderRadius: '14px 14px 0 0', padding: '16px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Brain size={18} color="var(--purple)" />
              <div className="card-title">AI Insights & Anomaly Detection</div>
            </div>
            <span style={{ fontSize: 11, color: 'var(--purple)', fontWeight: 600, background: 'rgba(124,58,237,0.1)', padding: '3px 9px', borderRadius: 20, border: '1px solid rgba(124,58,237,0.2)' }}>LIVE</span>
          </div>
          <div className="card-body">
            <div className="grid grid-2">
              {anomalies.departmentBottlenecks?.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>Department Bottlenecks</div>
                  {anomalies.departmentBottlenecks.slice(0, 3).map((b, i) => (
                    <div key={i} className="anomaly-alert" style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--danger)' }}>{b.department}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', background: 'var(--badge-critical-bg)', color: 'var(--badge-critical-fg)', borderRadius: 4, border: '1px solid var(--badge-critical-border)' }}>{b.severity?.toUpperCase()}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.overdue} overdue · Avg age: {b.avgAgeHours}h</div>
                    </div>
                  ))}
                </div>
              )}
              {anomalies.officerAnomalies?.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>Officer Behavior Flags</div>
                  {anomalies.officerAnomalies.slice(0, 3).map((a, i) => (
                    <div key={i} className="anomaly-alert" style={{ marginBottom: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--danger)', marginBottom: 4 }}>{a.officer?.name}</div>
                      {a.anomalies?.map((an, j) => (
                        <div key={j} style={{ fontSize: 12, color: 'var(--text-muted)' }}>⚠️ {an.message}</div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-2" style={{ marginBottom: 28 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">📈 Complaint Trend</div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{rangeDays === 0 ? 'Today' : rangeDays ? `Last ${Math.min(rangeDays, 90)} days` : 'All time'}</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={210}>
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="complaints" stroke="var(--primary)" strokeWidth={2.5}
                  dot={{ fill: 'var(--primary)', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">🏷️ Complaints by Category</div></div>
          <div className="card-body">
            {categoryData.length === 0 ? (
              <div className="empty-state" style={{ padding: 40 }}>
                <div style={{ fontSize: 32 }}>📊</div>
                <div style={{ color: 'var(--text-muted)', marginTop: 8 }}>No data yet</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={88}
                    dataKey="value" paddingAngle={2}>
                    {categoryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">🏛️ Department Performance</div>
            <button className="btn btn-sm btn-ghost" onClick={() => navigate('/officers')}>View All →</button>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={stats?.topDepts?.map((d) => ({ dept: d.dept?.[0]?.name?.split(' ')?.[0] || 'Unknown', total: d.total, resolved: d.resolved })) || []}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="dept" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="total" fill="var(--primary)" name="Total" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="var(--success)" name="Resolved" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">🚨 Critical Complaints</div>
            <button className="btn btn-sm btn-ghost" onClick={() => navigate('/complaints?priority=critical')}>View All →</button>
          </div>
          <div className="card-body" style={{ padding: '14px 20px' }}>
            {criticalComplaints.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">✅</div>
                <div className="empty-state-title">All Clear</div>
                <div className="empty-state-desc">No critical complaints pending</div>
              </div>
            ) : criticalComplaints.map((c) => (
              <div key={c._id}
                onClick={() => navigate(`/complaints/${c._id}`)}
                style={{ display: 'flex', gap: 10, padding: '11px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer', alignItems: 'flex-start' }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>🚨</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--danger)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.address}</div>
                  {c.criticalReason && <div style={{ fontSize: 11, color: 'var(--danger)', opacity: 0.8, marginTop: 1 }}>{c.criticalReason}</div>}
                </div>
                <span className="badge badge-critical" style={{ flexShrink: 0 }}>CRITICAL</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status distribution */}
      <div className="card" style={{ marginTop: 28 }}>
        <div className="card-header"><div className="card-title">📊 Status Distribution</div></div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {stats?.statusCounts?.map((s) => (
              <div key={s._id}
                onClick={() => navigate(`/complaints?status=${s._id}`)}
                style={{
                  flex: '1 1 100px', background: 'var(--card-hover)', borderRadius: 12,
                  padding: '16px 20px', cursor: 'pointer', border: '1px solid var(--border)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-glow)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--card-hover)'; }}
              >
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>{s.count}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>{formatStatus(s._id)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
