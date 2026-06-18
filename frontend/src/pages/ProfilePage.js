import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile, changePassword } from '../services/api';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/helpers';
import { User, Lock, Save, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateLocalUser } = useAuth();
  const [tab, setTab] = useState('profile');

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    ward: user?.ward || '',
    district: user?.district || '',
  });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  const ROLE_LABELS = {
    cm: 'Chief Minister', super_admin: 'Super Admin',
    department_head: 'Department Head', employee: 'Field Officer', citizen: 'Citizen',
  };
  const ROLE_COLORS = {
    cm: '#7c3aed', super_admin: '#dc2626', department_head: '#d97706',
    employee: '#0284c7', citizen: '#059669',
  };
  const roleColor = ROLE_COLORS[user?.role] || '#3b82f6';

  const handleProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await updateProfile(profileForm);
      updateLocalUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Update failed'));
    } finally { setSaving(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) return toast.error('Passwords do not match');
    if (passForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setSaving(true);
    try {
      await changePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      toast.success('Password changed successfully!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Change failed'));
    } finally { setSaving(false); }
  };

  return (
    <div style={{ maxWidth: 680 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account settings</p>
        </div>
      </div>

      {/* Profile hero */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ padding: 28, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: `linear-gradient(135deg, ${roleColor}, ${roleColor}88)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 800, color: 'white',
            boxShadow: `0 8px 24px ${roleColor}40`,
            border: `3px solid ${roleColor}44`,
          }}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.4 }}>{user?.name}</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 3 }}>{user?.email}</div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: roleColor, background: `${roleColor}15`, padding: '3px 10px', borderRadius: 20, border: `1px solid ${roleColor}30` }}>
                {ROLE_LABELS[user?.role] || user?.role}
              </span>
              {user?.department?.name && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--card-hover)', padding: '3px 10px', borderRadius: 20, border: '1px solid var(--border)' }}>
                  {user.department.name}
                </span>
              )}
              {user?.designation && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--card-hover)', padding: '3px 10px', borderRadius: 20, border: '1px solid var(--border)' }}>
                  {user.designation}
                </span>
              )}
            </div>
          </div>

          {user?.stats && (
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 20 }}>
              {[
                { label: 'Resolved', value: user.stats.totalResolved },
                { label: 'Avg Rating', value: user.stats.avgSatisfactionScore ? `${user.stats.avgSatisfactionScore}⭐` : '—' },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--card)', borderRadius: 12, padding: 4, border: '1px solid var(--border)', width: 'fit-content' }}>
        {[
          { id: 'profile', label: 'Profile Info', icon: User },
          { id: 'password', label: 'Password', icon: Lock },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`btn btn-sm ${tab === id ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 9 }}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="card">
          <div className="card-header"><div className="card-title">Profile Information</div></div>
          <div className="card-body">
            <form onSubmit={handleProfile}>
              <div className="grid grid-2">
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Full Name</label>
                  <input className="form-control" value={profileForm.name} onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Email Address</label>
                  <input className="form-control" value={user?.email} disabled />
                  <div className="form-hint">Email cannot be changed</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-control" value={profileForm.phone} onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+91 9876543210" />
                </div>
                <div className="form-group">
                  <label className="form-label">Ward</label>
                  <input className="form-control" value={profileForm.ward} onChange={(e) => setProfileForm((f) => ({ ...f, ward: e.target.value }))} placeholder="Ward name / number" />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">District</label>
                  <input className="form-control" value={profileForm.district} onChange={(e) => setProfileForm((f) => ({ ...f, district: e.target.value }))} placeholder="e.g. South Delhi" />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <><div className="spinner spinner-sm" style={{ borderTopColor: 'white' }} /> Saving...</> : <><Save size={14} /> Save Changes</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {tab === 'password' && (
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Shield size={18} color="var(--warning)" />
              <div className="card-title">Change Password</div>
            </div>
          </div>
          <div className="card-body">
            <form onSubmit={handlePassword}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input className="form-control" type="password" value={passForm.currentPassword} onChange={(e) => setPassForm((f) => ({ ...f, currentPassword: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-control" type="password" value={passForm.newPassword} onChange={(e) => setPassForm((f) => ({ ...f, newPassword: e.target.value }))} placeholder="Min. 6 characters" required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input className="form-control" type="password" value={passForm.confirmPassword} onChange={(e) => setPassForm((f) => ({ ...f, confirmPassword: e.target.value }))} required />
                {passForm.confirmPassword && passForm.newPassword !== passForm.confirmPassword && (
                  <div className="form-error">Passwords do not match</div>
                )}
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving || (passForm.confirmPassword && passForm.newPassword !== passForm.confirmPassword)}>
                {saving ? <><div className="spinner spinner-sm" style={{ borderTopColor: 'white' }} /> Changing...</> : <><Lock size={14} /> Change Password</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
