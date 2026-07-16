const { TIMETABLE } = require("../Model/timetable");

async function getTimetableDashboard(req, res) {
    try {
        const targetUsername = req.params.username;
        // Fetching all timetable records and sorting them by dayNumber descending 📉
        const timetableHistory = await TIMETABLE.find({ username: targetUsername }).sort({ dayNumber: -1 });

        res.status(200).render("timetable_dashboard", {
            timelineList: timetableHistory,
            username: targetUsername
        });
    } catch (error) {
        res.status(500).send("An error occurred loading the Timetable: " + error.message + " 🛑");
    }
}

async function renderLogTimetableDay(req, res) {
    // Renders the form with the Weekday/Weekend buttons 🎛️
    res.render("newTimetableDay", { username: req.params.username });
}

async function createNewTimetableDay(req, res) {
    try {
        const targetUsername = req.params.username;
        const { dayNumber, dayType, subjects, hours } = req.body;

        if (!targetUsername || !dayNumber) return res.status(400).send("Username and Day are required! 🛑");

        // 🧹 DATA CLEANUP: Only adding subjects that actually have hours assigned!
        const cleanStudySessions = [];
        if (subjects && hours) {
            const subjectList = Array.isArray(subjects) ? subjects : [subjects];
            const hoursList = Array.isArray(hours) ? hours : [hours];

            for (let i = 0; i < subjectList.length; i++) {
                // If the user typed an hour greater than 0, we add it to the card! ✅
                if (hoursList[i] && Number(hoursList[i]) > 0) {
                    cleanStudySessions.push({
                        subjectName: subjectList[i],
                        hoursStudied: Number(hoursList[i])
                    });
                }
            }
        }

        await TIMETABLE.create({
            username: targetUsername,
            dayNumber: Number(dayNumber),
            date: new Date().toLocaleDateString(),
            dayType: dayType,
            studySessions: cleanStudySessions
        });

        res.redirect(`/timetable/dashboard/${targetUsername}`);
    } catch (error) {
        res.status(500).send("Error saving your timetable day: " + error.message + " 🛑");
    }
}

module.exports = {
    getTimetableDashboard,
    renderLogTimetableDay,
    createNewTimetableDay
};