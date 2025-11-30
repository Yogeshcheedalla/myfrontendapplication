const mongoose = require("mongoose");
const User = require("./models/User");
const Assignment = require("./models/Assignment");
const Submission = require("./models/Submission");
const Comment = require("./models/Comment");
const Review = require("./models/Review");

mongoose
    .connect("mongodb://127.0.0.1:27017/assignmentApp")
    .then(async () => {
        console.log("MongoDB Connected for Cleanup");

        try {
            await User.deleteMany({});
            console.log("Deleted all Users");

            await Assignment.deleteMany({});
            console.log("Deleted all Assignments");

            await Submission.deleteMany({});
            console.log("Deleted all Submissions");

            await Comment.deleteMany({});
            console.log("Deleted all Comments");

            await Review.deleteMany({});
            console.log("Deleted all Reviews");

            console.log("All data cleared successfully.");
        } catch (err) {
            console.error("Error clearing data:", err);
        } finally {
            mongoose.connection.close();
        }
    })
    .catch((err) => console.log(err));