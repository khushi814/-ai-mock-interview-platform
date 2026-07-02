// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { api, logout } from '../api';

const INTERVIEW_TYPES = [
  { id: 'behavioral', title: 'Behavioral', desc: 'Communication, STAR structure, self-awareness' },
  { id: 'technical', title: 'Technical', desc: 'Depth of knowledge, problem-solving approach' },
  { id: 'system_design', title: 'System Design', desc: 'Architecture thinking, tradeoffs' },
  { id: 'hr', title: 'HR / Culture Fit', desc: 'Motivation, values, situational judgment' },
];

export default function Dashboard({ user, onStart, onOpenSession, onLogout }) {
  const [selectedType, setSelectedType] = useState('behavioral');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getSessions()
      .then((data) => setSessions(data.sessions))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    logout();
    onLogout();
  }

  return (
    <div>
      <div className="topbar">
        <div className="logo">
          Interview<span>ly</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 14, color: 'var(--ink-soft)' }}>Hi, {user?.name}</span>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>

      <div className="container">
        <h2 style={{ fontSize: 22, marginBottom: 4 }}>Start a new interview</h2>
        <p style={{ color: 'var(--ink-soft)', marginBottom: 8 }}>Choose the kind of interview you want to practice.</p>

        <div className="type-grid">
          {INTERVIEW_TYPES.map((t) => (
            <button
              key={t.id}
              className={`type-card ${selectedType === t.id ? 'selected' : ''}`}
              onClick={() => setSelectedType(t.id)}
            >
              <h3>{t.title}</h3>
              <p>{t.desc}</p>
            </button>
          ))}
        </div>

        <button className="btn btn-primary btn-block" onClick={() => onStart(selectedType)}>
          Start voice interview
        </button>

        <div style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 20, marginBottom: 16 }}>Past sessions</h2>

          {loading && <p style={{ color: 'var(--ink-soft)' }}>Loading…</p>}

          {!loading && sessions.length === 0 && (
            <div className="card" style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>
              No interviews yet. Start one above to see your first report here.
            </div>
          )}

          {!loading && sessions.length > 0 && (
            <div className="card">
              {sessions.map((s) => (
                <div key={s.id} className="session-row">
                  <div>
                    <span className="badge">{s.interview_type.replace('_', ' ')}</span>
                    <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 6 }}>
                      {new Date(s.started_at).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {s.status === 'completed' && s.score && (
                      <span className="badge badge-score">Score: {s.score}/10</span>
                    )}
                    {s.status === 'in_progress' && <span className="badge">In progress</span>}
                    <button className="btn btn-secondary" onClick={() => onOpenSession(s.id)}>
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
