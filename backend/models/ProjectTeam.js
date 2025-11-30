const mongoose = require("mongoose");

const projectTeamSchema = new mongoose.Schema({
    projectId: {
        type: Number,
        required: true,
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
});

module.exports = mongoose.model("ProjectTeam", projectTeamSchema);
