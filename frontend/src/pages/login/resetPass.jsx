import { useState } from 'react';
import './login.css';

export default function ResetPassword() {
  const token = new URLSearchParams(window.location.search).get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!token) return setError('Reset token is missing from the URL.');
    if (!newPassword || !confirm) return setError('Please fill in both fields.');
    if (newPassword !== confirm) return setError('Passwords do not match.');
    if (newPassword.length < 6) return setError('Password must be at least 6 characters.');

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Something went wrong.');

      setSuccess('Password reset successfully. Redirecting to login...');
      setTimeout(() => {
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{ width: '100vw', height: '100vh' }}>
      <div className="login-page__banner" />
      <div className="login-page__card">
        <div className="login-page__form">

          <div className="form-field">
            <label htmlFor="newPassword">New Password:</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="confirm">Confirm Password:</label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          {error && <p className="login-page__error">{error}</p>}
          {success && <p className="login-page__success">{success}</p>}

          <button
            className="login-page__submit"
            onClick={handleSubmit}
            disabled={loading || !!success}
          >
            {loading ? 'Please wait...' : 'RESET PASSWORD'}
          </button>

          <button
            className="login-page__forgot-link"
            onClick={() => {
              window.history.pushState({}, '', '/');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            Back to login
          </button>

        </div>
      </div>
    </div>
  );
}