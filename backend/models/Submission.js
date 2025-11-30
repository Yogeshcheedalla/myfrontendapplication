const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fileUrl: String,
  text: String,
  submittedAt: { type: Date, default: Date.now },
  grade: { type: Number, default: null },
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  status: { type: String, enum: ["submitted", "removed"], default: "submitted" }
});

module.exports = mongoose.model("Submission", SubmissionSchema);
