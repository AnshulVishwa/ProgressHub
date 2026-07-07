const { Schema, model } = require("mongoose");

const infoSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    day: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    leetcodeNum: [{
        type: Number,
        required: true
    }],
    topics: [{
        type: String,
    }],
    questions: [{
        q: {
            type: String,
            required: true
        },
        difficulty: {
            type: String,
            enum: ["Easy", "Medium", "Hard"],
            required: true
        }
    }],
    algorithms: [{
        type: String,
        required: true
    }]
});

const INFO = model("INFO", infoSchema);

module.exports = { INFO };