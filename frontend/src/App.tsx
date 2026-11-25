
import { useEffect, useState, type FormEvent } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { apiRequest } from "./services/api";

import Login from "./pages/Login";
import Register from "./pages/Register";
import {
  Dashboard,
  Profile,
  AdminDashboard,
} from "./pages/BasicPages";

type Course = {
  id: number;
  created_at: string;
  title: string;
  description: string | null;
  price: number;
};

function CoursesPage() {
  const { isAdmin } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadCourses() {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest<Course[]>("/api/courses");
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load courses.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCourses();
  }, []);

  function resetForm() {
    setTitle("");
    setDescription("");
    setPrice("0");
    setEditingId(null);
  }

  function editCourse(course: Course) {
    setEditingId(course.id);
    setTitle(course.title);
    setDescription(course.description ?? "");
    setPrice(String(course.price));
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isAdmin) return;

    setSaving(true);
    setError("");
    setMessage("");

    const courseData = {
      title: title.trim(),
      description: description.trim() || null,
      price: Number(price),
    };

    try {
      await apiRequest<Course>(
        editingId === null
          ? "/api/courses"
          : `/api/courses/${editingId}`,
        {
          method: editingId === null ? "POST" : "PUT",
          body: JSON.stringify(courseData),
        },
        true
      );

      setMessage(
        editingId === null
          ? "Course created successfully!"
          : "Course updated successfully!"
      );

      resetForm();
      await loadCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save course.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCourse(id: number) {
    if (!isAdmin) return;

    if (!window.confirm("Are you sure you want to delete this course?")) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await apiRequest(
        `/api/courses/${id}`,
        { method: "DELETE" },
        true
      );

      setMessage("Course deleted successfully!");

      if (editingId === id) resetForm();

      await loadCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete course.");
    }
  }

  return (
    <div className="app">
      <Navbar />

      <main className="container">
        <section className="hero">
          <span className="eyebrow">LEARN. GROW. SUCCEED.</span>
          <h1>
            Knowledge for your <span>next chapter.</span>
          </h1>
          <p>
            Explore courses, build new skills, and take your learning
            further with Saints Nexus.
          </p>
        </section>

        {isAdmin && (
          <section className="form-section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">ADMINISTRATOR TOOLS</span>
                <h2>{editingId === null ? "Add a new course" : "Update course"}</h2>
              </div>

              {editingId !== null && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={resetForm}
                >
                  Cancel editing
                </button>
              )}
            </div>

            <form className="course-form" onSubmit={handleSubmit}>
              <label>
                Course title
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Web Development"
                  required
                  minLength={1}
                />
              </label>

              <label>
                Description
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="What will students learn?"
                  rows={3}
                />
              </label>

              <label>
                Price (BDT)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  required
                />
              </label>

              <button className="primary-button" type="submit" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingId === null
                    ? "Create course"
                    : "Save changes"}
              </button>
            </form>

            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
          </section>
        )}

        {!isAdmin && error && (
          <p className="error-message">{error}</p>
        )}

        <section className="courses-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">EXPLORE THE CATALOG</span>
              <h2>Available courses</h2>
            </div>

            <span className="course-count">
              {courses.length} COURSES
            </span>
          </div>

          {loading ? (
            <p className="empty-state">Loading courses...</p>
          ) : courses.length === 0 ? (
            <p className="empty-state">
              No courses are available yet. Check back soon!
            </p>
          ) : (
            <div className="course-grid">
              {courses.map((course) => (
                <article className="course-card" key={course.id}>
                  <div className="course-card-top">
                    <span className="course-tag">SAINTS NEXUS</span>
                    <span className="course-id">#{course.id}</span>
                  </div>

                  <h3>{course.title}</h3>

                  <p className="course-description">
                    {course.description ||
                      "Explore this course and expand your knowledge."}
                  </p>

                  <div className="course-card-bottom">
                    <strong className="price">
                      ৳{Number(course.price).toLocaleString("en-BD")}
                    </strong>

                    {isAdmin && (
                      <div className="card-actions">
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() => editCourse(course)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => deleteCourse(course.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer>
        © {new Date().getFullYear()} Saints Nexus. All rights reserved.
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CoursesPage />} />
      <Route path="/courses" element={<CoursesPage />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route element={<ProtectedRoute adminOnly />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
