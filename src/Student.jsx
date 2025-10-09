import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

const Student = () => {
const [assignments, setAssignments] = useState([]);
const [submissions, setSubmissions] = useState([]);
const [fileUrl, setFileUrl] = useState("");
const [commentText, setCommentText] = useState({});
const [selectedAssignment, setSelectedAssignment] = useState(null);

const studentId = localStorage.getItem("userId");
const navigate = useNavigate();

// Fetch assignments on load
useEffect(() => {
if (!studentId) {
navigate("/login");
return;
}
fetch(`http://localhost:5173/assignments?studentId=${studentId}`)
.then(res => res.json())
.then(data => setAssignments(data))
.catch(err => {
console.error("Error fetching assignments:", err);
setAssignments([]);
});
}, [studentId, navigate]);

const handleSubmitAssignment = async (assignmentId) => {
const res = await fetch("http://localhost:5000/submissions", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ assignmentId, studentId, fileUrl })
});
const data = await res.json();
alert(data.message);
setFileUrl("");
};

const handleViewSubmissions = async (assignmentId) => {
setSelectedAssignment(assignmentId);
try {
const res = await fetch(`http://localhost:5000/submissions/${assignmentId}`);
const data = await res.json();
if (res.ok) {
setSubmissions(data);
} else {
alert(data.message);
}
} catch (err) {
console.error("Error fetching submissions:", err);
}
};

const handleAddComment = async (submissionId) => {
const res = await fetch("http://localhost:5000/comments", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
submissionId,
studentId,
text: commentText[submissionId] || ""
})
});
const data = await res.json();
alert(data.message);

// Clear only the comment for this submission
setCommentText(prev => ({ ...prev, [submissionId]: "" }));
};

return (
<div className="container">
<h1 className="title">🎓 Student Dashboard</h1>
<p style={{ color: "green", fontWeight: "bold" }}>Student dashboard loaded!</p>

<h2 className="subtitle">Assignments</h2>
<ul className="list">
{assignments.map(a => (
<li key={a._id} className="list-item">
<b>{a.title}</b> - {a.description} <br />
<small>Deadline: {new Date(a.deadline).toLocaleDateString()}</small>
<div className="actions">
<input
className="input"
placeholder="File URL"
value={fileUrl}
onChange={e => setFileUrl(e.target.value)}
/>
<button className="btn" onClick={() => handleSubmitAssignment(a._id)}>Submit</button>
<button className="btn secondary" onClick={() => handleViewSubmissions(a._id)}>View Submissions</button>
</div>
</li>
))}
</ul>

{selectedAssignment && (
<div className="submissions">
<h2 className="subtitle">Submissions</h2>
{submissions.map(s => (
<div key={s._id} className="card">
<p><b>{s.student.name}</b>: <a href={s.fileUrl} target="_blank" rel="noreferrer">View File</a></p>
<p>Grade: {s.grade || "Not Graded Yet"}</p>
<input
className="input"
placeholder="Add comment"
value={commentText[s._id] || ""}
onChange={e => setCommentText(prev => ({ ...prev, [s._id]: e.target.value }))}
/>
<button className="btn" onClick={() => handleAddComment(s._id)}>Comment</button>
</div>
))}
</div>
)}
</div>
);
};

export default Student;
