import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0b0f1a 0%, #0f2247 40%, #1a3a6b 70%, #0b1120 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(ellipse at 50% 30%, rgba(59,130,246,0.15) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: 480 }}>
        <div style={{ fontSize: 96, lineHeight: 1, marginBottom: 16, opacity: 0.9 }}>🏛️</div>
        <div style={{ fontSize: 120, fontWeight: 900, color: 'rgba(255,255,255,0.08)', letterSpacing: -10, lineHeight: 1, marginBottom: -30 }}>404</div>
        <h1 style={{ color: 'white', fontSize: 32, fontWeight: 900, marginBottom: 12, letterSpacing: -0.8 }}>Page Not Found</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.7, marginBottom: 36 }}>
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate(-1)} className="btn btn-ghost"
            style={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.2)' }}>
            <ArrowLeft size={15} /> Go Back
          </button>
          <Link to="/" className="btn btn-primary"><Home size={15} /> Go Home</Link>
        </div>
      </div>
    </div>
  );
}
