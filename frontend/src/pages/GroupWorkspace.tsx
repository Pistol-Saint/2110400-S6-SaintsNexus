import { useCallback, useEffect, useState, type FormEvent } from "react";
import Navbar from "../components/Navbar";
import { apiRequest } from "../services/api";
import "./GroupWorkspace.css";

interface Permissions {
  owner: boolean;
  create: boolean;
  update: boolean;
  assign: boolean;
  view: boolean;
}

interface GroupMember {
  id: string;
  username: string;
  is_owner: boolean;
  permissions: Omit<Permissions, "owner">;
}

interface ProjectGroup {
  id: string;
  name: string;
  project_name: string;
  owner_id: string;
  created_at: string;
  my_permissions: Permissions;
  members: GroupMember[];
}

interface GroupResource {
  id: string;
  group_id: string;
  title: string;
  description: string | null;
  created_by: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

const GROUP_URL = "/api/groups/project-avengers";
const RESOURCE_URL = `${GROUP_URL}/resources`;

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function GroupWorkspace() {
  const [group, setGroup] = useState<ProjectGroup | null>(null);
  const [resources, setResources] = useState<GroupResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<Record<string, string>>({});

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [groupData, resourceData] = await Promise.all([
        apiRequest<ProjectGroup>(GROUP_URL, {}, true),
        apiRequest<GroupResource[]>(RESOURCE_URL, {}, true),
      ]);

      setGroup(groupData);
      setResources(resourceData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load the project workspace."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  const permissions = group?.my_permissions;
  const canCreate = Boolean(permissions?.owner || permissions?.create);
  const canUpdate = Boolean(permissions?.owner || permissions?.update);
  const canAssign = Boolean(permissions?.owner || permissions?.assign);

  function resetForm() {
    setTitle("");
    setDescription("");
    setEditingId(null);
  }

  function startEditing(resource: GroupResource) {
    setEditingId(resource.id);
    setTitle(resource.title);
    setDescription(resource.description ?? "");
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingId ? !canUpdate : !canCreate) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const body = {
        title: title.trim(),
        description: description.trim() || null,
      };

      if (editingId) {
        await apiRequest<GroupResource>(
          `${RESOURCE_URL}/${editingId}`,
          {
            method: "PUT",
            body: JSON.stringify(body),
          },
          true
        );
        setMessage("Project resource updated successfully.");
      } else {
        await apiRequest<GroupResource>(
          RESOURCE_URL,
          {
            method: "POST",
            body: JSON.stringify(body),
          },
          true
        );
        setMessage("Project resource created successfully.");
      }

      resetForm();
      await loadWorkspace();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save the resource."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleAssignment(resourceId: string) {
    if (!canAssign) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await apiRequest<GroupResource>(
        `${RESOURCE_URL}/${resourceId}/assign`,
        {
          method: "PATCH",
          body: JSON.stringify({
            assigned_to: assignment[resourceId] || null,
          }),
        },
        true
      );

      setMessage("Resource assignment updated successfully.");
      await loadWorkspace();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to assign the resource."
      );
    } finally {
      setSaving(false);
    }
  }

  function memberName(userId: string | null) {
    if (!userId) return "Unassigned";
    return group?.members.find((member) => member.id === userId)?.username
      ?? "Unknown member";
  }

  return (
    <div className="app">
      <Navbar />

      <main className="container basic-page group-workspace">
        <section className="group-hero">
          <span className="eyebrow">TEAM COLLABORATION</span>
          <h1>
            PROJECT <span>AVENGERS</span>
          </h1>
          <p>Saints Nexus project workspace and resource management.</p>
        </section>

        {loading ? (
          <p className="empty-state">Loading PROJECT AVENGERS workspace...</p>
        ) : error && !group ? (
          <section className="group-panel">
            <h2>Workspace unavailable</h2>
            <p className="error-message" role="alert">{error}</p>
            <button className="secondary-button" onClick={() => void loadWorkspace()}>
              Try again
            </button>
          </section>
        ) : group ? (
          <>
            {error && <p className="error-message" role="alert">{error}</p>}
            {message && <p className="success-message" role="status">{message}</p>}

            <section className="group-panel">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">PROJECT OVERVIEW</span>
                  <h2>{group.project_name}</h2>
                </div>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => void loadWorkspace()}
                  disabled={loading || saving}
                >
                  Refresh
                </button>
              </div>

              <p>
                <strong>Group:</strong> {group.name}
              </p>
              <p>
                <strong>Your access:</strong>{" "}
                {permissions?.owner ? "Owner" : "Group Member"}
              </p>

              <div className="group-permission-list">
                {(["create", "update", "assign", "view"] as const).map((key) => (
                  <span
                    key={key}
                    className={`group-permission ${permissions?.[key] ? "allowed" : "denied"}`}
                  >
                    {key.toUpperCase()}: {permissions?.[key] ? "Allowed" : "Not allowed"}
                  </span>
                ))}
              </div>
            </section>

            <section className="group-panel">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">THE TEAM</span>
                  <h2>Group Members</h2>
                </div>
                <span className="course-count">{group.members.length} MEMBERS</span>
              </div>

              <div className="group-member-grid">
                {group.members.map((member) => (
                  <article className="group-member-card" key={member.id}>
                    <h3>{member.username}</h3>
                    <span className="group-member-role">
                      {member.is_owner ? "Group Owner" : "Member"}
                    </span>
                    <div className="group-member-permissions">
                      {(["create", "update", "assign", "view"] as const).map((key) => (
                        <span key={key}>
                          {key}: {member.permissions[key] ? "Yes" : "No"}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {(editingId ? canUpdate : canCreate) && (
              <section className="group-panel">
                <span className="eyebrow">RESOURCE MANAGEMENT</span>
                <h2>{editingId ? "Update Resource" : "Create a Resource"}</h2>

                <form className="group-resource-form" onSubmit={handleSubmit}>
                  <label>
                    Resource title
                    <input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      maxLength={200}
                      required
                      placeholder="Enter a task or resource title"
                    />
                  </label>

                  <label>
                    Description
                    <textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      rows={3}
                      placeholder="Describe this resource..."
                    />
                  </label>

                  <div className="group-form-actions">
                    <button className="primary-button" type="submit" disabled={saving}>
                      {saving ? "Saving..." : editingId ? "Save Changes" : "Create Resource"}
                    </button>
                    {editingId && (
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={resetForm}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </section>
            )}

            <section className="group-panel">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">SHARED WORK</span>
                  <h2>Project Resources</h2>
                </div>
                <span className="course-count">{resources.length} RESOURCES</span>
              </div>

              {resources.length === 0 ? (
                <p className="empty-state">No project resources have been created yet.</p>
              ) : (
                <div className="group-resource-list">
                  {resources.map((resource) => (
                    <article className="group-resource-card" key={resource.id}>
                      <div className="group-resource-heading">
                        <h3>{resource.title}</h3>
                        <span className="group-resource-status">
                          {resource.assigned_to ? "Assigned" : "Unassigned"}
                        </span>
                      </div>

                      <p>{resource.description || "No description provided."}</p>

                      <div className="group-resource-meta">
                        <span>Assigned to: <strong>{memberName(resource.assigned_to)}</strong></span>
                        <span>Created: {formatDate(resource.created_at)}</span>
                      </div>

                      <div className="group-resource-actions">
                        {canUpdate && (
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => startEditing(resource)}
                            disabled={saving}
                          >
                            Edit Resource
                          </button>
                        )}

                        {canAssign && (
                          <div className="group-assignment-control">
                            <select
                              aria-label={`Assign ${resource.title}`}
                              value={
                                assignment[resource.id] ??
                                resource.assigned_to ??
                                ""
                              }
                              onChange={(event) =>
                                setAssignment((current) => ({
                                  ...current,
                                  [resource.id]: event.target.value,
                                }))
                              }
                            >
                              <option value="">Unassigned</option>
                              {group.members.map((member) => (
                                <option key={member.id} value={member.id}>
                                  {member.username}
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              className="primary-button"
                              onClick={() => void handleAssignment(resource.id)}
                              disabled={saving}
                            >
                              Assign
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
