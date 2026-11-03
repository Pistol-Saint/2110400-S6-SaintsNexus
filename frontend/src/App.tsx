
import { useEffect, useState, type FormEvent } from "react"

type Course = {
  id: number
  created_at: string
  title: string
  description: string | null
  price: number
}
const API = "https://2110400-saintsnexus-backend.vercel.app/api/courses"

export default function App() {
  const [courses, setCourses] = useState<Course[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("0")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  async function loadCourses() {
    setLoading(true)
    setError("")
    try {
      const response = await fetch(API)
      if (!response.ok) throw new Error("Could not load courses")
      const data: Course[] = await response.json()
      setCourses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCourses()
  }, [])

  function resetForm() {
    setTitle("")
    setDescription("")
    setPrice("0")
    setEditingId(null)
  }

  function editCourse(course: Course) {
    setEditingId(course.id)
    setTitle(course.title)
    setDescription(course.description ?? "")
    setPrice(String(course.price))
    setMessage("")
    setError("")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError("")
    setMessage("")

    const courseData = {
      title: title.trim(),
      description: description.trim() || null,
      price: Number(price),
    }

    try {
      const response = await fetch(
        editingId === null ? API : `${API}/${editingId}`,
        {
          method: editingId === null ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(courseData),
        }
      )

      if (!response.ok) {
        const details = await response.text()
        throw new Error(details || "Could not save course")
      }

      setMessage(editingId === null
        ? "Course created successfully!"
        : "Course updated successfully!"
      )

      resetForm()
      await loadCourses()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  async function deleteCourse(id: number) {
    if (!window.confirm("Are you sure you want to delete this course?")) {
      return
    }

    setError("")
    setMessage("")

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Could not delete course")

      setMessage("Course deleted successfully!")
      if (editingId === id) resetForm()
      await loadCourses()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">SN</div>
          <span>SAINTS <strong>NEXUS</strong></span>
        </div>
        <span className="topbar-label">E-LEARNING PLATFORM</span>
      </header>

      <main className="container">
        <section className="hero">
          <span className="eyebrow">LEARN. GROW. SUCCEED.</span>
          <h1>Knowledge for your <span>next chapter.</span></h1>
          <p>Explore courses, build new skills, and take your learning further with Saints Nexus.</p>
        </section>

        <section className="form-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">COURSE MANAGEMENT</span>
              <h2>{editingId === null ? "Add a new course" : "Update course"}</h2>
            </div>
            {editingId !== null && (
              <button className="secondary-button" onClick={resetForm}>
                Cancel editing
              </button>
            )}
          </div>

          <form className="course-form" onSubmit={handleSubmit}>
            <label>
              Course title
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Web Development"
                required
                minLength={1}
              />
            </label>

            <label>
              Description
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will students learn?"
                rows={3}
              />
            </label>

            <label>
              Price
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </label>

            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? "Saving..." : editingId === null ? "Create course" : "Save changes"}
            </button>
          </form>

          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
        </section>

        <section className="courses-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">EXPLORE THE CATALOG</span>
              <h2>Available courses</h2>
            </div>
            <span className="course-count">{courses.length} COURSES</span>
          </div>

          {loading ? (
            <p className="empty-state">Loading courses...</p>
          ) : courses.length === 0 ? (
            <p className="empty-state">No courses yet. Create your first course above!</p>
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
                    {course.description || "Explore this course and expand your knowledge."}
                  </p>
                  <div className="course-card-bottom">
                    <strong className="price">৳{Number(course.price).toLocaleString("en-BD")}</strong>
                    <div className="card-actions">
                      <button className="edit-button" onClick={() => editCourse(course)}>
                        Edit
                      </button>
                      <button className="delete-button" onClick={() => deleteCourse(course.id)}>
                        Delete
                      </button>
                    </div>
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
  )
}
