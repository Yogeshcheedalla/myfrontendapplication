import React from "react";
import { Link } from "react-router-dom";
import "./App.css";

const Landing = () => {
  return (
    <div className="landing-page">
      <h1 className="landing-title">🎓 Peer Review Assignment Platform</h1>
      <p className="landing-subtitle">
        Select your role while signing up: Student or Teacher
      </p>

      <div className="landing-card">
        <Link to="/login" className="landing-btn">Login</Link>
        <Link to="/signup" className="landing-btn">Sign Up</Link>
      </div>
    </div>
  );
};

export default Landing;
