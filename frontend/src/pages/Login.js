import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Shield } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { label: 'CM (Rekha Gupta)', email: 'cm@delhi.gov.in', color: '#7c3aed' },
  { label: 'Super Admin', email: 'admin@delhi.gov.in', color: '#dc2626' },
  { label: 'Dept Head', email: 'dh.roads@delhi.gov.in', color: '#d97706' },
  { label: 'Officer', email: 'officer1@delhi.gov.in', color: '#0284c7' },
  { label: 'Citizen', email: 'citizen1@example.com', color: '#059669' },
];

const FEATURES = [
  { icon: '🤖', label: 'AI Classification', desc: 'Auto-routed to depts' },
  { icon: '🚨', label: 'Real-time Alerts', desc: 'Critical escalation' },
  { icon: '🛡️', label: 'Anti-Fraud', desc: 'False closure detection' },
  { icon: '📊', label: 'Analytics', desc: 'Live dashboards' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user } = await login(form);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}! 👋`);
      if (user.role === 'cm') navigate('/cm-dashboard');
      else if (['employee', 'department_head'].includes(user.role)) navigate('/my-complaints');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (email) => setForm({ email, password: 'password123' });

  return (
    <div className="auth-bg">
      <div className="auth-card">

        {/* ── Logo + Title (always visible against dark bg) ── */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 70, height: 70,
            background: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)',
            borderRadius: 20,
            margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36,
            boxShadow: '0 8px 24px rgba(249,115,22,0.5)',
          }}>🏛️</div>
          {/* Title sits OUTSIDE the glass card so it's always on the dark bg */}
          <h1 style={{ color: '#ffffff', fontSize: 26, fontWeight: 900, letterSpacing: -0.8, marginBottom: 6 }}>
            CM Grievance System
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13.5 }}>
            Delhi Government · Grievance Intelligence Platform
          </p>
        </div>

        {/* ── Glass card ── */}
        <div className="auth-glass">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-control"
                type="email"
                placeholder="your@delhi.gov.in"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
                autoComplete="email"
                style={{ fontSize: 14 }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 22 }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-control"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    /* Use CSS var so it's visible in both themes */
                    color: 'var(--auth-eye-icon)',
                    display: 'flex', alignItems: 'center',
                  }}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', fontSize: 15, fontWeight: 700 }}
              disabled={loading}
            >
              {loading
                ? <><div className="spinner spinner-sm" style={{ borderTopColor: 'white' }} /> Signing in...</>
                : <><Shield size={17} /> Sign In Securely</>}
            </button>
          </form>

          {/* ── Quick demo login ── */}
          <div style={{
            marginTop: 20,
            padding: '13px 15px',
            background: 'var(--auth-demo-bg)',
            borderRadius: 12,
            border: '1px solid var(--auth-demo-border)',
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700,
              color: 'var(--auth-demo-label)',
              textTransform: 'uppercase', letterSpacing: 1.1, marginBottom: 9,
            }}>
              ⚡ Quick Demo Login (Password: password123)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => quickLogin(acc.email)}
                  style={{
                    padding: '5px 12px', fontSize: 11.5,
                    background: `${acc.color}18`,
                    color: acc.color,
                    border: `1.5px solid ${acc.color}55`,
                    borderRadius: 20, cursor: 'pointer',
                    fontWeight: 700,
                    transition: 'all 0.15s',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${acc.color}2e`;
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `${acc.color}18`;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Bottom links ── */}
          <div style={{
            marginTop: 18,
            display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
            paddingTop: 16,
            borderTop: '1px solid var(--auth-card-divider)',
          }}>
            <span style={{ fontSize: 13, color: 'var(--auth-text-muted)' }}>
              New citizen?{' '}
              <Link to="/register" style={{ color: '#3b82f6', fontWeight: 700 }}>Register here</Link>
            </span>
            <Link to="/track" style={{ fontSize: 13, color: 'var(--auth-text-muted)', fontWeight: 500 }}>
              Track complaint →
            </Link>
          </div>
        </div>

        {/* ── Feature cards (sit on the dark bg, always fine) ── */}
        <div className="auth-features" style={{ marginTop: 18 }}>
          {FEATURES.map((f) => (
            <div key={f.label} className="auth-feature">
              <div className="auth-feature-icon">{f.icon}</div>
              <div style={{ color: 'var(--auth-feature-title)', fontWeight: 700, fontSize: 12.5, marginBottom: 2 }}>
                {f.label}
              </div>
              <div className="auth-feature-label">{f.desc}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
