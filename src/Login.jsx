import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./App.css";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Login successful ✅");
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("role", data.user.role);
        if (data.user.role === "teacher") navigate("/teacher");
        else if (data.user.role === "student") navigate("/student");
        else navigate("/faculty-dashboard");
      } else {
        alert(data.message || "Login failed ❌");
      }
    } catch (err) {
      console.error(err);
      alert("Server error ❌");
    }
  };
  return (
    <div className="full-page">
      <h1 className="title">Login</h1>
      <form className="form-container" onSubmit={handleLogin}>
        <input className="form-input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input className="form-input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button className="form-btn" type="submit">Login</button>
      </form>
      <p className="toggle-link">
        Don't have an account? <Link to="/signup" style={{ color: "white" }}>Signup</Link>
      </p>
    </div>
  );
};
export default Login;
