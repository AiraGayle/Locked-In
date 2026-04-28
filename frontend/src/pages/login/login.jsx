import { useState } from "react";
import "./Login.css";


export default function Login({ onLogin }) {
 
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await res.json();

      if (result.token) {
        onLogin(result); // App handles navigation
      } else {
        setError(result.message || "Login failed");
      }
    } catch (err) {
      setError("Network error - please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-left">
          <h1>Welcome Back</h1>
        </div>
        <div className="login-right">
          <h2>Login</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <input name="email" type="email" placeholder="Email"
              value={form.email} onChange={handleChange} required disabled={loading} />
            <input name="password" type="password" placeholder="Password"
              value={form.password} onChange={handleChange} required disabled={loading} />
            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <p className="register-text">
              No account?{" "}
              <span onClick={() => window.location.href = '/register'} style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>
                Register
              </span>
            </p>
        </div>
      </div>
    </div>
  );
}