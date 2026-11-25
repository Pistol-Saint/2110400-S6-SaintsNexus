
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }

    navigate("/login");
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        SAINTS <span>NEXUS</span>
      </Link>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/courses">Courses</Link>

        {isAuthenticated ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/profile">Profile</Link>

            {user?.role === "admin" && (
              <Link to="/admin">Admin Panel</Link>
            )}

            <button
              type="button"
              className="btn-secondary"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn-primary">
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
