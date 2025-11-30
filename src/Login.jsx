import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [captchaValue, setCaptchaValue] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const navigate = useNavigate();

  const generateCaptcha = () => {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let captcha = "";
    for (let i = 0; i < 6; i++) {
      captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaValue(captcha);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (captchaInput !== captchaValue) {
      setError("Invalid Captcha. Please try again.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("userName", data.user.name);

        if (data.user.role === "teacher") navigate("/teacher");
        else if (data.user.role === "admin") navigate("/admin");
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
        <div className="login-logo">
          <span style={{ color: "#6a7dd6" }}>PeerReview</span>
        </div>

        <h2 className="login-title">Welcome Back</h2>
        <p className="login-desc">Please log in to your account.</p>

        <label>Email</label>
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="captcha-container" style={{ margin: "15px 0", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              background: "#eee",
              padding: "10px",
              letterSpacing: "5px",
              fontWeight: "bold",
              fontSize: "18px",
              userSelect: "none",
              flexGrow: 1,
              textAlign: "center",
              borderRadius: "4px",
              color: "#333"
            }}>
              {captchaValue}
            </div>
            <button
              type="button"
              onClick={generateCaptcha}
              style={{ padding: "8px", cursor: "pointer", background: "none", border: "1px solid #ccc", borderRadius: "4px" }}
              title="Refresh Captcha"
            >
              ↻
            </button>
          </div>
          <input
            type="text"
            placeholder="Enter Captcha"
            value={captchaInput}
            onChange={(e) => setCaptchaInput(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }}
          />
        </div>

        <button className="login-btn" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </button>

        <button
          className="signup-btn"
          type="button"
          onClick={() => navigate("/signup")}
        >
          Sign Up
        </button>

        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}

export default Login;