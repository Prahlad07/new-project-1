import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', ward: '', district: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="auth-bg">
      <div className="auth-card" style={{ maxWidth: 480 }}>

        {/* Title — on the dark bg, always visible */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64,
            background: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)',
            borderRadius: 18, margin: '0 auto 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, boxShadow: '0 8px 24px rgba(249,115,22,0.4)',
          }}>🏛️</div>
          <h1 style={{ color: '#ffffff', fontSize: 24, fontWeight: 900, letterSpacing: -0.5 }}>
            Create Your Account
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 5 }}>
            Join the Delhi Grievance Platform
          </p>
        </div>

        {/* Glass card */}
        <div className="auth-glass">
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Full Name *</label>
                <input className="form-control" placeholder="Rahul Kumar" value={form.name} onChange={set('name')} required />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Email Address *</label>
                <input className="form-control" type="email" placeholder="rahul@example.com" value={form.email} onChange={set('email')} required />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="form-control"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={set('password')}
                    required
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    tabIndex={-1}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--auth-eye-icon)',
                      display: 'flex', alignItems: 'center',
                    }}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" placeholder="+91 9876543210" value={form.phone} onChange={set('phone')} />
              </div>
              <div className="form-group">
                <label className="form-label">Ward</label>
                <input className="form-control" placeholder="Ward no / name" value={form.ward} onChange={set('ward')} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">District</label>
                <input className="form-control" placeholder="e.g. South Delhi" value={form.district} onChange={set('district')} />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', fontWeight: 700 }}
              disabled={loading}
            >
              {loading
                ? <><div className="spinner spinner-sm" style={{ borderTopColor: 'white' }} /> Creating account...</>
                : <><UserPlus size={16} /> Create Account</>}
            </button>
          </form>

          <div style={{
            textAlign: 'center', marginTop: 18, fontSize: 13,
            color: 'var(--auth-text-muted)',
            paddingTop: 16,
            borderTop: '1px solid var(--auth-card-divider)',
          }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#3b82f6', fontWeight: 700 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
