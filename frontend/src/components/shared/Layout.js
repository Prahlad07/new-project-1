import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import {
  LayoutDashboard, FileText, MapPin, Users, Building2,
  ClipboardList, ShieldAlert, LogOut, Menu, Bell,
  AlertTriangle, Car, User as UserIcon, Sun, Moon, Command, X,
  PlusCircle, ChevronRight
} from 'lucide-react';

const NAV = {
  cm: [
    { to: '/cm-dashboard', label: 'CM Dashboard', icon: LayoutDashboard, section: 'Main' },
    { to: '/complaints', label: 'All Complaints', icon: FileText, section: 'Main' },
    { to: '/map', label: 'Grievance Map', icon: MapPin, section: 'Main' },
    { to: '/officers', label: 'Officers', icon: Users, section: 'Management' },
    { to: '/visits', label: 'Visit Logs', icon: Car, section: 'Management' },
    { to: '/audit', label: 'Audit & Integrity', icon: ShieldAlert, section: 'Management' },
  ],
  super_admin: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Main' },
    { to: '/complaints', label: 'All Complaints', icon: FileText, section: 'Main' },
    { to: '/map', label: 'Grievance Map', icon: MapPin, section: 'Main' },
    { to: '/officers', label: 'Officers', icon: Users, section: 'Management' },
    { to: '/users', label: 'User Management', icon: UserIcon, section: 'Management' },
    { to: '/departments', label: 'Departments', icon: Building2, section: 'Management' },
    { to: '/visits', label: 'Visit Logs', icon: Car, section: 'Management' },
    { to: '/audit', label: 'Audit & Integrity', icon: ShieldAlert, section: 'Management' },
  ],
  department_head: [
    { to: '/my-complaints', label: 'My Dashboard', icon: LayoutDashboard, section: 'Main' },
    { to: '/complaints', label: 'All Complaints', icon: FileText, section: 'Main' },
    { to: '/officers', label: 'Officers', icon: Users, section: 'Main' },
    { to: '/map', label: 'Grievance Map', icon: MapPin, section: 'Main' },
  ],
  employee: [
    { to: '/my-complaints', label: 'My Tasks', icon: ClipboardList, section: 'Main' },
    { to: '/complaints', label: 'View Complaints', icon: FileText, section: 'Main' },
    { to: '/map', label: 'Map View', icon: MapPin, section: 'Main' },
  ],
  citizen: [
    { to: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard, section: 'Main' },
    { to: '/complaints/new', label: 'Submit Complaint', icon: PlusCircle, section: 'Main' },
    { to: '/complaints', label: 'My Complaints', icon: ClipboardList, section: 'Main' },
    { to: '/map', label: 'Area Map', icon: MapPin, section: 'Main' },
  ],
};

const ROLE_COLORS = {
  cm: '#7c3aed', super_admin: '#dc2626', department_head: '#d97706',
  employee: '#0284c7', citizen: '#059669',
};

