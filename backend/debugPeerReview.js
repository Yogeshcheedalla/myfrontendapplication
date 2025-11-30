const mongoose = require("mongoose");
const User = require("./models/User");
const Assignment = require("./models/Assignment");
const Submission = require("./models/Submission");

mongoose
    .connect("mongodb://127.0.0.1:27017/assignmentApp")
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));

const debugGrading = async () => {
    try {
        // 1. Find Teacher and Student
        const teacher = await User.findOne({ role: "teacher" });
        const student = await User.findOne({ role: "student" });

        if (!teacher || !student) {
            console.log("Teacher or Student not found");
            process.exit();
        }

        console.log(`Teacher: ${teacher.email}, Student: ${student.email}`);

        // 2. Create Assignment
        const assignment = new Assignment({
            title: "Test Grading Assignment",
            description: "Test",
            deadline: new Date(Date.now() + 86400000), // tomorrow
            maxScore: 100,
            createdBy: teacher._id,
        });
        await assignment.save();
        console.log(`Assignment Created: ${assignment._id}`);

        // 3. Student Submit
        const submission = new Submission({
            assignment: assignment._id,
            student: student._id,
            text: "My Answer",
            status: "submitted"
        });
        await submission.save();
        console.log(`Submission Created: ${submission._id}`);

        // 4. Teacher Grade
        const grade = 85;
        const updatedSubmission = await Submission.findByIdAndUpdate(
            submission._id,
            { grade, gradedBy: teacher._id },
            { new: true }
        );
        console.log(`Submission Graded: ${updatedSubmission.grade}`);

        // 5. Student Fetch (Simulate GET /student/submissions)
        const fetchedSubmissions = await Submission.find({ student: student._id }).populate("assignment");

        const mySub = fetchedSubmissions.find(s => s._id.toString() === submission._id.toString());

        if (mySub) {
            console.log(`Student Fetched Grade: ${mySub.grade}`);
            if (mySub.grade === grade) {
                console.log("SUCCESS: Grade is visible to student.");
            } else {
                console.log("FAILURE: Grade mismatch.");
            }
        } else {
            console.log("FAILURE: Submission not found for student.");
        }

        // Cleanup
        await Assignment.findByIdAndDelete(assignment._id);
        await Submission.findByIdAndDelete(submission._id);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debugGrading();