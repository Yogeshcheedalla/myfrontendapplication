import React, { useState, useEffect } from "react";
import "./Teacher.css";

const Teacher = () => {
  const [assignments, setAssignments] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [userName, setUserName] = useState("Teacher");

  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    date: "",
    hour: "12",
    minute: "00",
    period: "AM",
    maxScore: 100,
  });

  const token = localStorage.getItem("token");

  const loadAssignments = async () => {
    try {
      const res = await fetch("http://localhost:5001/assignments", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        console.log("Assignments load error:", data);
        return;
      }

      setAssignments(data);
    } catch (err) {
      console.log("Load assignments error:", err);
    }
  };

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) setUserName(storedName);
    loadAssignments();
  }, []);

  const handleCreateAssignment = async () => {
    if (!newAssignment.title || !newAssignment.date) {
      alert("Title & Date are required!");
      return;
    }

    // Construct Date
    let hour = parseInt(newAssignment.hour);
    if (newAssignment.period === "PM" && hour !== 12) hour += 12;
    if (newAssignment.period === "AM" && hour === 12) hour = 0;

    const deadlineDate = new Date(newAssignment.date);
    deadlineDate.setHours(hour);
    deadlineDate.setMinutes(parseInt(newAssignment.minute));

    try {
      const res = await fetch("http://localhost:5001/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newAssignment.title,
          description: newAssignment.description,
          deadline: deadlineDate.toISOString(),
          maxScore: newAssignment.maxScore,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert("Error creating assignment");
        return;
      }

      loadAssignments();
      setShowCreateForm(false);

      setNewAssignment({
        title: "",
        description: "",
        date: "",
        hour: "12",
        minute: "00",
        period: "AM",
        maxScore: 100,
      });
    } catch (err) {
      console.log("Create error:", err);
    }
  };

  const loadSubmissions = async (assignmentId) => {
    try {
      const res = await fetch(
        `http://localhost:5001/assignments/${assignmentId}/submissions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.log("Submission load error:", data);
        return;
      }

      // Update assignment with submissions
      setAssignments((prev) =>
        prev.map((a) =>
          a._id === assignmentId ? { ...a, submissions: data } : a
        )
      );
    } catch (err) {
      console.log("Load submission error:", err);
    }
  };

  const [gradeInputs, setGradeInputs] = useState({});

  const handleGradeSubmission = async (submissionId, assignmentId) => {
    const score = gradeInputs[submissionId];
    if (score === undefined || score === "") {
      alert("Please enter a score");
      return;
    }

    try {
      await fetch(`http://localhost:5001/submissions/${submissionId}/grade`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ grade: Number(score) }),
      });

      alert("Grade saved!");
      loadSubmissions(assignmentId);
    } catch (err) {
      console.log("Grade error:", err);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="teacher-dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M7 8h10M7 12h6" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <div className="header-title">
            <h1>Teacher Dashboard</h1>
            <p>Welcome, {userName}</p>
          </div>
        </div>
        <button
          className="sign-out-btn"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}
        >
          Log Out
        </button>
      </header>

      <main className="dashboard-main">
        <div className="assignments-section">
          <div className="section-header">
            <h2>My Assignments</h2>
            <button className="create-assignment-btn" onClick={() => setShowCreateForm(true)}>
              + Create Assignment
            </button>
          </div>

          <div className="assignments-list">
            {assignments.map((assignment) => (
              <div key={assignment._id} className="assignment-card">
                <div className="assignment-header">
                  <div className="assignment-info">
                    <h3>{assignment.title}</h3>
                    {assignment.description && <p className="assignment-description">{assignment.description}</p>}
                    <p className="due-date">Due: {formatDate(assignment.deadline)}</p>
                  </div>
                  <div className="assignment-meta">
                    <span className="max-score">Max Score: {assignment.maxScore}</span>
                    <button
                      className="grade-btn"
                      onClick={() => {
                        const isOpen = selectedAssignment === assignment._id;
                        setSelectedAssignment(isOpen ? null : assignment._id);
                        if (!isOpen) loadSubmissions(assignment._id);
                      }}
                    >
                      {selectedAssignment === assignment._id ? "Hide Submissions" : "View Submissions"}
                    </button>
                  </div>
                </div>

                {selectedAssignment === assignment._id && (
                  <div className="submissions-section">
                    <h4>Student Submissions</h4>
                    {!assignment.submissions || assignment.submissions.length === 0 ? (
                      <p className="no-submissions">No submissions yet</p>
                    ) : (
                      <div className="submissions-list">
                        {assignment.submissions.map((submission) => (
                          <div key={submission._id} className="submission-item">
                            <div className="student-info">
                              <span className="student-name">{submission.student?.name || "Unknown"}</span>
                              <span className="submission-status">Submitted</span>
                            </div>
                            {submission.text && (
                              <div className="submission-answer-box">
                                <strong>Answer:</strong>
                                <p>{submission.text}</p>
                              </div>
                            )}
                            <div className="grading-section">
                              {submission.grade != null ? (
                                <span className="current-score">
                                  Score: {submission.grade}/{assignment.maxScore}
                                </span>
                              ) : (
                                <span className="ungraded">Ungraded</span>
                              )}
                              <div className="grade-input-group">
                                <input
                                  type="number"
                                  min="0"
                                  max={assignment.maxScore}
                                  placeholder="Score"
                                  className="score-input"
                                  value={gradeInputs[submission._id] || ""}
                                  onChange={(e) =>
                                    setGradeInputs({
                                      ...gradeInputs,
                                      [submission._id]: e.target.value,
                                    })
                                  }
                                />
                                <button
                                  className="submit-grade-btn"
                                  onClick={() => handleGradeSubmission(submission._id, assignment._id)}
                                >
                                  Submit
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {showCreateForm && (
        <div className="modal-overlay">
          <div className="create-assignment-modal">
            <div className="modal-header">
              <h3>Create New Assignment</h3>
              <button className="close-btn" onClick={() => setShowCreateForm(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Assignment Title</label>
                <input
                  type="text"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <div className="time-inputs">
                  <input
                    type="date"
                    value={newAssignment.date}
                    onChange={(e) => setNewAssignment({ ...newAssignment, date: e.target.value })}
                    style={{ flex: 2 }}
                  />
                  <input
                    type="number"
                    min="1"
                    max="12"
                    placeholder="HH"
                    value={newAssignment.hour}
                    onChange={(e) => setNewAssignment({ ...newAssignment, hour: e.target.value })}
                    style={{ flex: 1 }}
                  />
                  <span className="time-separator">:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="MM"
                    value={newAssignment.minute}
                    onChange={(e) => setNewAssignment({ ...newAssignment, minute: e.target.value })}
                    style={{ flex: 1 }}
                  />
                  <select
                    value={newAssignment.period}
                    onChange={(e) => setNewAssignment({ ...newAssignment, period: e.target.value })}
                    style={{ flex: 1 }}
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Max Score</label>
                <input
                  type="number"
                  min="1"
                  value={newAssignment.maxScore}
                  onChange={(e) => setNewAssignment({ ...newAssignment, maxScore: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowCreateForm(false)}>Cancel</button>
              <button className="create-btn" onClick={handleCreateAssignment}>Create Assignment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teacher;