import { useState } from 'react';
import './login.css';

import { register, login, forgotPassword } from '../../services/auth.js';
import logo from '../../assets/logo_fc.png';

export default function LoginPage() {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [showForgot, setShowForgot] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setSuccess('');
  };

  const handleTabSwitch = (t) => {
    setTab(t);
    setForm({ username: '', email: '', password: '' });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (showForgot){
        await forgotPassword({ email: form.email }); 
        setSuccess('If that email exists, a reset link has been sent.');
      } else if (tab === 'login') {
        await login({ email: form.email, password: form.password });
        window.location.href = '/dashboard';
      } else {
        await register({ username: form.username, email: form.email, password: form.password });
        window.location.href = '/dashboard';
      }
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

      <img
            src={logo} alt="Focus Room Logo" className="login-page__logo"
          />

       {/* Banner */}
    
      <div className="login-page__card">
        <div className="login-page__brand">
          
        </div>


       

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
          {!showForgot && tab === 'register' && (
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


          {!showForgot && (
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
            { tab === 'login' && (
              <button
              className="login-page__forgot-link"
              onClick={()=> {
                setShowForgot(true);
                setError('');
                setSuccess('');
              }}
            > Fogot password?
            </button>
            )}
          </div>
          )}

          {error && <p className="login-page__error">{error}</p>}
          {success && <p className="login-page__success">{success}</p>}

          <button
            className="login-page__submit"
            onClick={handleSubmit}
            disabled={loading || (showForgot && !!success)}
          >
            {loading ? 'Please wait...' : showForgot ? 'SEND RESET LINK'
            : tab === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </button>

          {showForgot && (
            <button
            className="login-page__forgot-link"
            onClick={() => {
              setShowForgot(false);
              setForm({username: '', email: '', password: ''});
              setError('');
              setSuccess('');
            }}
            >
            Back to login
            </button>
          )}
        </div>

      </div>
    </div>
  );
}