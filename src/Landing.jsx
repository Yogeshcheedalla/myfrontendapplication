import React from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="uiA-container">
      <header className="uiA-header">
        <div className="uiA-icon">🎓</div>

        <h1 className="uiA-title">Peer Grading Platform</h1>

        <p className="uiA-subtitle">
          A collaborative learning environment where teachers create assignments,
          students submit their work, and peers provide valuable feedback.
        </p>

        <button className="uiA-btn" onClick={() => navigate("/signup")}>
          Get Started
        </button>
      </header>

      <section className="uiA-feature-section">
        <div className="uiA-feature-card">
          <div className="uiA-feature-icon">📘</div>
          <h3>Create Assignments</h3>
          <p>
            Teachers can easily create and manage assignments with detailed
            instructions and deadlines.
          </p>
        </div>

        <div className="uiA-feature-card">
          <div className="uiA-feature-icon">🧑‍🏫</div>
          <h3>Submit Work</h3>
          <p>
            Students can submit their assignments and receive grades from
            teachers.
          </p>
        </div>

        <div className="uiA-feature-card">
          <div className="uiA-feature-icon">💬</div>
          <h3>Peer Review</h3>
          <p>
            Students can view and comment on each other's submissions to foster
            collaborative learning.
          </p>
        </div>
      </section>

      <section className="uiA-how-section">
        <h2>How It Works</h2>

        <div className="uiA-step-card">
          <div className="uiA-step-number">1</div>
          <div>
            <h4>Sign up as Teacher or Student</h4>
            <p>Choose your role and create an account to get started.</p>
          </div>
        </div>

        <div className="uiA-step-card">
          <div className="uiA-step-number">2</div>
          <div>
            <h4>Teachers Create Assignments</h4>
            <p>Set up assignments with descriptions, due dates, and scores.</p>
          </div>
        </div>

        <div className="uiA-step-card">
          <div className="uiA-step-number">3</div>
          <div>
            <h4>Students Submit & Review</h4>
            <p>
              Students complete work, submit assignments, and review peer
              submissions.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
