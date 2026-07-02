// src/pages/Auth.jsx
import { useState } from 'react';
import { api, saveAuth } from '../api';

export default function Auth({ onLoggedIn }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '', job_role: '', experience_level: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = mode === 'login' ? await api.login(form) : await api.signup(form);
      saveAuth(result.token, result.user);
      onLoggedIn(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 28 }}>
          Interview<span style={{ color: 'var(--accent)' }}>ly</span>
        </h1>
        <p style={{ color: 'var(--ink-soft)', marginTop: 8 }}>
          {mode === 'login' ? 'Welcome back. Log in to continue.' : 'Create your account to start practicing.'}
        </p>
      </div>

      <div className="card">
        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input id="name" required value={form.name} onChange={(e) => update('name', e.target.value)} />
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
            />
          </div>

          {mode === 'signup' && (
            <>
              <div className="field">
                <label htmlFor="job_role">Target job role</label>
                <input
                  id="job_role"
                  placeholder="e.g. Software Engineer"
                  value={form.job_role}
                  onChange={(e) => update('job_role', e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="experience_level">Experience level</label>
                <select
                  id="experience_level"
                  value={form.experience_level}
                  onChange={(e) => update('experience_level', e.target.value)}
                >
                  <option value="">Select one</option>
                  <option value="fresher">Fresher</option>
                  <option value="1-3 years">1–3 years</option>
                  <option value="3-5 years">3–5 years</option>
                  <option value="5+ years">5+ years</option>
                </select>
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--ink-soft)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button className="link-btn" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}
