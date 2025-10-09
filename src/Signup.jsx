import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
export default function Signup() {
  const [role, setRole] = useState("student");
  const navigate = useNavigate();
  const handleSignup = (e) => {
    e.preventDefault();
    if (role === "faculty") navigate("/faculty-dashboard");
    else navigate("/student-dashboard");
  };
  return (
    <div className="full-page">
      <h1>Signup</h1>
      <form className="form-container" onSubmit={handleSignup}>
        <input type="text" placeholder="Full Name" className="form-input" />
        <input type="email" placeholder="Email" className="form-input" />
        <input type="password" placeholder="Password" className="form-input" />
        <select className="select-role" value={role} onChange={e => setRole(e.target.value)}>
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
        </select>
        <button className="form-btn">Signup</button>
      </form>
      <p className="toggle-link">
        Already have an account? <Link to="/login" style={{ color: "white" }}>Login</Link>
      </p>
    </div>
  );
}
