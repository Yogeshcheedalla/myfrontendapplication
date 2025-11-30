const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./models/User");
const Assignment = require("./models/Assignment");
const Submission = require("./models/Submission");
const Comment = require("./models/Comment");
const Review = require("./models/Review");
const ProjectTeam = require("./models/ProjectTeam");

console.log("Starting server...");

const app = express();
app.use(express.json());
app.use(cors());

mongoose
  .connect("mongodb://127.0.0.1:27017/assignmentApp")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const JWT_SECRET = "mysecretkey";

function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];

  if (!token)
    return res.status(401).json({ message: "Invalid token format" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}


// Signup
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashed,
      role,
    });

    await user.save();

    res.json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ message: "Signup error", error: err.message });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        role: user.role,
        name: user.name,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
});


// Assignments

app.post("/assignments", auth, async (req, res) => {
  try {
    if (req.user.role !== "teacher")
      return res.status(403).json({ message: "Only teachers allowed" });

    const { title, description, deadline, maxScore } = req.body;

    if (!title || !deadline)
      return res.status(400).json({ message: "Title and Deadline are required" });

    const assignment = new Assignment({
      title,
      description,
      deadline,
      maxScore: maxScore || 100,
      createdBy: req.user.id,
    });

    await assignment.save();

    res.json({
      message: "Assignment Created",
      assignment,
    });
  } catch (err) {
    res.status(500).json({ message: "Error creating assignment", error: err.message });
  }
});

// TEACHER FETCH ALL ASSIGNMENTS
app.get("/assignments", auth, async (req, res) => {
  try {
    if (req.user.role !== "teacher")
      return res.status(403).json({ message: "Only teachers allowed" });

    const assignments = await Assignment.find({ createdBy: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching assignments", error: err.message });
  }
});

// STUDENT FETCH ASSIGNMENTS
app.get("/student/assignments", auth, async (req, res) => {
  try {
    if (req.user.role !== "student")
      return res.status(403).json({ message: "Only students allowed" });

    const assignments = await Assignment.find()
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: "Error loading assignments", error: err.message });
  }
});

// STUDENT FETCH SUBMISSIONS
app.get("/student/submissions", auth, async (req, res) => {
  try {
    if (req.user.role !== "student")
      return res.status(403).json({ message: "Only students allowed" });

    const submissions = await Submission.find({ student: req.user.id }).populate(
      "assignment"
    );

    // For each submission, fetch peer reviews
    const submissionsWithReviews = await Promise.all(
      submissions.map(async (submission) => {
        const reviews = await Review.find({ submission: submission._id })
          .populate("author", "name")
          .select("score comment author createdAt");

        return {
          ...submission.toObject(),
          peerReviews: reviews,
        };
      })
    );

    res.json(submissionsWithReviews);
  } catch (err) {
    res.status(500).json({
      message: "Error loading submissions",
      error: err.message,
    });
  }
});

// SUBMISSIONS


// STUDENT SUBMITS ASSIGNMENT
app.post("/assignments/:id/submit", auth, async (req, res) => {
  try {
    if (req.user.role !== "student")
      return res.status(403).json({ message: "Only students can submit" });

    const { text, fileUrl } = req.body;

    // Check submission count
    const existingSubmissions = await Submission.find({
      assignment: req.params.id,
      student: req.user.id,
    });

    const submissionCount = existingSubmissions.length;

    if (submissionCount >= 3) {
      return res.status(400).json({ message: "Max submissions (3) reached" });
    }

    // Check if already graded
    const isGraded = existingSubmissions.some((sub) => sub.grade != null);
    if (isGraded) {
      return res.status(400).json({ message: "Cannot resubmit after being graded" });
    }

    const submission = new Submission({
      assignment: req.params.id,
      student: req.user.id,
      text,
      fileUrl,
    });

    await submission.save();

    res.json({ message: "Submission Saved", submission });
  } catch (err) {
    res.status(500).json({ message: "Submission error", error: err.message });
  }
});


