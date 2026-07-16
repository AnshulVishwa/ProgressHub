const { Schema, model } = require("mongoose");

const timetableSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    dayNumber: {
        type: Number,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    dayType: {
        type: String,
        enum: ["Weekday", "Weekend"],
        required: true
    },
    studySessions: [{
        subjectName: {
            type: String,
            required: true
        },
        hoursStudied: {
            type: Number,
            required: true,
            default: 1
        }
    }]
});

const TIMETABLE = model("TIMETABLE", timetableSchema);

module.exports = { TIMETABLE };