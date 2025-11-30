import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { projects } from "./projects";
import "./student.css";


const Admin = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("projects");
    const [teams, setTeams] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [teacherAssignments, setTeacherAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const role = localStorage.getItem("role");
        if (role !== "admin") {
            alert("Access denied. Admins only.");
            navigate("/");
            return;
        }

        if (activeTab === "projects") {
            fetchTeams();
        } else if (activeTab === "teachers") {
            fetchTeachers();
        }
    }, [activeTab, navigate]);

    const fetchTeams = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5001/admin/project-teams", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setTeams(data);
            }
        } catch (err) {
            console.error("Error fetching teams:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5001/admin/teachers", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setTeachers(data);
            }
        } catch (err) {
            console.error("Error fetching teachers:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeacherAssignments = async (teacherId) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5001/admin/teachers/${teacherId}/assignments`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setTeacherAssignments(data);
            }
        } catch (err) {
            console.error("Error fetching assignments:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmissions = async (assignmentId) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5001/assignments/${assignmentId}/submissions`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setSubmissions(data);
            }
        } catch (err) {
            console.error("Error fetching submissions:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (teamId, userId) => {
        if (!window.confirm("Are you sure you want to remove this member?")) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5001/admin/project-teams/${teamId}/members/${userId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                alert("Failed to remove member");
                return;
            }

            setTeams((prev) =>
                prev.map((t) =>
                    t._id === teamId ? { ...t, members: t.members.filter((m) => m._id !== userId) } : t
                )
            );
            alert("Member removed successfully");
        } catch (err) {
            console.error("Error removing member:", err);
        }
    };

    const handleSignOut = () => {
        localStorage.clear();
        window.location.href = "/";
    };

    const getProjectName = (id) => {
        const project = projects.find((p) => p.id === Number(id));
        return project ? project.title : `Project ID: ${id}`;
    };

    return (
        <div className="student-dashboard">
            <header className="dashboard-header">
                <div className="header-left">
                    <div className="dashboard-title">
                        <h1>Admin Dashboard</h1>
                    </div>
                </div>
                <div className="header-right">
                    <button className="sign-out-btn" onClick={handleSignOut}>
                        Sign Out
                    </button>
                </div>
            </header>

            <div className="admin-tabs" style={{ padding: "20px", display: "flex", gap: "10px" }}>
                <button
                    onClick={() => { setActiveTab("projects"); setSelectedTeacher(null); setSelectedAssignment(null); }}
                    style={{ padding: "10px 20px", backgroundColor: activeTab === "projects" ? "#6a7dd6" : "#ddd", color: activeTab === "projects" ? "white" : "black", border: "none", borderRadius: "5px", cursor: "pointer" }}
                >
                    Project Teams
                </button>
                <button
                    onClick={() => { setActiveTab("teachers"); setSelectedTeacher(null); setSelectedAssignment(null); }}
                    style={{ padding: "10px 20px", backgroundColor: activeTab === "teachers" ? "#6a7dd6" : "#ddd", color: activeTab === "teachers" ? "white" : "black", border: "none", borderRadius: "5px", cursor: "pointer" }}
                >
                    Teachers & Assignments
                </button>
            </div>

            <main className="dashboard-content">
                {activeTab === "projects" && (
                    <section className="assignments-section">
                        <h2>Project Teams</h2>
                        {loading ? <p>Loading...</p> : teams.length === 0 ? <p>No teams formed yet.</p> : (
                            <div className="assignments-list">
                                {teams.map((team) => (
                                    <div key={team._id} className="assignment-card">
                                        <div className="assignment-header">
                                            <h3 className="assignment-title">{getProjectName(team.projectId)}</h3>
                                            <span className="submitted-badge">{team.members.length}/3 Members</span>
                                        </div>
                                        <div className="team-members-list" style={{ marginTop: "15px" }}>
                                            <strong>Members:</strong>
                                            <ul style={{ listStyle: "none", padding: 0, marginTop: "10px" }}>
                                                {team.members.map((member) => (
                                                    <li key={member._id} style={{ padding: "5px 0", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between" }}>
                                                        <span>{member.name} ({member.email})</span>
                                                        <button onClick={() => handleRemoveMember(team._id, member._id)} style={{ backgroundColor: "#ff4d4d", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}>Remove</button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {activeTab === "teachers" && (
                    <section className="assignments-section">
                        {!selectedTeacher ? (
                            <>
                                <h2>Teachers</h2>
                                {loading ? <p>Loading...</p> : (
                                    <div className="assignments-list">
                                        {teachers.map((teacher) => (
                                            <div key={teacher._id} className="assignment-card" onClick={() => { setSelectedTeacher(teacher); fetchTeacherAssignments(teacher._id); }} style={{ cursor: "pointer" }}>
                                                <h3 className="assignment-title">{teacher.name}</h3>
                                                <p>{teacher.email}</p>
                                                <p style={{ color: "#666", marginTop: "10px" }}>Click to view assignments</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : !selectedAssignment ? (
                            <>
                                <button onClick={() => setSelectedTeacher(null)} style={{ marginBottom: "20px", padding: "5px 10px" }}>&larr; Back to Teachers</button>
                                <h2>Assignments by {selectedTeacher.name}</h2>
                                {loading ? <p>Loading...</p> : teacherAssignments.length === 0 ? <p>No assignments created.</p> : (
                                    <div className="assignments-list">
                                        {teacherAssignments.map((assignment) => (
                                            <div key={assignment._id} className="assignment-card" onClick={() => { setSelectedAssignment(assignment); fetchSubmissions(assignment._id); }} style={{ cursor: "pointer" }}>
                                                <h3 className="assignment-title">{assignment.title}</h3>
                                                <p>{assignment.description}</p>
                                                <p style={{ color: "#666", marginTop: "10px" }}>Click to view submissions</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <button onClick={() => setSelectedAssignment(null)} style={{ marginBottom: "20px", padding: "5px 10px" }}>&larr; Back to Assignments</button>
                                <h2>Submissions for {selectedAssignment.title}</h2>
                                {loading ? <p>Loading...</p> : submissions.length === 0 ? <p>No submissions yet.</p> : (
                                    <div className="assignments-list">
                                        {submissions.map((sub) => (
                                            <div key={sub._id} className="assignment-card">
                                                <h3 className="assignment-title">{sub.student.name}</h3>
                                                <p>Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                                                <div style={{ marginTop: "10px", fontWeight: "bold" }}>
                                                    Grade: {sub.grade !== undefined ? `${sub.grade}/${selectedAssignment.maxScore || 100}` : <span style={{ color: "orange" }}>not updated</span>}
                                                </div>
                                                {sub.text && <p style={{ marginTop: "10px", background: "#f9f9f9", padding: "10px" }}>{sub.text}</p>}

                                                {/* Conditional Comments Display */}
                                                {sub.peerReviews && sub.peerReviews.length > 0 && sub.grade !== undefined ? (
                                                    <>
                                                        {/* Teacher Comments */}
                                                        {sub.comments && sub.comments.length > 0 && (
                                                            <div style={{ marginTop: "15px" }}>
                                                                <strong>Teacher Comments:</strong>
                                                                <ul style={{ listStyle: "none", padding: 0 }}>
                                                                    {sub.comments.map((comment, idx) => (
                                                                        <li key={idx} style={{ background: "#eef", padding: "5px", marginTop: "5px", borderRadius: "4px" }}>
                                                                            <strong>{comment.author?.name}:</strong> {comment.text}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}

                                                        {/* Peer Reviews */}
                                                        {sub.peerReviews && sub.peerReviews.length > 0 && (
                                                            <div style={{ marginTop: "15px" }}>
                                                                <strong>Peer Reviews:</strong>
                                                                <ul style={{ listStyle: "none", padding: 0 }}>
                                                                    {sub.peerReviews.map((review, idx) => (
                                                                        <li key={idx} style={{ background: "#f0f0f0", padding: "8px", marginTop: "5px", borderRadius: "4px" }}>
                                                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                                                <strong>{review.author?.name || "Anonymous"}</strong>
                                                                                <span style={{ color: "#666" }}>Score: {review.score}</span>
                                                                            </div>
                                                                            <p style={{ margin: "5px 0 0 0" }}>{review.comment}</p>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <p style={{ marginTop: "15px", color: "#666", fontStyle: "italic" }}>not commented any one</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
};

export default Admin;