const ROLE_LABELS = {
  cm: 'Chief Minister', super_admin: 'Super Admin', department_head: 'Department Head',
  employee: 'Field Officer', citizen: 'Citizen',
};

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { unreadCount, setUnreadCount } = useSocket();
  const navigate = useNavigate();
  const ref = useRef(null);

  const fetchNotifications = () => {
    setLoading(true);
    getNotifications({ limit: 20 })
      .then(({ data }) => { setNotifications(data.notifications); setUnreadCount(data.unreadCount); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => { setOpen((o) => !o); if (!open) fetchNotifications(); };

  const handleClick = async (n) => {
    if (!n.isRead) {
      await markNotificationRead(n._id);
      setUnreadCount((c) => Math.max(0, c - 1));
      setNotifications((ns) => ns.map((x) => x._id === n._id ? { ...x, isRead: true } : x));
    }
    setOpen(false);
    if (n.complaint?._id) navigate(`/complaints/${n.complaint._id}`);
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    setUnreadCount(0);
    setNotifications((ns) => ns.map((n) => ({ ...n, isRead: true })));
  };

  const NOTIF_ICONS = {
    critical_complaint: '🚨', false_closure_alert: '⚠️',
    verification_required: '✅', new_assignment: '📋',
    high_frustration_alert: '😤', overdue_complaints: '⏰',
  };

  return (
    <div className="dropdown" ref={ref}>
      <button
        className="btn btn-ghost btn-icon"
        style={{ position: 'relative' }}
        onClick={handleOpen}
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="notif-dot">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>
      {open && (
        <div className="dropdown-menu" style={{ minWidth: 360 }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Notifications</div>
              {unreadCount > 0 && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{unreadCount} unread</div>}
            </div>
            {unreadCount > 0 && (
              <button onClick={handleMarkAll}
                style={{ fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Mark all read
              </button>
            )}
          </div>
          {loading ? (
            <div style={{ padding: 32, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>You're all caught up!</div>
            </div>
          ) : notifications.map((n) => (
            <div key={n._id} className="dropdown-item"
              onClick={() => handleClick(n)}
              style={{
                background: n.isRead ? 'transparent' : 'var(--badge-assigned-bg)',
                borderLeft: n.isRead ? '3px solid transparent' : '3px solid var(--primary)',
              }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{NOTIF_ICONS[n.type] || '📢'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{n.message}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4 }}>
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </div>
                </div>
                {!n.isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 4 }} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const { criticalAlerts } = useSocket();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform || navigator.userAgent);

  const navItems = NAV[user?.role] || NAV.citizen;
  const sections = [...new Set(navItems.map((i) => i.section))];
  const roleColor = ROLE_COLORS[user?.role] || '#3b82f6';
  const roleLabel = ROLE_LABELS[user?.role] || user?.role;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="app-layout">
      {/* Sidebar backdrop */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99, backdropFilter: 'blur(2px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="sidebar-logo-icon">🏛️</div>
            <div>
              <div className="sidebar-logo-title">CM Grievance</div>
              <div className="sidebar-logo-sub">Delhi Government</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
          {sections.map((section) => (
            <div key={section}>
              <div className="sidebar-section">{section}</div>
              {navItems.filter((i) => i.section === section).map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={16} />
                  <span style={{ flex: 1 }}>{label}</span>
                </NavLink>
              ))}
            </div>
          ))}

          <div className="sidebar-section" style={{ marginTop: 8 }}>Account</div>
          <NavLink to="/profile" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <UserIcon size={16} /> My Profile
          </NavLink>
        </div>

        {/* Sidebar user */}
        <div className="sidebar-user">
          <div className="sidebar-avatar" style={{ background: `linear-gradient(135deg, ${roleColor}, ${roleColor}88)` }}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: `${roleColor}cc` }}>{roleLabel}</div>
          </div>
          <button onClick={handleLogout}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 6, borderRadius: 8, display: 'flex' }}
            title="Logout">
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        <header className="header">
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            id="mob-menu"
            style={{ display: 'none' }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div style={{ flex: 1 }} />

          {/* Critical alerts banner */}
          {criticalAlerts.length > 0 && (
            <button
              onClick={() => navigate('/complaints?priority=critical')}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: 'var(--badge-critical-bg)',
                border: '1px solid var(--badge-critical-border)',
                padding: '6px 13px', borderRadius: 8, cursor: 'pointer',
                animation: 'pulse 2s infinite',
              }}
            >
              <AlertTriangle size={14} color="var(--badge-critical-fg)" />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--badge-critical-fg)' }}>
                {criticalAlerts.length} Critical
              </span>
            </button>
          )}

          {/* Command palette chip */}
          <button className="kbd-chip" id="quick-search-chip"
            onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}>
            <Command size={12} />
            <span>Quick search</span>
            <span className="cmdk-kbd">{isMac ? '⌘' : 'Ctrl'} K</span>
          </button>

          {/* Theme toggle */}
          <button className="theme-toggle" onClick={toggleTheme} title={isDark ? 'Light mode' : 'Dark mode'}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Notifications */}
          <NotificationBell />

          {/* Profile chip */}
          <button
            onClick={() => navigate('/profile')}
            id="profile-chip"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--card-hover)',
              padding: '6px 14px', borderRadius: 10,
              border: '1px solid var(--border)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-strong)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: `linear-gradient(135deg, ${roleColor}, ${roleColor}88)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 12, fontWeight: 700,
            }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="profile-chip-text" style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1 }}>{user?.name?.split(' ')[0]}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{roleLabel}</div>
            </div>
          </button>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #mob-menu { display: flex !important; }
          #quick-search-chip { display: none !important; }
          .profile-chip-text { display: none; }
        }
        @media (max-width: 480px) {
          #profile-chip { padding: 6px 10px; }
        }
      `}</style>
    </div>
  );
}
