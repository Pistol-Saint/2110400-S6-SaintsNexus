
import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Register() {
  const { signup, user, loading } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (loading) {
    return <div className="loading-screen">Loading Saints Nexus...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setSaving(true);

    try {
      await signup({
        username: username.trim(),
        email: email.trim(),
        password,
      });

      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="auth-page">
      <Navbar />

      <main className="auth-container">
        <section className="auth-card">
          <span className="eyebrow">JOIN SAINTS NEXUS</span>
          <h1>Create your <span>account.</span></h1>
          <p className="auth-description">
            Start learning, growing, and achieving more.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              Username
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Choose a username"
                minLength={3}
                maxLength={30}
                autoComplete="username"
                required
              />
            </label>

            <label>
              Email address
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                minLength={8}
                autoComplete="new-password"
                required
              />
            </label>

            <label>
              Confirm password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Enter your password again"
                autoComplete="new-password"
                required
              />
            </label>

            {error && <p className="error-message">{error}</p>}

            <button className="primary-button auth-submit" disabled={saving}>
              {saving ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="auth-switch">
            Already registered? <Link to="/login">Sign in</Link>
          </p>
        </section>
      </main>
    </div>
  );
}
