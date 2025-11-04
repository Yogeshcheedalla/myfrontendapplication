import React from "react";
import { useNavigate } from "react-router-dom";
import "./landing.css";

function Landing() {
  const navigate = useNavigate();
  const features = [
    {
      icon: "📖",
      title: "Streamlined Submissions",
      desc: "Easily submit assignments and manage deadlines with an intuitive interface designed for students."
    },
    {
      icon: "💬",
      title: "Comprehensive Feedback",
      desc: "Receive and provide detailed peer feedback with annotation tools and structured review forms."
    },
    {
      icon: "📊",
      title: "Progress Tracking",
      desc: "Monitor individual and class-wide performance with analytical dashboards and grade reports."
    },
    {
      icon: "👥",
      title: "Collaborative Learning",
      desc: "Foster a community of learning through peer interaction and constructive criticism."
    },
    {
      icon: "⚙️",
      title: "Customizable Assignments",
      desc: "Teachers can tailor assignment settings, rubrics, and peer matching to fit any course."
    },
    {
      icon: "🎒",
      title: "Efficient Workflow",
      desc: "Reduce administrative overhead for educators with automated assignment distribution and collection."
    }
  ];

  return (
    <div className="landing-bg">
      <header className="landing-navbar">
        <div className="landing-logo"> <span style={{color:"#6a7dd6"}}></span></div>
        <div>
          <button className="landing-login-btn" onClick={() => navigate("/login")}>Login</button>
          <button className="landing-signup-btn" onClick={() => navigate("/signup")}>Sign Up</button>
        </div>
      </header>
      <main className="landing-main">
        <h1 className="landing-title">
          Streamline Your Peer Assessment Process
        </h1>
        <p className="landing-subtext">
          PeerReview provides a structured environment for teachers and students to collaborate, submit, and review work, enhancing feedback and learning.
        </p>
        <div className="landing-buttons">
          <button className="landing-primary-btn" onClick={() => navigate("/signup")}>Join as Student</button>
          <button className="landing-secondary-btn" onClick={() => navigate("/signup")}>Join as Teacher</button>
        </div>
        <img
          src="/image.jpg"
          alt="Peer Review Illustration"
          className="landing-hero-img"
        />
      </main>

      <section className="landing-features">
        <h2 className="features-title">Key Features Designed for Better Learning</h2>
        <div className="features-grid">
          {features.map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Landing;
