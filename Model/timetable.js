const mongoose = require('mongoose');

const dailyTimetableSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        index: true // Indexed for faster querying by username
    },
    dayClassification: {
        type: String,
        enum: ['Weekday', 'Weekend', 'Holiday'],
        required: true
    },
    trackingDate: {
        type: Date,
        default: Date.now
    },
    studySubjects: [{
        subjectName: {
            type: String,
            required: true
        },
        allocatedTimeInHours: {
            type: Number,
            required: true
        },
        timeSpentInHours: {
            type: Number,
            default: 0
        },
        // Inside your DailyTimetable model file
        preferredTimeOfDay: {
            type: String,
            enum: ['Morning', 'Evening', 'Flexible', 'College Hours', 'After College'], // Added 'After College' here
            default: 'Flexible'
        }
    }]
}, { timestamps: true });

const DailyTimetable = mongoose.model('DailyTimetable', dailyTimetableSchema);

module.exports = DailyTimetable;