// (Peer Review + Teacher Evaluation)
app.get("/assignments/:id/submissions", auth, async (req, res) => {
  try {
    const allowed = ["teacher", "student", "admin"];

    if (!allowed.includes(req.user.role))
      return res.status(403).json({ message: "Access denied" });

    // If student, check if they have submitted this assignment
    if (req.user.role === "student") {
      const mySubmission = await Submission.findOne({
        assignment: req.params.id,
        student: req.user.id,
      });

      if (!mySubmission) {
        return res.status(403).json({
          message: "Access denied. You must submit your assignment first.",
        });
      }
    }

    // If teacher, check if they created the assignment
    if (req.user.role === "teacher") {
      const assignment = await Assignment.findById(req.params.id);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      if (assignment.createdBy.toString() !== req.user.id) {
        return res.status(403).json({
          message: "Access denied. You can only view submissions for your own assignments.",
        });
      }
    }

    // Admin bypasses these checks

    // DEADLINE CHECK FOR STUDENTS (Peer Review)
    if (req.user.role === "student") {
      const assignment = await Assignment.findById(req.params.id);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      if (new Date() < new Date(assignment.deadline)) {
        return res.status(403).json({
          message: "Peer review is only available after the deadline is over.",
        });
      }
    }

    const submissions = await Submission.find({ assignment: req.params.id })
      .populate("student", "name email")
      .populate({
        path: "comments",
        populate: { path: "author", select: "name" },
      });

    // Fetch peer reviews for each submission
    const submissionsWithReviews = await Promise.all(
      submissions.map(async (submission) => {
        const reviews = await Review.find({ submission: submission._id })
          .populate("author", "name")
          .select("score comment author createdAt");

        return {
          ...submission.toObject(),
          peerReviews: reviews,
        };
      })
    );

    // FILTER: If student, remove submissions they have already reviewed AND their own submission
    if (req.user.role === "student") {
      const myReviews = await Review.find({ author: req.user.id });
      const reviewedSubmissionIds = myReviews.map((r) =>
        r.submission.toString()
      );

      console.log(`[PeerReview] User: ${req.user.id}, Assignment: ${req.params.id}`);
      console.log(`[PeerReview] Total Submissions: ${submissionsWithReviews.length}`);
      console.log(`[PeerReview] Reviewed IDs: ${reviewedSubmissionIds}`);

      const filtered = submissionsWithReviews.filter(
        (s) =>
          !reviewedSubmissionIds.includes(s._id.toString()) &&
          s.student._id.toString() !== req.user.id
      );

      console.log(`[PeerReview] Available for review: ${filtered.length}`);

      return res.json(filtered);
    }

    res.json(submissionsWithReviews);
  } catch (err) {
    res.status(500).json({ message: "Error loading submissions", error: err.message });
  }
});

// SUBMIT PEER REVIEW
app.post("/submissions/:id/reviews", auth, async (req, res) => {
  try {
    if (req.user.role !== "student")
      return res.status(403).json({ message: "Only students can review" });

    const { score, comment } = req.body;

    const review = new Review({
      submission: req.params.id,
      author: req.user.id,
      score,
      comment,
    });

    await review.save();

    res.json({ message: "Review Saved", review });
  } catch (err) {
    res.status(500).json({ message: "Error saving review", error: err.message });
  }
});

