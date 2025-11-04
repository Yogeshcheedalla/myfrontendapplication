// Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css"; // (see CSS below)

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.token) localStorage.setItem("token", data.token);
        if (data.user) {
          localStorage.setItem("role", data.user.role);
          localStorage.setItem("userId", data.user._id || data.user.id || "");
        }
        const userRole = data.user && data.user.role;
        if (userRole === "teacher") navigate("/teacher");
        else navigate("/student");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <div className="login-bg">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-logo"> <span style={{color:"#6a7dd6"}}>PeerReview</span></div>
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-desc">Please log in to your account.</p>

        <label>Email</label>
        <input
          type="email"
          placeholder="m@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Login role selection - commented out
        <div className="login-role-row">
          <span>Log in as:</span>
          <label>
            <input
              type="radio"
              value="student"
              checked={role === "student"}
              onChange={() => setRole("student")}
            />
            Student
          </label>
          <label>
            <input
              type="radio"
              value="teacher"
              checked={role === "teacher"}
              onChange={() => setRole("teacher")}
            />
            Teacher
          </label>
        </div>
        */}

        <button className="login-btn" type="submit" disabled={loading}>{loading ? "Logging in..." : "Log In"}</button>
        <button className="signup-btn" type="button" onClick={() => navigate('/signup')}>Sign Up</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}

export default Login;
