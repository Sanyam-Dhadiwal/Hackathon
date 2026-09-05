import React, { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, X, ExternalLink } from 'lucide-react';

export default function MongoModal({ isOpen, onClose, currentStatus, onConnected }) {
  const [uri, setUri] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const isCloud = currentStatus?.database?.type?.includes('Atlas');

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!uri.trim()) return;

    setConnecting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/settings/connect-mongodb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mongodb_uri: uri.trim() })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Successfully connected to MongoDB Atlas Cloud!');
        if (onConnected) onConnected();
      } else {
        setError('Could not connect to MongoDB Atlas. Please check your username, password, and IP whitelist in Atlas.');
      }
    } catch (err) {
      setError(`Connection failed: ${err.message}`);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div style={{
        maxWidth: 540,
        width: '100%',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 20,
        padding: 28,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ padding: 10, borderRadius: 12, background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
              <Database style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Connect MongoDB Atlas Cloud</h3>
              <p style={{ fontSize: 12, color: '#64748b' }}>Scalable Cloud Database Configuration</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}
          >
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Current status pill */}
        <div style={{
          padding: '12px 16px',
          borderRadius: 12,
          background: isCloud ? '#ecfdf5' : '#f1f5f9',
          border: `1px solid ${isCloud ? '#a7f3d0' : '#e2e8f0'}`,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          {isCloud ? (
            <CheckCircle2 style={{ width: 18, height: 18, color: '#059669', flexShrink: 0 }} />
          ) : (
            <Database style={{ width: 18, height: 18, color: '#64748b', flexShrink: 0 }} />
          )}
          <div style={{ fontSize: 12, color: isCloud ? '#065f46' : '#334155' }}>
            <strong>Current Database:</strong> {currentStatus?.database?.type || 'In-Memory Safe Store'}
          </div>
        </div>

        {/* Connection Form */}
        <form onSubmit={handleConnect} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
              MongoDB Atlas Connection String (URI)
            </label>
            <textarea
              rows="3"
              required
              value={uri}
              onChange={(e) => setUri(e.target.value)}
              placeholder="mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/travel_planner?retryWrites=true&w=majority"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 10,
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                fontSize: 13,
                fontFamily: 'monospace',
                outline: 'none',
                resize: 'none'
              }}
            />
            <p style={{ fontSize: 11, color: '#64748b', marginTop: 6, lineHeight: 1.4 }}>
              💡 Tip: Make sure to replace <code style={{ color: '#4f46e5', fontWeight: 700 }}>&lt;password&gt;</code> with your Atlas database user password, and ensure your Atlas Network Access has IP <code style={{ color: '#4f46e5', fontWeight: 700 }}>0.0.0.0/0</code> allowed.
            </p>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 10, background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{ padding: '10px 14px', borderRadius: 10, background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 style={{ width: 16, height: 16, flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #e2e8f0' }}>
            <a
              href="https://www.mongodb.com/atlas/database"
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 12, color: '#4f46e5', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
            >
              <span>Get Free Atlas Cluster</span>
              <ExternalLink style={{ width: 12, height: 12 }} />
            </a>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={onClose}
                style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: '8px 14px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={connecting}
                className="btn-primary"
              >
                {connecting ? 'Connecting...' : 'Connect to Atlas'}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
