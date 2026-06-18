import React, { useState, useEffect, useMemo } from 'react';
import { getOfficerPerformance, getDepartments } from '../services/api';
import { Trophy, Users, AlertTriangle } from 'lucide-react';

export default function OfficersPage() {
  const [officers, setOfficers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDept, setFilterDept] = useState('');
  const [sortBy, setSortBy] = useState('totalResolved');

  useEffect(() => {
    Promise.all([getOfficerPerformance(), getDepartments()]).then(([oRes, dRes]) => {
      setOfficers(oRes.data.officers);
      setDepartments(dRes.data.departments);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const leaderboard = useMemo(
    () => [...officers].filter((o) => o.stats?.totalResolved > 0).sort((a, b) => b.stats.totalResolved - a.stats.totalResolved).slice(0, 3),
    [officers]
  );

  const filtered = officers
    .filter((o) => !filterDept || o.department === departments.find((d) => d._id === filterDept)?.name)
    .sort((a, b) => {
      if (sortBy === 'totalResolved') return (b.stats?.totalResolved || 0) - (a.stats?.totalResolved || 0);
      if (sortBy === 'falseClosures') return (b.stats?.falseClosures || 0) - (a.stats?.falseClosures || 0);
      if (sortBy === 'capacity') return (b.capacityPercent || 0) - (a.capacityPercent || 0);
      return 0;
    });

  const getCapacityColor = (pct) => pct >= 100 ? 'var(--danger)' : pct >= 70 ? 'var(--warning)' : 'var(--success)';

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>;
  }

  const RANK_MEDALS = ['🥇', '🥈', '🥉'];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Officer Performance</h1>
          <p className="page-subtitle">Workload, performance metrics, and integrity tracking</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--card)', padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border)' }}>
          <Users size={16} color="var(--text-muted)" />
          <span style={{ fontSize: 14, fontWeight: 700 }}>{officers.length}</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>officers</span>
        </div>
      </div>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, rgba(59,130,246,0.04), rgba(124,58,237,0.04))', border: '1px solid rgba(59,130,246,0.15)' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Trophy size={18} color="#d97706" />
              <div className="card-title">Top Performers This Period</div>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {leaderboard.map((o, i) => (
                <div key={o.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  flex: '1 1 240px', background: 'var(--card)',
                  borderRadius: 12, padding: '14px 18px',
                  border: i === 0 ? '1px solid rgba(251,191,36,0.3)' : '1px solid var(--border)',
                  boxShadow: i === 0 ? '0 4px 12px rgba(251,191,36,0.1)' : 'none',
                }}>
                  <div style={{ fontSize: 28 }}>{RANK_MEDALS[i]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 14 }} className="truncate">{o.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{o.department}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--success)', lineHeight: 1 }}>{o.stats.totalResolved}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>resolved</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ padding: '14px 20px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <select className="form-control" style={{ flex: '1 1 200px' }} value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          <select className="form-control" style={{ flex: '1 1 200px' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="totalResolved">Sort: Most Resolved</option>
            <option value="falseClosures">Sort: False Closures ⚠️</option>
            <option value="capacity">Sort: Workload %</option>
          </select>
        </div>
      </div>

      {/* Officer cards */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <div className="empty-state-title">No officers found</div>
          <div className="empty-state-desc">Try changing the department filter</div>
        </div>
      ) : (
        <div className="grid grid-3">
          {filtered.map((o) => {
            const capacityColor = getCapacityColor(o.capacityPercent || 0);
            const hasFalseClosures = (o.stats?.falseClosures || 0) > 0;
            return (
              <div key={o.id} className="card card-hover" style={{ borderColor: hasFalseClosures ? 'rgba(239,68,68,0.2)' : undefined }}>
                <div className="card-body">
                  {/* Officer header */}
                  <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: '50%',
                      background: `linear-gradient(135deg, var(--primary), var(--purple))`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 800, fontSize: 18, flexShrink: 0,
                    }}>
                      {o.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 14 }} className="truncate">{o.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{o.designation || 'Officer'}</div>
                      <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, marginTop: 2 }}>{o.department}</div>
                    </div>
                    {!o.isActive && (
                      <span className="badge badge-rejected" style={{ fontSize: 10 }}>Inactive</span>
                    )}
                  </div>

                  {/* Capacity bar */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Workload</span>
                      <span style={{ fontWeight: 700, color: capacityColor }}>{o.capacityPercent || 0}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: `${Math.min(100, o.capacityPercent || 0)}%`, background: capacityColor }} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{o.activeComplaints}/{o.bandwidth} active</div>
                  </div>

                  {/* Stats grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                    {[
                      { label: 'Assigned', val: o.stats?.totalAssigned || 0, color: 'var(--primary)' },
                      { label: 'Resolved', val: o.stats?.totalResolved || 0, color: 'var(--success)' },
                      { label: 'Avg Time', val: `${o.stats?.avgResolutionHours || 0}h`, color: 'var(--info)' },
                      { label: 'Rating', val: o.stats?.avgSatisfactionScore ? `${o.stats.avgSatisfactionScore}⭐` : 'N/A', color: 'var(--warning)' },
                    ].map(({ label, val, color }) => (
                      <div key={label} style={{ background: 'var(--card-hover)', borderRadius: 9, padding: '9px 12px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 17, fontWeight: 800, color }}>{val}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* False closures warning */}
                  {hasFalseClosures && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--badge-critical-bg)', border: '1px solid var(--badge-critical-border)', borderRadius: 9, padding: '8px 12px' }}>
                      <AlertTriangle size={14} color="var(--badge-critical-fg)" style={{ flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--badge-critical-fg)' }}>
                          {o.stats.falseClosures} false closure{o.stats.falseClosures > 1 ? 's' : ''} flagged
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Rate: {o.falseClosureRate}%</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
