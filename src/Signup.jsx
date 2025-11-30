import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./signup.css";

function Signup() {
  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pass !== confirm) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5001/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password: pass,
          role
        })
      });

      const data = await res.json();

      if (res.ok) {
        navigate("/login");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-bg">
      <form className="signup-card" onSubmit={handleSubmit}>
        <h2 className="signup-title">Create Your Account</h2>
        <p className="signup-desc">
          Join PeerReview as a Student or Teacher to get started.
        </p>
        <div className="signup-role-row">
          <button
            type="button"
            className={role === "student" ? "role-btn active" : "role-btn"}
            onClick={() => setRole("student")}
          >
            🎓 Student
          </button>
          <button
            type="button"
            className={role === "teacher" ? "role-btn active" : "role-btn"}
            onClick={() => setRole("teacher")}
          >
            📖 Teacher
          </button>
        </div>

        <label>Full Name</label>
        <input type="text" placeholder="Enter Name" value={name} required onChange={e => setName(e.target.value)} />

        <label>Email</label>
        <input type="email" placeholder="Enter Email" value={email} required onChange={e => setEmail(e.target.value)} />

        <label>Password</label>
        <input type="password" placeholder="Enter Password" value={pass} required onChange={e => setPass(e.target.value)} />

        <label>Confirm Password</label>
        <input type="password" placeholder="Confirm Password" value={confirm} required onChange={e => setConfirm(e.target.value)} />

        <button className="signup-btn" type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        {error && <p className="error-message" style={{ color: "#eb5757", marginTop: "10px", textAlign: "center" }}>{error}</p>}

        <div className="signup-footer">
          Already have an account?{" "}
          <span className="signup-login-link" onClick={() => navigate("/login")}>Login</span>
        </div>
      </form>
    </div>
  );
}

export default Signup;