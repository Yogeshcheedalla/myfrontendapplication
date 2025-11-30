const mongoose =require("mongoose");
const AssignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    deadline: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);
 module.exports = mongoose.model("Assignment", AssignmentSchema);
