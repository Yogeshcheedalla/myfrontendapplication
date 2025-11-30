const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
    submission: { type: mongoose.Schema.Types.ObjectId, ref: "Submission", required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, required: true },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Review", ReviewSchema);
