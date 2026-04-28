import { useState } from "react";
import "./Login.css";

export default function Register() {
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
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await res.json();

      if (result.token) {
        alert("Account created successfully!");
        window.location.href = '/'; // back to login
      } else {
        setError(result.message || "Registration failed");
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
          <h1>Create Account</h1>
        </div>
        <div className="login-right">
          <h2>Register</h2>
          {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <input name="email" type="email" placeholder="Email"
              value={form.email} onChange={handleChange} required disabled={loading} />
            <input name="password" type="password" placeholder="Password"
              value={form.password} onChange={handleChange} required disabled={loading} minLength="6" />
            <button type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>
          <p className="register-text">
            Already have an account?{" "}
            <span onClick={() => window.location.href = '/'} style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}