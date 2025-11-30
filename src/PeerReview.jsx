import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./PeerReview.css";

const PeerReview = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [currentSubmission, setCurrentSubmission] = useState(0);
  const [reviews, setReviews] = useState({});

  const token = localStorage.getItem("token");

  let currentUserId = null;
  try {
    if (token) {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      currentUserId = decoded.id; 
    }
  } catch (e) {
    console.error("Token decode failed:", e);
  }

  const fetchSubmissions = async () => {
    try {
      const res = await fetch(
        `http://localhost:5001/assignments/${assignmentId}/submissions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403) {
          alert(data.message || "Access denied");
          navigate("/student");
          return;
        }
        console.error("Failed to load submissions:", data);
        return;
      }

      const filtered = data.filter(
        (s) => s.student?._id !== currentUserId
      );

      const formatted = filtered.map((s) => ({
        id: s._id,
        studentName: s.student?.name || "Unknown Student",
        submissionText: s.text || "(No text provided)",
        submittedAt: new Date(s.submittedAt).toLocaleString(),
      }));

      setSubmissions(formatted);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [assignmentId]);

  const handleScoreChange = (id, score) => {
    setReviews((prev) => ({
      ...prev,
      [id]: { ...prev[id], score },
    }));
  };

  const handleCommentChange = (id, comment) => {
    setReviews((prev) => ({
      ...prev,
      [id]: { ...prev[id], comment },
    }));
  };

  const handleSubmitReview = async (id) => {
    const review = reviews[id];

    if (!review?.score || !review?.comment) {
      alert("Please provide both score and comment.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5001/submissions/${id}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            score: review.score,
            comment: review.comment,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Error submitting review");
        return;
      }

      alert("Review submitted successfully!");

      if (currentSubmission < submissions.length - 1) {
        setCurrentSubmission(currentSubmission + 1);
      } else {
        navigate("/student");
      }
    } catch (err) {
      console.error("Review submit error:", err);
      alert("Failed to submit review");
    }
  };

  // If no peer submissions exist
  if (submissions.length === 0) {
    return (
      <div className="peer-review-container">
        <h2>No submissions available yet.</h2>

        <button className="back-btn" onClick={() => navigate("/student")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Current submission view
  const submission = submissions[currentSubmission];
  const currentReview = reviews[submission.id] || { score: "", comment: "" };

  return (
    <div className="peer-review-container">
      <header className="peer-review-header">
        <button className="back-btn" onClick={() => navigate("/student")}>
          ← Back to Dashboard
        </button>

        <h1>Peer Review - Assignment {assignmentId}</h1>

        <div className="progress-indicator">
          {currentSubmission + 1} of {submissions.length}
        </div>
      </header>

      <main className="peer-review-content">
        <div className="submission-card">
          <div className="submission-header">
            <h2>Reviewing: {submission.studentName}</h2>
            <span className="submission-date">
              Submitted: {submission.submittedAt}
            </span>
          </div>

          <div className="submission-content">
            <h3>Submission:</h3>
            <div className="submission-text">{submission.submissionText}</div>
          </div>
        </div>

        <div className="review-form">
          <h3>Your Review</h3>

          <div className="score-section">
            <label>Score (0–100):</label>
            <input
              type="number"
              min="0"
              max="100"
              value={currentReview.score}
              onChange={(e) => handleScoreChange(submission.id, e.target.value)}
              placeholder="Enter score"
            />
          </div>

          <div className="comment-section">
            <label>Comments:</label>
            <textarea
              rows="6"
              value={currentReview.comment}
              onChange={(e) =>
                handleCommentChange(submission.id, e.target.value)
              }
              placeholder="Provide detailed feedback..."
            />
          </div>

          <div className="review-actions">
            <button
              className="submit-review-btn"
              onClick={() => handleSubmitReview(submission.id)}
            >
              Submit Review
            </button>

            {currentSubmission < submissions.length - 1 && (
              <button
                className="next-btn"
                onClick={() => setCurrentSubmission(currentSubmission + 1)}
              >
                Next
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PeerReview;