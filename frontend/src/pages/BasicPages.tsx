
import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";

import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { apiRequest } from "../services/api";

interface AdminUser {
  id: string;
  email: string;
  username: string;
  role: "admin" | "user";
  is_banned: boolean;
  ban_reason: string | null;
  created_at: string;
  updated_at: string;
}

interface ProfileData {
  id: string;
  email: string;
  username: string;
  role: "admin" | "user";
}

interface UserSession {
  id: string;
  created_at: string;
  expires_at: string;
  revoked_at: string | null;
  last_seen_at: string | null;
  ip_address: string | null;
}

type AuditLog = Record<string, unknown>;

function formatDate(value: unknown): string {
  if (typeof value !== "string") return "Unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString();
}

function isSessionActive(session: UserSession): boolean {
  if (session.revoked_at) return false;

  return new Date(session.expires_at).getTime() > Date.now();
}


// =========================================
// USER DASHBOARD
// =========================================

export function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="app">
      <Navbar />

      <main className="container basic-page">
        <span className="eyebrow">YOUR LEARNING SPACE</span>

        <h1>
          Welcome, <span>{user?.username}</span>.
        </h1>

        <p>Welcome to your Saints Nexus dashboard.</p>

        <div className="dashboard-grid">
          <Link to="/courses" className="dashboard-card">
            <h2>Explore Courses</h2>
            <p>Browse the available learning catalogue.</p>
          </Link>

          <Link to="/profile" className="dashboard-card">
            <h2>My Profile</h2>
            <p>View and manage your account information.</p>
          </Link>

          {user?.role === "admin" && (
            <Link to="/admin" className="dashboard-card">
              <h2>Admin Panel</h2>
              <p>Manage users and platform activity.</p>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}


// =========================================
// USER PROFILE AND SESSION MANAGEMENT
// =========================================

export function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const [username, setUsername] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [sessions, setSessions] = useState<UserSession[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sessionError, setSessionError] = useState("");
  const [sessionMessage, setSessionMessage] = useState("");

  // The session ID is saved during login and remains stable during token refresh.
  const currentSessionId = sessionStorage.getItem("saints_session_id");


  // Load profile information
  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest<ProfileData>(
        "/api/profile",
        {},
        true
      );

      setProfile(data);
      setUsername(data.username);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your profile."
      );
    } finally {
      setLoading(false);
    }
  }, []);


  // Load login sessions
  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    setSessionError("");

    try {
      const data = await apiRequest<UserSession[]>(
        "/api/auth/sessions",
        {},
        true
      );

      setSessions(data);
    } catch (err) {
      setSessionError(
        err instanceof Error
          ? err.message
          : "Unable to load your sessions."
      );
    } finally {
      setSessionsLoading(false);
    }
  }, []);


  useEffect(() => {
    void loadProfile();
    void loadSessions();
  }, [loadProfile, loadSessions]);


  // Update username
  async function handleProfileUpdate(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedUsername = username.trim();

    if (
      trimmedUsername.length < 3 ||
      trimmedUsername.length > 30
    ) {
      setError(
        "Username must contain between 3 and 30 characters."
      );
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const updated = await apiRequest<ProfileData>(
        "/api/profile",
        {
          method: "PUT",
          body: JSON.stringify({
            username: trimmedUsername,
          }),
        },
        true
      );

      setProfile(updated);
      setUsername(updated.username);

      setMessage("Profile updated successfully!");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  }


  // Change account password
  async function handlePasswordChange(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (newPassword.length < 8) {
      setError(
        "Your new password must contain at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Your new passwords do not match.");
      return;
    }

    setChangingPassword(true);

    try {
      const result = await apiRequest<{ message: string }>(
        "/api/profile/change-password",
        {
          method: "POST",
          body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
          }),
        },
        true
      );

      setMessage(result.message);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Refresh the list because other sessions are revoked
      // by the backend after a successful password change.
      await loadSessions();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to change your password."
      );
    } finally {
      setChangingPassword(false);
    }
  }


  // Revoke another login session
  async function handleRevokeSession(session: UserSession) {
    if (session.id === currentSessionId) {
      setSessionError(
        "You cannot revoke the session currently being used."
      );
      return;
    }

    if (!isSessionActive(session)) {
      setSessionError("This session is no longer active.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to revoke this session? The device using it will need to log in again."
    );

    if (!confirmed) return;

    setRevokingSessionId(session.id);
    setSessionError("");
    setSessionMessage("");

    try {
      const result = await apiRequest<{ message: string }>(
        `/api/auth/sessions/${session.id}`,
        {
          method: "DELETE",
        },
        true
      );

      setSessionMessage(result.message);

      await loadSessions();
    } catch (err) {
      setSessionError(
        err instanceof Error
          ? err.message
          : "Unable to revoke this session."
      );
    } finally {
      setRevokingSessionId(null);
    }
  }


  const activeSessions = sessions.filter(isSessionActive).length;


  return (
    <div className="app">
      <Navbar />

      <main className="container basic-page">

        <span className="eyebrow">ACCOUNT SETTINGS</span>

        <h1>
          My <span>Profile</span>
        </h1>


        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        {message && (
          <p className="success-message" role="status">
            {message}
          </p>
        )}


        {loading ? (
          <p className="empty-state">
            Loading your profile...
          </p>
        ) : profile ? (
          <>

            {/* PERSONAL INFORMATION */}

            <section className="form-section">

              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    PERSONAL INFORMATION
                  </span>

                  <h2>Account Details</h2>
                </div>
              </div>

              <p>
                <strong>Email:</strong> {profile.email}
              </p>

              <p>
                <strong>Role:</strong> {profile.role}
              </p>

              <p>
                <strong>Account ID:</strong> {profile.id}
              </p>


              <form
                className="auth-form"
                onSubmit={handleProfileUpdate}
              >

                <label>
                  Username

                  <input
                    value={username}
                    onChange={(event) =>
                      setUsername(event.target.value)
                    }
                    minLength={3}
                    maxLength={30}
                    required
                  />
                </label>


                <button
                  className="primary-button"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Profile"}
                </button>

              </form>

            </section>


            {/* PASSWORD MANAGEMENT */}

            <section className="form-section">

              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    ACCOUNT SECURITY
                  </span>

                  <h2>Change Password</h2>
                </div>
              </div>


              <form
                className="auth-form"
                onSubmit={handlePasswordChange}
              >

                <label>
                  Current Password

                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(event) =>
                      setCurrentPassword(event.target.value)
                    }
                    autoComplete="current-password"
                    required
                  />
                </label>


                <label>
                  New Password

                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(event.target.value)
                    }
                    minLength={8}
                    autoComplete="new-password"
                    required
                  />
                </label>


                <label>
                  Confirm New Password

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    minLength={8}
                    autoComplete="new-password"
                    required
                  />
                </label>


                <button
                  className="primary-button"
                  type="submit"
                  disabled={changingPassword}
                >
                  {changingPassword
                    ? "Changing Password..."
                    : "Change Password"}
                </button>

              </form>

            </section>


            {/* SESSION MANAGEMENT */}

            <section className="admin-section">

              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    ACCOUNT SECURITY
                  </span>

                  <h2>Active Sessions</h2>

                  <p>
                    View your login sessions and revoke access
                    from devices you no longer use.
                  </p>
                </div>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => void loadSessions()}
                  disabled={sessionsLoading}
                >
                  {sessionsLoading ? "Refreshing..." : "Refresh Sessions"}
                </button>
              </div>


              <div className="admin-stat-grid">
                <article className="admin-stat-card">
                  <span>Total Sessions</span>
                  <strong>{sessions.length}</strong>
                </article>

                <article className="admin-stat-card">
                  <span>Active Sessions</span>
                  <strong>{activeSessions}</strong>
                </article>
              </div>


              {sessionError && (
                <p className="error-message" role="alert">
                  {sessionError}
                </p>
              )}

              {sessionMessage && (
                <p className="success-message" role="status">
                  {sessionMessage}
                </p>
              )}


              {sessionsLoading ? (

                <p className="empty-state">
                  Loading your sessions...
                </p>

              ) : sessions.length === 0 ? (

                <p className="empty-state">
                  No login sessions found.
                </p>

              ) : (

                <div className="audit-log-list">

                  {sessions.map((session) => {
                    const isCurrent = session.id === currentSessionId;
                    const isActive = isSessionActive(session);
                    const isRevoking = revokingSessionId === session.id;

                    return (
                      <article
                        className="audit-log-card"
                        key={session.id}
                      >

                        <div className="audit-log-heading">

                          <strong>
                            {isCurrent
                              ? "Current Session"
                              : "Login Session"}
                          </strong>

                          <span
                            className={`admin-status ${
                              isActive ? "active" : "banned"
                            }`}
                          >
                            {isActive
                              ? "Active"
                              : session.revoked_at
                                ? "Revoked"
                                : "Expired"}
                          </span>

                        </div>


                        {isCurrent && (
                          <p>
                            <strong>This device:</strong> You are
                            currently using this session.
                          </p>
                        )}

                        <p>
                          <strong>Session ID:</strong> {session.id}
                        </p>

                        <p>
                          <strong>IP Address:</strong>{" "}
                          {session.ip_address || "Unavailable"}
                        </p>

                        <p>
                          <strong>Created:</strong>{" "}
                          {formatDate(session.created_at)}
                        </p>

                        <p>
                          <strong>Last Activity:</strong>{" "}
                          {formatDate(session.last_seen_at)}
                        </p>

                        <p>
                          <strong>Expires:</strong>{" "}
                          {formatDate(session.expires_at)}
                        </p>

                        {session.revoked_at && (
                          <p>
                            <strong>Revoked:</strong>{" "}
                            {formatDate(session.revoked_at)}
                          </p>
                        )}


                        {isActive && !isCurrent && (
                          <button
                            type="button"
                            className="delete-button"
                            disabled={isRevoking}
                            onClick={() =>
                              void handleRevokeSession(session)
                            }
                          >
                            {isRevoking
                              ? "Revoking..."
                              : "Revoke Session"}
                          </button>
                        )}

                        {isCurrent && (
                          <small className="admin-self-label">
                            Current session cannot be revoked here.
                          </small>
                        )}

                      </article>
                    );
                  })}

                </div>

              )}

            </section>

          </>
        ) : (
          <p className="empty-state">
            Your profile could not be loaded.
          </p>
        )}

      </main>
    </div>
  );
}


