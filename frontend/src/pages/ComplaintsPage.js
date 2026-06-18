import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getComplaints } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatCategory, formatStatus, CATEGORY_OPTIONS, exportToCSV } from '../utils/helpers';
import { format } from 'date-fns';
import { Search, Filter, Download, RefreshCw, ChevronLeft, ChevronRight, X } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUSES = ['submitted', 'under_review', 'assigned', 'in_progress', 'pending_verification', 'resolved', 'reopened', 'rejected', 'escalated'];
const PRIORITIES = ['critical', 'high', 'medium', 'low'];

const PRIORITY_DOT = { critical: '#dc2626', high: '#f97316', medium: '#f59e0b', low: '#10b981' };

export default function ComplaintsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    priority: searchParams.get('priority') || '',
    category: searchParams.get('category') || '',
  });
  const [page, setPage] = useState(1);

  const fetchComplaints = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.category) params.category = filters.category;

    getComplaints(params)
      .then(({ data }) => {
        setComplaints(data.complaints);
        setPagination(data.pagination);
      })
      .catch(() => toast.error('Failed to load complaints'))
      .finally(() => setLoading(false));
  }, [page, filters]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const handleFilterChange = (key, val) => {
    setFilters((f) => ({ ...f, [key]: val }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: '', status: '', priority: '', category: '' });
    setPage(1);
    setSearchParams({});
  };

  const handleExport = () => {
    exportToCSV(complaints, [
      { label: 'Ticket ID', value: 'ticketId' },
      { label: 'Title', value: 'title' },
      { label: 'Category', value: (r) => formatCategory(r.category) },
      { label: 'Priority', value: 'priority' },
      { label: 'Status', value: (r) => formatStatus(r.status) },
      { label: 'Address', value: 'address' },
      { label: 'Ward', value: 'ward' },
      { label: 'Created', value: (r) => format(new Date(r.createdAt), 'dd/MM/yyyy HH:mm') },
    ], `complaints-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    toast.success('Exported to CSV');
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const isPrivileged = ['cm', 'super_admin', 'department_head'].includes(user?.role);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {user?.role === 'citizen' ? 'My Complaints' :
             user?.role === 'employee' ? 'Assigned Complaints' : 'All Complaints'}
          </h1>
          <p className="page-subtitle">{pagination.total} total complaints</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {user?.role === 'citizen' && (
            <button className="btn btn-primary" onClick={() => navigate('/complaints/new')}>+ Submit New</button>
          )}
          {isPrivileged && (
            <button className="btn btn-ghost btn-sm" onClick={handleExport}><Download size={13} /> Export CSV</button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={fetchComplaints} disabled={loading}>
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ padding: '16px 20px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="form-control"
              style={{ paddingLeft: 36 }}
              placeholder="Search complaints..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <button
            className={`btn ${showFilters ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            onClick={() => setShowFilters((s) => !s)}
          >
            <Filter size={13} />
            Filters
            {activeFilterCount > 0 && (
              <span style={{ background: showFilters ? 'rgba(255,255,255,0.3)' : 'var(--primary)', color: 'white', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
              <X size={13} /> Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div style={{ padding: '0 20px 18px', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 160px' }}>
                <label className="form-label">Status</label>
                <select className="form-control" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
                  <option value="">All Statuses</option>
                  {STATUSES.map((s) => <option key={s} value={s}>{formatStatus(s)}</option>)}
                </select>
              </div>
              <div style={{ flex: '1 1 140px' }}>
                <label className="form-label">Priority</label>
                <select className="form-control" value={filters.priority} onChange={(e) => handleFilterChange('priority', e.target.value)}>
                  <option value="">All Priorities</option>
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
              <div style={{ flex: '1 1 180px' }}>
                <label className="form-label">Category</label>
                <select className="form-control" value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
                  <option value="">All Categories</option>
                  {CATEGORY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Complaints table */}
      <div className="card">
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 12px' }} />
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading complaints...</div>
          </div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">No complaints found</div>
            <div className="empty-state-desc">
              {activeFilterCount > 0 ? 'Try adjusting your filters or clearing them.' : 'No complaints have been submitted yet.'}
            </div>
            {activeFilterCount > 0 && (
              <button className="btn btn-ghost" onClick={clearFilters}><X size={14} /> Clear Filters</button>
            )}
          </div>
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Complaint</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    {isPrivileged && <th>Assigned To</th>}
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c) => (
                    <tr key={c._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/complaints/${c._id}`)}>
                      <td>
                        <code style={{ fontSize: 11, background: 'var(--card-hover)', padding: '2px 7px', borderRadius: 5, border: '1px solid var(--border)', fontFamily: 'monospace' }}>
                          {c.ticketId}
                        </code>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          {c.isCritical && <span style={{ fontSize: 14, flexShrink: 0 }}>🚨</span>}
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13, maxWidth: 280 }} className="truncate">{c.title}</div>
                            {c.address && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }} className="truncate">{c.address}</div>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatCategory(c.category)}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: PRIORITY_DOT[c.priority], flexShrink: 0 }} />
                          <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{c.priority}</span>
                        </div>
                      </td>
                      <td><span className={`badge badge-${c.status}`}>{formatStatus(c.status)}</span></td>
                      {isPrivileged && (
                        <td>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {c.assignedTo?.name || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>Unassigned</span>}
                          </span>
                        </td>
                      )}
                      <td>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {format(new Date(c.createdAt), 'dd MMM yy')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, pagination.total)} of {pagination.total}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <span style={{ fontSize: 13, fontWeight: 600, padding: '0 8px' }}>
                    {page} / {pagination.pages}
                  </span>
                  <button className="btn btn-ghost btn-sm" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
