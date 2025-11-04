import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./student.css";

const DASHBOARD_STATS = [
{ label: "Pending Reviews", value: 3, desc: "Assignments awaiting your feedback" },
{ label: "Completed Assignments", value: 12, desc: "Assignments you’ve submitted" },
{ label: "Overall Grade", value: "A-", desc: "Your current academic standing" },
{ label: "Awards & Badges", value: 5, desc: "Recognitions for your efforts" }
];

const RECENT_ACTIVITY = [
{ icon: "💬", label: "Feedback received", desc: 'Review comments for "Essay 1: Narrative Writing"', time: "2 hours ago" },
{ icon: "🔔", label: "Assignment Due", desc: '"Research Project" deadline is tomorrow', time: "5 hours ago" },
{ icon: "📝", label: "Review Assigned", desc: 'Peer review for "Short Story Analysis"', time: "1 day ago" },
{ icon: "🧑‍💻", label: "Profile Update", desc: "Your profile information has been updated", time: "2 days ago" }
];

// Assignments will be fetched from backend

const DEADLINES = [
{ label: "Essay 2 Submission", date: "May 25, 2024", type: "due" },
{ label: "Peer Review Cycle 3 Closes", date: "May 30, 2024", type: "peer" },
{ label: "Research Proposal Draft", date: "June 5, 2024", type: "info" }
];

function Student() {
const navigate = useNavigate();
const [assignments, setAssignments] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

// Fetch assignments when component mounts
React.useEffect(() => {
const fetchAssignments = async () => {
try {
const token = localStorage.getItem('token');
const userId = localStorage.getItem('userId');

const response = await fetch(`http://localhost:5000/student/assignments/${userId}`, {
headers: {
'Authorization': `Bearer ${token}`
}
});

if (!response.ok) {
throw new Error('Failed to fetch assignments');
}

const data = await response.json();
setAssignments(data);
} catch (err) {
setError(err.message);
console.error('Error fetching assignments:', err);
} finally {
setLoading(false);
}
};

fetchAssignments();
}, []); // Empty dependency array means this runs once on mount

function handleQuickAction(action) {
alert("Action: " + action);
}

async function handleAssignmentClick(assignment) {
if (assignment.status === "Review") {
// Navigate to review page
navigate(`/review/${assignment._id}`);
} else if (assignment.status === "Pending") {
// Navigate to submission page
navigate(`/submit/${assignment._id}`);
} else {
// View submitted assignment
navigate(`/assignment/${assignment._id}`);
}
}

function handleLogout() {
// Clear authentication data
localStorage.removeItem('token');
localStorage.removeItem('role');
localStorage.removeItem('userId');
// Redirect to login page
navigate('/');
}

return (
<div className="student-dashboard-bg">
{/* Navbar */}
<header className="student-navbar">
<div className="student-logo">✴️ <span style={{ color: "#6a7dd6" }}>PeerReview</span></div>
<button className="student-logout-btn" onClick={handleLogout}>Logout</button>
</header>

<div className="student-layout">
{/* Sidebar */}
<nav className="student-sidebar">
<div className="sidebar-item active">Student Dashboard</div>
<div className="sidebar-item">My Assignments</div>
<div className="sidebar-subitem">Pending Reviews</div>
<div className="sidebar-subitem">Completed Reviews</div>
<div className="sidebar-item">Grades</div>
<div className="sidebar-item">Settings</div>
</nav>

{/* Main Page */}
<div className="student-main">
<div className="student-row">
{/* Top Stats */}
{DASHBOARD_STATS.map((stat, i) => (
<div key={i} className="student-stat-card">
<div className="student-stat-label">{stat.label}</div>
<div className="student-stat-value">{stat.value}</div>
<div className="student-stat-desc">{stat.desc}</div>
</div>
))}
</div>

{/* Lower Grid */}
<div className="student-lower-row">
{/* Left: Recent Activity & Deadlines */}
<div className="student-lower-left">
<div className="student-card">
<div className="student-card-title">Assignments & Activities</div>
{loading ? (
<div className="loading-message">Loading assignments...</div>
) : error ? (
<div className="error-message">{error}</div>
) : assignments.length === 0 ? (
<div className="no-assignments">No assignments available</div>
) : (
<ul className="student-activity-list">
{assignments.map((assignment) => (
<li
key={assignment._id}
className="student-activity-row"
onClick={() => handleAssignmentClick(assignment)}
style={{ cursor: 'pointer' }}
>
<span style={{fontSize:'1.4em'}}>
{assignment.status === 'Pending' ? '📝' :
assignment.status === 'Review' ? '👥' : '✅'}
</span>
<span>
<b>{assignment.title}</b>
<span className="student-activity-desc">
{assignment.course}
</span>
</span>
<span className="student-activity-time">
Due: {new Date(assignment.due).toLocaleDateString()}
</span>
</li>
))}
</ul>
)}
</div>
<div className="student-card student-deadlines">
<div className="student-card-title">Upcoming Deadlines</div>
<ul className="student-deadline-list">
{DEADLINES.map((d, idx) => (
<li
key={idx}
className={
d.type === "due"
? "deadline-due"
: d.type === "peer"
? "deadline-peer"
: "deadline-info"
}
>
<div>{d.label}</div>
<div>{d.date}</div>
</li>
))}
</ul>
</div>
</div>

{/* Right: Assignments & Quick Actions */}
<div className="student-lower-right">
<div className="student-card student-assignments">
<div className="student-card-title">My Assignments</div>
<ul className="student-assignment-list">
{assignments.map((a, i) => (
<li key={i} className="student-assignment-row">
<div>
<b>{a.title}</b>
<div className="student-assignment-due">Due: {a.due}</div>
</div>
<button
className={
"student-assignment-status " +
(a.status === "Submitted"
? "submitted"
: a.status === "Pending"
? "pending"
: "review")
}
onClick={() => handleAssignmentClick(a.status)}
>
{a.status}
</button>
</li>
))}
</ul>
</div>
<div className="student-card student-actions">
<div className="student-card-title">Quick Actions</div>
<div className="student-actions-grid">
<button
className="student-action-btn primary"
onClick={() => handleQuickAction("Start Review")}
>
Start New Review
</button>
<button
className="student-action-btn"
onClick={() => handleQuickAction("View Grades")}
>
View All Grades
</button>
<button
className="student-action-btn"
onClick={() => handleQuickAction("Update Profile")}
>
Update Profile
</button>
<button
className="student-link-btn"
onClick={() => handleQuickAction("View Resources")}
>
View Learning Resources
</button>
</div>
</div>
</div>

</div>
</div>
</div>
</div>
);
}

export default Student;







