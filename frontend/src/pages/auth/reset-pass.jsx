import { useState } from 'react';
import { resetPassword } from '../../services/auth.js';
import logo from '/logo.png';
import './auth.css';

export default function ResetPassword({ onNavigate }) {
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
      await resetPassword({ token, newPassword });
      setSuccess('Password reset successfully. Redirecting to login...');
      setTimeout(() => onNavigate('/'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) handleSubmit();
  };

  return (
    <div className="login-page" style={{ width: '100vw', height: '100vh' }}>
      <img src={logo} alt="Locked-In Logo" className="login-page__logo" />

      <div className="login-page__card">
        <div className="login-page__form" onKeyDown={handleKeyDown}>
          <div className="form-field">
            <label htmlFor="newPassword">New Password:</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoFocus
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
            {success ? 'Redirecting...' : loading ? 'Please wait...' : 'RESET PASSWORD'}
          </button>

          <button
            className="login-page__forgot-link"
            onClick={() => onNavigate('/')}
          >
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
}