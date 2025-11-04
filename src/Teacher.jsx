import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./teacher.css";

const ASSIGNMENTS = [
  {
    title: "Essay on Climate Change",
    course: "Environmental Science",
    due: "2024-07-15",
    status: "Active"
  },
  {
    title: "Algebra Midterm Review",
    course: "Mathematics II",
    due: "2024-07-20",
    status: "Pending"
  },
  {
    title: "Research Paper Writing",
    course: "Academic English",
    due: "2024-07-25",
    status: "Active"
  },
  {
    title: "Capstone Project Proposal",
    course: "Computer Science IV",
    due: "2024-08-01",
    status: "Pending"
  },
  {
    title: "World History Presentation",
    course: "History 101",
    due: "2024-08-05",
    status: "Completed"
  }
];

const RECENT_ACTIVITY = [
  {text: "Sarah J. submitted review for 'Introduction to AI'", time: "2 hours ago"},
  {text: "Assignment 'Data Structures' marked as completed", time: "1 day ago"},
  {text: "New feedback on 'Research Paper Writing'", time: "3 days ago"},
  {text: "Michael C. submitted 'Group Project Proposal'", time: "4 days ago"}
];

function Teacher() {
  const navigate = useNavigate();
  
  const [assignments, setAssignments] = useState(ASSIGNMENTS);
  const [search, setSearch] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCourse, setNewCourse] = useState("");
  const [newDue, setNewDue] = useState("");

  const filteredAssignments = assignments.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.course.toLowerCase().includes(search.toLowerCase())
  );

  function handleCreateAssignment(e) {
    e.preventDefault();
    setAssignments([...assignments, {
      title: newTitle,
      course: newCourse,
      due: newDue,
      status: "Pending"
    }]);
    setShowCreate(false);
    setNewTitle(""); setNewCourse(""); setNewDue("");
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  }

  return (
    <div className="teacher-dashboard-bg">

      <header className="teacher-navbar">
        <div className="teacher-logo"> <span style={{color:"#6a7dd6"}}>PeerReview</span></div>
        <button className="teacher-logout-btn" onClick={handleLogout}>Logout</button>
      </header>

      <div className="teacher-layout">
        <nav className="teacher-sidebar">
          <div className="sidebar-item active">Teacher Dashboard</div>
          <div className="sidebar-item">Assignments</div>
          <div className="sidebar-subitem">All Assignments</div>
          <div className="sidebar-subitem" onClick={()=>setShowCreate(true)}>+ Create Assignment</div>
          <div className="sidebar-item">Feedback</div>
          <div className="sidebar-item">Settings</div>
        </nav>

        <div className="teacher-main">

          <section className="teacher-welcome">
            <h1>Teacher Dashboard</h1>
            <div className="teacher-welcome-row">
              <div>
                <b>Welcome, Teacher!</b>
                <p className="teacher-welcome-desc">
                  Here's an overview of your current assignments and activities on PeerReview.
                </p>
              </div>
              <button className="teacher-create-btn" onClick={()=>setShowCreate(true)}>
                + Create New Assignment
              </button>
            </div>
            <div className="teacher-overview-row">
              <div className="teacher-overview-card">
                <div>Active Assignments</div>
                <div className="teacher-ov-number">12</div>
                <div className="teacher-ov-green">+20.1% from last month</div>
              </div>
              <div className="teacher-overview-card">
                <div>Pending Reviews</div>
                <div className="teacher-ov-number">5</div>
                <div className="teacher-ov-red">-5.2% from last week</div>
              </div>
              <div className="teacher-overview-card">
                <div>Students Enrolled</div>
                <div className="teacher-ov-number">145</div>
                <div className="teacher-ov-green">+1.5% from last semester</div>
              </div>
            </div>
          </section>

          <section className="teacher-activity">
            <h3>Recent Activity</h3>
            <ul className="teacher-activity-list">
              {RECENT_ACTIVITY.map((r, idx) =>
                <li key={idx} className="teacher-activity-item">
                  <span className="teacher-activity-icon">📝</span>
                  <span>{r.text}</span>
                  <span className="teacher-activity-time">{r.time}</span>
                </li>
              )}
            </ul>
          </section>

          <section className="teacher-assignments">
            <h3>My Assignments</h3>
            <input
              type="search"
              className="teacher-search"
              placeholder="Search assignments..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <table className="teacher-table">
              <thead>
                <tr>
                  <th>Assignment Title</th>
                  <th>Course</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((a, idx) =>
                  <tr key={idx}>
                    <td>{a.title}</td>
                    <td>{a.course}</td>
                    <td>{a.due}</td>
                    <td>
                      <span className={`assignment-status ${a.status.toLowerCase()}`}>
                        {a.status}
                      </span>
                    </td>
                    <td>
                      <button className="teacher-view-btn">
                        View
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="teacher-table-footer">
              <button className="teacher-pagination-btn">« Previous</button>
              <button className="teacher-pagination-btn">Next »</button>
            </div>
          </section>
        </div>
      </div>

      {showCreate && (
        <div className="teacher-modal-bg">
          <form className="teacher-modal" onSubmit={handleCreateAssignment}>
            <h2>Create Assignment</h2>
            <label>Title</label>
            <input value={newTitle} onChange={e=>setNewTitle(e.target.value)} required />
            <label>Course</label>
            <input value={newCourse} onChange={e=>setNewCourse(e.target.value)} required />
            <label>Due Date</label>
            <input type="date" value={newDue} onChange={e=>setNewDue(e.target.value)} required />
            <div className="teacher-modal-actions">
              <button type="submit">Create</button>
              <button type="button" onClick={()=>setShowCreate(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Teacher;
