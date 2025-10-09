import React, { useState } from "react";

export default function Teacher() {
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: "Peer Review 1",
      course: "AI 101",
      status: "Active",
      due: "2025-10-15",
      desc: "AI course peer review round 1",
    },
    {
      id: 2,
      title: "Peer Review 2",
      course: "ML 201",
      status: "Completed",
      due: "2025-09-30",
      desc: "Machine Learning peer review round 2",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCourse, setNewCourse] = useState("");
  const [newDue, setNewDue] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newStatus, setNewStatus] = useState("Active");
  const [search, setSearch] = useState("");

  // create assignment
  const handleCreateAssignment = (e) => {
    e.preventDefault();
    if (!newTitle || !newCourse || !newDue) return;

    const newAssignment = {
      id: assignments.length + 1,
      title: newTitle,
      course: newCourse,
      status: newStatus,
      due: newDue,
      desc: newDesc,
    };

    // add assignment to top
    setAssignments((prev) => [newAssignment, ...prev]);

    // reset form
    setNewTitle("");
    setNewCourse("");
    setNewDue("");
    setNewDesc("");
    setNewStatus("Active");
    setShowModal(false);
  };

  // filter search
  const filteredAssignments = assignments.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  const activeAssignments = assignments.filter((a) => a.status === "Active");
  const completedAssignments = assignments.filter(
    (a) => a.status === "Completed"
  );

  return (
    <div className="teacher-page">
      {/* Header */}
      <header className="teacher-header">
        <div className="logo">PeerReview Teacher</div>
        <button className="logout-btn">Logout</button>
      </header>

      {/* Layout */}
      <div className="teacher-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-title">Menu</div>
          <div className="sidebar-create" onClick={() => setShowModal(true)}>
            + Create Assignment
          </div>
          <div className="sidebar-item">All Assignments</div>
          <div className="sidebar-item">Active</div>
          <div className="sidebar-item">Completed</div>
        </aside>

        {/* Main content */}
        <main className="teacher-main">
          {/* Overview */}
          <div className="overview">
            <h1>Assignments Overview</h1>
            <p>Manage all assignments and monitor progress easily.</p>

            <button className="create-btn" onClick={() => setShowModal(true)}>
              + Create
            </button>

            <div className="stats-grid">
              <div className="stat-box">
                <h3>Active</h3>
                <div className="stat-num">{activeAssignments.length}</div>
                <div className="positive">Currently ongoing</div>
              </div>
              <div className="stat-box">
                <h3>Completed</h3>
                <div className="stat-num">{completedAssignments.length}</div>
                <div className="negative">Closed submissions</div>
              </div>
            </div>
          </div>

          {/* Assignments */}
          <div className="assignments">
            <h2>📘 All Assignments</h2>
            <input
              type="text"
              placeholder="Search assignments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {filteredAssignments.length === 0 ? (
              <p>No assignments found.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Course</th>
                    <th>Status</th>
                    <th>Due</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map((a) => (
                    <tr key={a.id}>
                      <td>{a.title}</td>
                      <td>{a.course}</td>
                      <td>
                        <span
                          className={`status ${
                            a.status === "Active"
                              ? "active"
                              : a.status === "Completed"
                              ? "completed"
                              : "pending"
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td>{a.due}</td>
                      <td>{a.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Active assignments */}
          <div className="assignments" style={{ marginTop: "1.5rem" }}>
            <h2>🟢 Active Assignments</h2>
            {activeAssignments.length === 0 ? (
              <p>No active assignments yet.</p>
            ) : (
              <ul>
                {activeAssignments.map((a) => (
                  <li key={a.id}>
                    {a.title} — due <strong>{a.due}</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Completed assignments */}
          <div className="assignments" style={{ marginTop: "1.5rem" }}>
            <h2>🔴 Completed Assignments</h2>
            {completedAssignments.length === 0 ? (
              <p>No completed assignments yet.</p>
            ) : (
              <ul>
                {completedAssignments.map((a) => (
                  <li key={a.id}>
                    {a.title} — completed on <strong>{a.due}</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create Assignment</h2>
            <form onSubmit={handleCreateAssignment}>
              <input
                type="text"
                placeholder="Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Course"
                value={newCourse}
                onChange={(e) => setNewCourse(e.target.value)}
                required
              />
              <input
                type="date"
                value={newDue}
                onChange={(e) => setNewDue(e.target.value)}
                required
              />
              <textarea
                placeholder="Description"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="confirm">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
