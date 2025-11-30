const mongoose = require("mongoose");
const User = require("./models/User");
const Assignment = require("./models/Assignment");
const Submission = require("./models/Submission");
const Review = require("./models/Review");
const Comment = require("./models/Comment");

mongoose
    .connect("mongodb://127.0.0.1:27017/assignmentApp")
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));

const verifyAdminComments = async () => {
    try {
        const admin = await User.findOne({ role: "admin" });
        const teacher = await User.findOne({ role: "teacher" });
        const student = await User.findOne({ role: "student" });

        if (!admin || !teacher || !student) {
            console.log("Missing users");
            process.exit();
        }

        const assignment = new Assignment({
            title: "Comment Test Assignment",
            description: "Test",
            deadline: new Date(Date.now() - 86400000), 
            maxScore: 100,
            createdBy: teacher._id,
        });
        await assignment.save();

        const submission = new Submission({
            assignment: assignment._id,
            student: student._id,
            text: "My Answer",
            status: "submitted"
        });
        await submission.save();

        const comment = new Comment({
            submission: submission._id,
            author: teacher._id,
            text: "Good job!"
        });
        await comment.save();
        submission.comments.push(comment._id);
        await submission.save();

        const review = new Review({
            submission: submission._id,
            author: student._id, // Self review for simplicity, or another student
            score: 90,
            comment: "Nice work peer!"
        });
        await review.save();

        // Simulate Admin Fetch
        
        const submissions = await Submission.find({ assignment: assignment._id })
            .populate("student", "name email")
            .populate({
                path: "comments",
                populate: { path: "author", select: "name" },
            });

        const submissionsWithReviews = await Promise.all(
            submissions.map(async (sub) => {
                const reviews = await Review.find({ submission: sub._id })
                    .populate("author", "name")
                    .select("score comment author createdAt");

                return {
                    ...sub.toObject(),
                    peerReviews: reviews,
                };
            })
        );

        const targetSub = submissionsWithReviews.find(s => s._id.toString() === submission._id.toString());

        console.log("--- Verification Results ---");
        if (targetSub) {
            console.log(`Submission Found: ${targetSub._id}`);

            // Check Teacher Comments
            if (targetSub.comments && targetSub.comments.length > 0) {
                console.log(`Teacher Comments: ${targetSub.comments.length} (Expected: 1)`);
                console.log(`Comment Text: "${targetSub.comments[0].text}"`);
            } else {
                console.log("FAILURE: Teacher comments missing");
            }

            // Check Peer Reviews
            if (targetSub.peerReviews && targetSub.peerReviews.length > 0) {
                console.log(`Peer Reviews: ${targetSub.peerReviews.length} (Expected: 1)`);
                console.log(`Review Comment: "${targetSub.peerReviews[0].comment}"`);
            } else {
                console.log("FAILURE: Peer reviews missing");
            }

        } else {
            console.log("FAILURE: Submission not found");
        }

        // Cleanup
        await Assignment.findByIdAndDelete(assignment._id);
        await Submission.findByIdAndDelete(submission._id);
        await Comment.findByIdAndDelete(comment._id);
        await Review.findByIdAndDelete(review._id);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verifyAdminComments();