// TEACHER GRADES SUBMISSION
app.patch("/submissions/:id/grade", auth, async (req, res) => {
  try {
    if (req.user.role !== "teacher")
      return res.status(403).json({ message: "Only teachers can grade" });

    const { grade } = req.body;

    const updated = await Submission.findByIdAndUpdate(
      req.params.id,
      { grade, gradedBy: req.user.id },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error grading submission", error: err.message });
  }
});


// COMMENTS

// ADD COMMENT
app.post("/submissions/:id/comments", auth, async (req, res) => {
  try {
    const { text } = req.body;

    const comment = new Comment({
      submission: req.params.id,
      author: req.user.id,
      text,
    });

    await comment.save();

    await Submission.findByIdAndUpdate(req.params.id, {
      $push: { comments: comment._id },
    });

    res.json({ message: "Comment Added", comment });
  } catch (err) {
    res.status(500).json({ message: "Error adding comment", error: err.message });
  }
});

// GET COMMENTS
app.get("/submissions/:id/comments", auth, async (req, res) => {
  try {
    const comments = await Comment.find({ submission: req.params.id })
      .populate("author", "name role");

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching comments", error: err.message });
  }
});

// PROJECT TEAMS

// GET TEAM FOR A PROJECT
app.get("/projects/:id/team", auth, async (req, res) => {
  try {
    const projectId = req.params.id;
    const team = await ProjectTeam.findOne({ projectId }).populate("members", "name email");

    if (!team) {
      return res.json({ members: [] });
    }

    res.json(team);
  } catch (err) {
    res.status(500).json({ message: "Error fetching team", error: err.message });
  }
});

// JOIN PROJECT TEAM
app.post("/projects/:id/join", auth, async (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const userId = req.user.id;

    console.log(`User ${userId} attempting to join project ${projectId}`);

    let team = await ProjectTeam.findOne({ projectId });

    if (!team) {
      console.log("Creating new team");
      // Create new team if doesn't exist
      team = new ProjectTeam({
        projectId,
        members: [userId],
      });
      await team.save();
      return res.json({ message: "Joined team successfully", team });
    }

    console.log("Existing team members:", team.members);

    // Check if already in team
    // Fix: Convert ObjectIds to strings for comparison
    const isAlreadyMember = team.members.some(
      (memberId) => memberId.toString() === userId
    );

    if (isAlreadyMember) {
      console.log("User already in team");
      return res.status(400).json({ message: "You are already in this team" });
    }

    // Check max limit
    if (team.members.length >= 3) {
      console.log("Max limit reached");
      return res.status(400).json({ message: "Max limit reached (3 members)" });
    }

    // Add user to team
    team.members.push(userId);
    await team.save();
    console.log("User added to team");

    // Populate members for response
    await team.populate("members", "name email");

    res.json({ message: "Joined team successfully", team });
  } catch (err) {
    console.error("Error joining team:", err);
    res.status(500).json({ message: "Error joining team", error: err.message });
  }
});

// ADMIN ROUTES
app.get("/admin/project-teams", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // Fetch all teams and populate members
    const teams = await ProjectTeam.find().populate("members", "name email");
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: "Error fetching teams", error: err.message });
  }
});

// ADMIN REMOVE MEMBER FROM TEAM
app.delete("/admin/project-teams/:teamId/members/:userId", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const { teamId, userId } = req.params;

    const team = await ProjectTeam.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Remove member
    team.members = team.members.filter((id) => id.toString() !== userId);
    await team.save();

    // Return updated team
    await team.populate("members", "name email");
    res.json({ message: "Member removed", team });
  } catch (err) {
    res.status(500).json({ message: "Error removing member", error: err.message });
  }
});

// ADMIN GET ALL TEACHERS
app.get("/admin/teachers", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    const teachers = await User.find({ role: "teacher" }).select("-password");
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching teachers", error: err.message });
  }
});

// ADMIN GET ASSIGNMENTS BY TEACHER
app.get("/admin/teachers/:teacherId/assignments", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    const assignments = await Assignment.find({ createdBy: req.params.teacherId }).sort({ createdAt: -1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching assignments", error: err.message });
  }
});

// DATA MIGRATION: Fix missing createdBy
const fixOrphanAssignments = async () => {
  try {
    const teacher = await User.findOne({ role: "teacher" });
    if (!teacher) {
      console.log("Migration: No teacher found to assign orphan assignments.");
      return;
    }

    const result = await Assignment.updateMany(
      { createdBy: { $exists: false } },
      { $set: { createdBy: teacher._id } }
    );

    // Also try to update null ones
    const resultNull = await Assignment.updateMany(
      { createdBy: null },
      { $set: { createdBy: teacher._id } }
    );

    if (result.modifiedCount > 0 || resultNull.modifiedCount > 0) {
      console.log(`Migration: Assigned ${result.modifiedCount + resultNull.modifiedCount} orphan assignments to teacher ${teacher.name}`);
    }
  } catch (err) {
    console.error("Migration error:", err);
  }
};

// Run migration on startup
mongoose.connection.once("open", () => {
  fixOrphanAssignments();
});

// 404 Handler (Must be last)
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ message: "Route not found", path: req.path, method: req.method });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));