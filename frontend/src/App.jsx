// src/App.jsx
import { useState } from 'react';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Interview from './pages/Interview';
import { getUser, isLoggedIn } from './api';

export default function App() {
  const [user, setUser] = useState(getUser());
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'interview'
  const [activeInterviewType, setActiveInterviewType] = useState(null);

  if (!loggedIn) {
    return (
      <Auth
        onLoggedIn={(u) => {
          setUser(u);
          setLoggedIn(true);
        }}
      />
    );
  }

  if (view === 'interview') {
    return (
      <Interview
        interviewType={activeInterviewType}
        onBackToDashboard={() => setView('dashboard')}
      />
    );
  }

  return (
    <Dashboard
      user={user}
      onStart={(type) => {
        setActiveInterviewType(type);
        setView('interview');
      }}
      onOpenSession={() => {
        // Filhaal simple: dashboard list se hi score dikh jaata hai.
        // Future improvement: ek dedicated session detail view banayenge.
      }}
      onLogout={() => {
        setLoggedIn(false);
        setUser(null);
      }}
    />
  );
}
