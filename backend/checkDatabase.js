const mongoose = require("mongoose");
const User = require("./models/User");
const Assignment = require("./models/Assignment");
const Submission = require("./models/Submission");
const Comment = require("./models/Comment");
const Review = require("./models/Review");

mongoose
    .connect("mongodb://127.0.0.1:27017/assignmentApp")
    .then(async () => {
        console.log("Checking Database...");

        const userCount = await User.countDocuments();
        const assignmentCount = await Assignment.countDocuments();
        const submissionCount = await Submission.countDocuments();
        const commentCount = await Comment.countDocuments();
        const reviewCount = await Review.countDocuments();

        console.log(`Users: ${userCount}`);
        console.log(`Assignments: ${assignmentCount}`);
        console.log(`Submissions: ${submissionCount}`);
        console.log(`Comments: ${commentCount}`);
        console.log(`Reviews: ${reviewCount}`);

        mongoose.connection.close();
    })
    .catch((err) => console.log(err));