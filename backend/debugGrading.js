const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

mongoose
    .connect("mongodb://127.0.0.1:27017/assignmentApp")
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));

const createAdmin = async () => {
    try {
        const email = "admin@admin.com";
        const password = "admin123";
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if admin exists
        let admin = await User.findOne({ email });

        if (admin) {
            console.log("Admin user already exists.");
            // Update password just in case
            admin.password = hashedPassword;
            admin.role = "admin";
            await admin.save();
            console.log("Admin password updated to: " + password);
        } else {
            admin = new User({
                name: "Administrator",
                email,
                password: hashedPassword,
                role: "admin",
            });
            await admin.save();
            console.log("Admin user created successfully.");
        }

        console.log("=================================");
        console.log("Email: " + email);
        console.log("Password: " + password);
        console.log("=================================");

        process.exit();
    } catch (err) {
        console.error("Error creating admin:", err);
        process.exit(1);
    }
};

createAdmin();