// =========================================
// ADMIN DASHBOARD
// =========================================

export function AdminDashboard() {
  const { user } = useAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // User search, filters, and pagination
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Audit log filter
  const [logFilter, setLogFilter] = useState("all");

  const pageSize = 10;


  // Load users and audit logs
  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [userData, logData] = await Promise.all([
        apiRequest<AdminUser[]>(
          "/api/admin/users",
          {},
          true
        ),

        apiRequest<AuditLog[]>(
          "/api/admin/audit-logs?limit=100",
          {},
          true
        ),
      ]);

      setUsers(userData);
      setLogs(logData);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load administrator data."
      );
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    void loadAdminData();
  }, [loadAdminData]);


  // Change user role
  async function changeRole(target: AdminUser) {
    if (target.id === user?.id) {
      setError(
        "You cannot change your own administrator role."
      );
      return;
    }

    const newRole =
      target.role === "admin" ? "user" : "admin";

    const confirmed = window.confirm(
      `Change ${target.username}'s role from ${target.role} to ${newRole}?`
    );

    if (!confirmed) return;

    setSavingId(target.id);
    setError("");
    setMessage("");

    try {
      const result = await apiRequest<{ message: string }>(
        `/api/admin/users/${target.id}/role?new_role=${newRole}`,
        {
          method: "PATCH",
        },
        true
      );

      setMessage(result.message);

      await loadAdminData();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not update user role."
      );
    } finally {
      setSavingId(null);
    }
  }


  // Ban user
  async function banUser(target: AdminUser) {
    if (target.id === user?.id) {
      setError("You cannot ban your own account.");
      return;
    }

    const reason = window.prompt(
      `Enter a reason for banning ${target.username}:`
    );

    if (reason === null) return;

    if (!reason.trim()) {
      setError("A ban reason is required.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to ban ${target.username}?`
    );

    if (!confirmed) return;

    setSavingId(target.id);
    setError("");
    setMessage("");

    try {
      const result = await apiRequest<{ message: string }>(
        `/api/admin/users/${target.id}/ban?reason=${encodeURIComponent(reason.trim())}`,
        {
          method: "POST",
        },
        true
      );

      setMessage(result.message);

      await loadAdminData();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not ban this user."
      );
    } finally {
      setSavingId(null);
    }
  }


  // Unban user
  async function unbanUser(target: AdminUser) {
    const confirmed = window.confirm(
      `Restore access for ${target.username}?`
    );

    if (!confirmed) return;

    setSavingId(target.id);
    setError("");
    setMessage("");

    try {
      const result = await apiRequest<{ message: string }>(
        `/api/admin/users/${target.id}/unban`,
        {
          method: "POST",
        },
        true
      );

      setMessage(result.message);

      await loadAdminData();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not unban this user."
      );
    } finally {
      setSavingId(null);
    }
  }


  // Dashboard statistics
  const totalAdmins = users.filter(
    (item) => item.role === "admin"
  ).length;

  const totalBanned = users.filter(
    (item) => item.is_banned
  ).length;


  // Filter registered users
  const filteredUsers = users.filter((item) => {
    const search = userSearch.trim().toLowerCase();

    const matchesSearch =
      !search ||
      item.username.toLowerCase().includes(search) ||
      item.email.toLowerCase().includes(search);

    const matchesRole =
      roleFilter === "all" || item.role === roleFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "banned" && item.is_banned) ||
      (statusFilter === "active" && !item.is_banned);

    return matchesSearch && matchesRole && matchesStatus;
  });


  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / pageSize)
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedUsers = filteredUsers.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );


  // Filter audit logs by action
  const filteredLogs = logs.filter((log) => {
    if (logFilter === "all") return true;

    const action = String(
      log.action ?? log.action_type ?? ""
    ).toLowerCase();

    return action.includes(logFilter.toLowerCase());
  });


  return (
    <div className="app">
      <Navbar />

      <main className="container basic-page admin-page">

        <span className="eyebrow">
          PLATFORM MANAGEMENT
        </span>

        <h1>
          Administrator <span>Dashboard</span>
        </h1>

        <p>
          Welcome, <strong>{user?.username}</strong>. Manage accounts,
          permissions, moderation, and platform activity.
        </p>


        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        {message && (
          <p className="success-message" role="status">
            {message}
          </p>
        )}


        {/* ADMIN STATISTICS */}

        <section className="admin-stat-grid">

          <article className="admin-stat-card">
            <span>Total Users</span>
            <strong>{users.length}</strong>
          </article>

          <article className="admin-stat-card">
            <span>Administrators</span>
            <strong>{totalAdmins}</strong>
          </article>

          <article className="admin-stat-card">
            <span>Normal Users</span>
            <strong>{users.length - totalAdmins}</strong>
          </article>

          <article className="admin-stat-card">
            <span>Banned Accounts</span>
            <strong>{totalBanned}</strong>
          </article>

        </section>


        {/* USER MANAGEMENT */}

        <section className="admin-section">

          <div className="section-heading">
            <div>
              <span className="eyebrow">
                ACCOUNT CONTROL
              </span>

              <h2>User Management</h2>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={() => void loadAdminData()}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>


          {/* USER SEARCH AND FILTERS */}

          <div className="admin-filter-bar">

            <input
              type="search"
              placeholder="Search username or email..."
              value={userSearch}
              onChange={(event) => {
                setUserSearch(event.target.value);
                setCurrentPage(1);
              }}
              aria-label="Search users"
            />

            <select
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter users by role"
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="user">Normal Users</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter users by account status"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>

          </div>


          {loading ? (
            <p className="empty-state">
              Loading registered users...
            </p>
          ) : users.length === 0 ? (
            <p className="empty-state">
              No registered users found.
            </p>
          ) : filteredUsers.length === 0 ? (
            <p className="empty-state">
              No users match your search or selected filters.
            </p>
          ) : (

            <>

              <div className="admin-table-wrapper">

                <table className="admin-table">

                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>


                  <tbody>

                    {paginatedUsers.map((item) => {

                      const isSelf = item.id === user?.id;
                      const isSaving = savingId === item.id;

                      return (
                        <tr key={item.id}>

                          <td>
                            <strong>{item.username}</strong>

                            {isSelf && (
                              <small className="admin-self-label">
                                (You)
                              </small>
                            )}
                          </td>


                          <td>{item.email}</td>


                          <td>
                            <span className={`admin-role ${item.role}`}>
                              {item.role}
                            </span>
                          </td>


                          <td>

                            <span
                              className={`admin-status ${
                                item.is_banned ? "banned" : "active"
                              }`}
                            >
                              {item.is_banned ? "Banned" : "Active"}
                            </span>

                            {item.is_banned && item.ban_reason && (
                              <small className="admin-ban-reason">
                                Reason: {item.ban_reason}
                              </small>
                            )}

                          </td>


                          <td>{formatDate(item.created_at)}</td>


                          <td>

                            <div className="admin-actions">

                              <button
                                type="button"
                                className="secondary-button"
                                disabled={isSelf || isSaving}
                                onClick={() => void changeRole(item)}
                              >
                                {isSaving
                                  ? "Please wait..."
                                  : item.role === "admin"
                                    ? "Make User"
                                    : "Make Admin"}
                              </button>


                              {item.is_banned ? (

                                <button
                                  type="button"
                                  className="secondary-button"
                                  disabled={isSaving}
                                  onClick={() => void unbanUser(item)}
                                >
                                  Unban
                                </button>

                              ) : (

                                <button
                                  type="button"
                                  className="delete-button"
                                  disabled={isSelf || isSaving}
                                  onClick={() => void banUser(item)}
                                >
                                  Ban
                                </button>

                              )}

                            </div>

                          </td>

                        </tr>
                      );
                    })}

                  </tbody>

                </table>

              </div>


              {/* USER PAGINATION */}

              <div className="admin-pagination">

                <span>
                  Showing{" "}
                  {filteredUsers.length === 0
                    ? 0
                    : (safePage - 1) * pageSize + 1}
                  {" – "}
                  {Math.min(safePage * pageSize, filteredUsers.length)}
                  {" of "}
                  {filteredUsers.length} users
                </span>

                <div>

                  <button
                    type="button"
                    className="secondary-button"
                    disabled={safePage <= 1}
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                  >
                    Previous
                  </button>

                  <span>
                    Page {safePage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    className="secondary-button"
                    disabled={safePage >= totalPages}
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(totalPages, page + 1)
                      )
                    }
                  >
                    Next
                  </button>

                </div>

              </div>

            </>
          )}

        </section>


        {/* ADMINISTRATIVE AUDIT LOGS */}

        <section className="admin-section">

          <div className="section-heading">

            <div>
              <span className="eyebrow">
                SECURITY AND MONITORING
              </span>

              <h2>Administrative Audit Logs</h2>
            </div>

            <span className="course-count">
              {filteredLogs.length} RECORDS
            </span>

          </div>


          {/* AUDIT LOG FILTER */}

          <div className="admin-filter-bar">

            <select
              value={logFilter}
              onChange={(event) => setLogFilter(event.target.value)}
              aria-label="Filter audit logs by action"
            >
              <option value="all">All Administrative Activity</option>
              <option value="user_banned">User Banned</option>
              <option value="user_unbanned">User Unbanned</option>
              <option value="user_role_changed">Role Changed</option>
            </select>

          </div>


          {loading ? (

            <p className="empty-state">
              Loading audit logs...
            </p>

          ) : filteredLogs.length === 0 ? (

            <p className="empty-state">
              No audit records match this filter.
            </p>

          ) : (

            <div className="audit-log-list">

              {filteredLogs.map((log, index) => (

                <article
                  className="audit-log-card"
                  key={String(log.id ?? index)}
                >

                  <div className="audit-log-heading">

                    <strong>
                      {String(
                        log.action ??
                        log.action_type ??
                        "Administrative activity"
                      )}
                    </strong>

                    <span>
                      {formatDate(log.created_at)}
                    </span>

                  </div>

                  <pre>
                    {JSON.stringify(log, null, 2)}
                  </pre>

                </article>

              ))}

            </div>

          )}

        </section>

      </main>
    </div>
  );
}
