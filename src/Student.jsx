import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Student.css";
import { projects } from "./projects";

const Student = () => {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [userName, setUserName] = useState("");

  // Modal controls
  const [showModal, setShowModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [answerText, setAnswerText] = useState("");

  // Project Modal controls
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showCollaborateModal, setShowCollaborateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isTeamFull, setIsTeamFull] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [userId, setUserId] = useState("");

  // Fetch team for a project
  const fetchTeam = async (projectId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5001/projects/${projectId}/team`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        const members = data.members || [];
        setTeamMembers(members);
        setIsTeamFull(members.length >= 3);

        // We use the userId state we set on mount
        setIsMember(members.some(m => m._id === userId));
      }
    } catch (err) {
      console.error("Error fetching team:", err);
      // Only alert if it's a network error to avoid spamming on load
      if (err.message.includes("Failed to fetch")) {
        alert("Cannot connect to server. Please ensure the backend is running on port 5000.");
      }
    }
  };

  // Join Team
  const handleJoinTeam = async () => {
    try {
      console.log("Joining team for project:", selectedProject?.id);
      const token = localStorage.getItem("token");

      if (!token) {
        alert("You are not logged in. Please sign out and sign in again.");
        return;
      }

      const res = await fetch(`http://localhost:5001/projects/${selectedProject.id}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.log("Join response:", data);

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("Joined team successfully!");
      fetchTeam(selectedProject.id); // Refresh team list
      setIsMember(true); // Optimistic update
    } catch (err) {
      console.error("Error joining team:", err);
      alert("Failed to join team. Please check if the backend server is running. Error: " + err.message);
    }
  };

  // Fetch assignments for student
  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5001/student/assignments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Error loading assignments:", data);
        return;
      }

      setAssignments(
        data.map((a) => ({
          id: a._id,
          title: a.title,
          description: a.description,
          dueDate: new Date(a.deadline).toLocaleString(),
          maxScore: a.maxScore || 100,
          submitted: false,
          facultyName: a.createdBy?.name || "Unknown Faculty",
        }))
      );
    } catch (err) {
      console.error("Error fetching assignments:", err);
    }
  };

  // Fetch student's submitted work
  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5001/student/submissions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const subs = await res.json();
      if (!res.ok) return;

      setAssignments((prev) =>
        prev.map((a) => {
          // Find ALL submissions for this assignment
          const assignmentSubmissions = subs.filter(
            (s) => s.assignment._id === a.id
          );

          // Sort by date desc to get latest
          assignmentSubmissions.sort(
            (x, y) => new Date(y.submittedAt) - new Date(x.submittedAt)
          );

          // Latest ACTIVE submission (not removed)
          const latestActiveSubmission = assignmentSubmissions.find(
            (s) => s.status !== "removed"
          );

          const submissionCount = assignmentSubmissions.length;

          if (latestActiveSubmission) {
            console.log(`Assignment ${a.title}: Grade = ${latestActiveSubmission.grade}`);
          }

          return {
            ...a,
            submitted: !!latestActiveSubmission,
            submissionData: latestActiveSubmission || null,
            submissionCount, 
          };
        })
      );
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  };

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "Student");

    // Get user ID from localStorage
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserId(user._id || user.id);
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }

    fetchAssignments();
  }, []);

  useEffect(() => {
    if (assignments.length > 0) {
      fetchSubmissions();
    }
  }, [assignments.length]); 
  const openSubmissionModal = (assignment) => {
    setSelectedAssignment(assignment);
    setAnswerText("");
    setShowModal(true);
  };

  // Submit assignment
  const handleSubmitAssignment = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5001/assignments/${selectedAssignment.id}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            text: answerText,
            fileUrl: "",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error submitting assignment");
        return;
      }

      // mark submitted & increment count locally (or re-fetch)
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === selectedAssignment.id
            ? {
              ...a,
              submitted: true,
              submissionCount: (a.submissionCount || 0) + 1,
            }
            : a
        )
      );

      setShowModal(false);
      alert("Assignment submitted successfully!");
      fetchSubmissions(); // Refresh to get new state
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const handleRemoveSubmission = async (assignment) => {
    if (assignment.submissionCount >= 3) {
      alert("Max limit reached. You cannot resubmit again.");
      return;
    }

    if (!window.confirm("Are you sure you want to remove this submission? It will still count as an attempt.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5001/submissions/${assignment.submissionData._id}/remove`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Error removing submission");
        return;
      }

      alert("Submission removed. You can now submit again.");
      fetchSubmissions(); // Refresh UI
    } catch (err) {
      console.error("Remove error:", err);
    }
  };

  const handlePeerReview = (assignmentId) => {
    navigate(`/peer-review/${assignmentId}`);
  };

  const handleSignOut = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="student-dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <div className="dashboard-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
          <div className="dashboard-title">
            <h1>Student Dashboard</h1>
            <p>Welcome, {userName}</p>
          </div>
        </div>

        <div className="header-right">
          <button className="project-btn" onClick={() => setShowProjectModal(true)}>
            Projects
          </button>
          <button className="sign-out-btn" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="assignments-section">
          <h2>Available Assignments</h2>

          <div className="assignments-list">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="assignment-card">
                <div className="assignment-header">
                  <div>
                    <h3 className="assignment-title">{assignment.title}</h3>
                    <span style={{ fontSize: "0.85rem", color: "#6c757d" }}>
                      Faculty: {assignment.facultyName}
                    </span>
                  </div>

                  {assignment.submitted && (
                    <span className="submitted-badge">Submitted</span>
                  )}
                </div>

                <p className="assignment-description">{assignment.description}</p>

                <div className="assignment-meta">
                  <span className="due-date">Due: {assignment.dueDate}</span>
                  <span className="max-score">Max Score: {assignment.maxScore}</span>
                </div>

                {/* Show teacher grade if available */}
                {assignment.submitted && assignment.submissionData?.grade != null && (
                  <div className="grade-section">
                    <strong>Teacher Grade:</strong> {assignment.submissionData.grade}/{assignment.maxScore}
                  </div>
                )}

                {/* Show peer reviews if available */}
                {assignment.submitted && assignment.submissionData?.peerReviews?.length > 0 && (
                  <div className="peer-reviews-section">
                    <strong>Peer Reviews:</strong>
                    {assignment.submissionData.peerReviews.map((review, idx) => (
                      <div key={idx} className="peer-review-item">
                        <div className="review-header">
                          <span className="reviewer-name">{review.author?.name || "Anonymous"}</span>
                          <span className="review-score">Score: {review.score}/{assignment.maxScore}</span>
                        </div>
                        {review.comment && (
                          <p className="review-comment">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="assignment-actions">
                  {!assignment.submitted ? (
                    assignment.submissionCount < 3 ? (
                      <button
                        className="submit-btn"
                        onClick={() => openSubmissionModal(assignment)}
                      >
                        Submit Assignment
                      </button>
                    ) : (
                      <span className="max-attempts-msg" style={{ color: "red" }}>
                        Max attempts reached
                      </span>
                    )
                  ) : (
                    <>
                      <div className="submission-status">
                        <button className="submitted-btn" disabled>
                          Submitted
                        </button>
                        <span className="attempts-info">
                          Attempts: {assignment.submissionCount || 0}/3
                        </span>
                      </div>

                      {assignment.submissionData?.grade == null ? (
                        <button
                          className="resubmit-btn"
                          style={{ marginLeft: "10px", backgroundColor: "#ff9800" }}
                          onClick={() => handleRemoveSubmission(assignment)}
                        >
                          Remove & Resubmit
                        </button>
                      ) : (
                        <span className="max-attempts-msg" style={{ marginLeft: "10px", color: "red" }}>
                          Graded - No Resubmission
                        </span>
                      )}

                      <button
                        className="peer-review-btn"
                        onClick={() => handlePeerReview(assignment.id)}
                        disabled={new Date() < new Date(assignment.dueDate)}
                        title={new Date() < new Date(assignment.dueDate) ? "Available after deadline" : "Review Peers"}
                        style={new Date() < new Date(assignment.dueDate) ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                      >
                        Review Peers
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>{selectedAssignment.title}</h3>
              <span className="modal-close" onClick={() => setShowModal(false)}>
                ✕
              </span>
            </div>

            <p className="modal-subtitle">Your Submission</p>

            <textarea
              className="modal-textarea"
              placeholder="Write your assignment here..."
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
            />

            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="modal-submit" onClick={handleSubmitAssignment}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {showProjectModal && (
        <div className="modal-overlay">
          <div className="modal-box project-modal-box">
            <div className="modal-header">
              <h3>Available Projects</h3>
              <span className="modal-close" onClick={() => setShowProjectModal(false)}>
                ✕
              </span>
            </div>
            <div className="projects-list">
              {projects.map((project) => (
                <div key={project.id} className="project-item">
                  <div className="project-info">
                    <h4>{project.title}</h4>
                    <p>{project.description}</p>
                  </div>
                  <button
                    className="collaborate-btn"
                    onClick={() => {
                      setSelectedProject(project);
                      fetchTeam(project.id);
                      setShowProjectModal(false);
                      setShowCollaborateModal(true);
                    }}
                  >
                    Collaborate
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showCollaborateModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Team for {selectedProject?.title}</h3>
              <span
                className="modal-close"
                onClick={() => {
                  setShowCollaborateModal(false);
                  // Do not re-open project modal, just close everything
                }}
              >
                ✕
              </span>
            </div>

            <div className="team-status-section">
              <h4>Current Team Members ({teamMembers.length}/3)</h4>
              {teamMembers.length > 0 ? (
                <ul className="team-members-list">
                  {teamMembers.map((member, idx) => (
                    <li key={idx}>{member.name} ({member.email})</li>
                  ))}
                </ul>
              ) : (
                <p>No members yet. Be the first to join!</p>
              )}
            </div>

            <div className="modal-actions">
              <button
                className="modal-cancel"
                onClick={() => {
                  setShowCollaborateModal(false);
                  setShowProjectModal(true);
                }}
              >
                Back
              </button>

              {!isMember && !isTeamFull && (
                <button
                  className="modal-submit"
                  onClick={handleJoinTeam}
                >
                  Join Team
                </button>
              )}

              {isMember && (
                <span className="status-msg success">You have joined this team.</span>
              )}

              {!isMember && isTeamFull && (
                <span className="status-msg error">Max limit reached. Cannot join.</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Student;