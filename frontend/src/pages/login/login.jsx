import { useState } from 'react';
import './Login.css';

import { register, login } from '../../services/auth-service.js';

export default function LoginPage() {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleTabSwitch = (t) => {
    setTab(t);
    setForm({ username: '', email: '', password: '' });
    setError('');F
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await register({ username: form.username, email: form.email, password: form.password });
      }
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="login-page" style={{ width: "100vw", height: "100vh" }}>

       {/* Banner */}
      <div className="login-page__banner" />
      <div className="login-page__card">

       

        {/* Tabs */}
        <div className="login-page__tabs">
          <button
            className={`login-page__tab ${tab === 'login' ? 'login-page__tab--active' : ''}`}
            onClick={() => handleTabSwitch('login')}
          >
            LOGIN
          </button>
          <button
            className={`login-page__tab ${tab === 'register' ? 'login-page__tab--active' : ''}`}
            onClick={() => handleTabSwitch('register')}
          >
            REGISTER
          </button>
        </div>

        {/* Form */}
        <div className="login-page__form" onKeyDown={handleKeyDown}>
          {tab === 'register' && (
            <div className="form-field">
              <label htmlFor="username">Username:</label>
              <input
                id="username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
              />
            </div>
          )}

          <div className="form-field">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && <p className="login-page__error">{error}</p>}

          <button
            className="login-page__submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Please wait...' : tab === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </button>
        </div>

      </div>
    </div>
  );
}