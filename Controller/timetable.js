const DailyTimetable = require('../Model/timetable'); // Ensure this path matches your project structure 📂

// Controller to render the timetable page and initialize default data 🗓️
const renderUserTimetable = async (request, response) => {
    try {
        const targetUsername = request.params.username;

        // Fetch the timetable data for the specific user 🔍
        let userTimetableData = await DailyTimetable.find({ username: targetUsername });

        // If the arrays are empty, initialize the database with your default data 🚀
        if (userTimetableData.length === 0) {
            const defaultTimetableEntries = [
                {
                    username: targetUsername,
                    dayClassification: 'Weekday',
                    studySubjects: [
                        { subjectName: 'Aptitude', allocatedTimeInHours: 0, preferredTimeOfDay: 'College Hours' },
                        { subjectName: 'JavaScript', allocatedTimeInHours: 0, preferredTimeOfDay: 'College Hours' },
                        { subjectName: 'Java + DSA', allocatedTimeInHours: 0, preferredTimeOfDay: 'Morning' },
                        { subjectName: 'DBMS + SQL', allocatedTimeInHours: 0, preferredTimeOfDay: 'Evening' }
                    ]
                },
                {
                    username: targetUsername,
                    dayClassification: 'Weekend',
                    studySubjects: [
                        { subjectName: 'Aptitude', allocatedTimeInHours: 1, preferredTimeOfDay: 'Flexible' },
                        { subjectName: 'Java + DSA', allocatedTimeInHours: 2, preferredTimeOfDay: 'Flexible' },
                        { subjectName: 'DBMS + SQL', allocatedTimeInHours: 1.5, preferredTimeOfDay: 'Flexible' },
                        { subjectName: 'System Design', allocatedTimeInHours: 2, preferredTimeOfDay: 'Flexible' },
                        { subjectName: 'Project Enhance', allocatedTimeInHours: 2, preferredTimeOfDay: 'Flexible' },
                        { subjectName: 'JavaScript', allocatedTimeInHours: 2, preferredTimeOfDay: 'Flexible' }
                    ]
                }
            ];

            // Save these defaults into MongoDB 💾
            await DailyTimetable.insertMany(defaultTimetableEntries);

            // Re-fetch the newly created data so we can pass it to EJS! 🔄
            userTimetableData = await DailyTimetable.find({ username: targetUsername });
        } else {
            // Check for existing users who have 'Aptitude or JS' in the DB and migrate them
            let needsSave = false;
            for (let doc of userTimetableData) {
                if (doc.dayClassification === 'Weekday') {
                    let aptitudeOrJsIndex = doc.studySubjects.findIndex(s => s.subjectName === 'Aptitude or JS');
                    if (aptitudeOrJsIndex !== -1) {
                        doc.studySubjects[aptitudeOrJsIndex].subjectName = 'Aptitude';
                        doc.studySubjects.push({ subjectName: 'JavaScript', allocatedTimeInHours: 0, preferredTimeOfDay: 'College Hours', timeSpentInHours: 0 });
                        needsSave = true;
                    }
                }
            }
            if (needsSave) {
                await Promise.all(userTimetableData.map(doc => doc.save()));
            }
        }

        // Separate the data logically for the EJS template ✂️
        const weekdaySubjects = userTimetableData.filter(
            timetable => timetable.dayClassification === 'Weekday'
        ).flatMap(timetable => timetable.studySubjects);

        const weekendSubjects = userTimetableData.filter(
            timetable => timetable.dayClassification === 'Weekend' || timetable.dayClassification === 'Holiday'
        ).flatMap(timetable => timetable.studySubjects);

        // Render the EJS file and pass the variables 🎨
        response.render('timetable', {
            username: targetUsername,
            weekdaySubjects: weekdaySubjects,
            weekendSubjects: weekendSubjects
        });

    } catch (databaseError) {
        console.error("Error fetching timetable:", databaseError);
        response.status(500).send("Server Error retrieving your Progress Hub data.");
    }
};

// Controller to handle form submissions and update time spent ⚙️
const updateUserProgress = async (request, response) => {
    try {
        const targetUsername = request.params.username;
        const submittedFormData = request.body;
        const currentDayClassification = submittedFormData.dayClassification;

        console.log("Updating timetable for user:", targetUsername, "Day:", currentDayClassification);
        console.log("Submitted Data:", submittedFormData);

        // Find the specific timetable document for this user and day type 🔍
        const targetTimetableDocument = await DailyTimetable.findOne({
            username: targetUsername,
            dayClassification: currentDayClassification
        });

        if (targetTimetableDocument) {
            let updated = false;
            // Loop through the submitted body to find the timeSpent inputs 🔄
            for (const inputKey in submittedFormData) {
                if (inputKey.startsWith('timeSpent_')) {
                    const subjectIdentifier = inputKey.split('_')[1];
                    const newlyLoggedHours = Number(submittedFormData[inputKey]);

                    // Find the matching subject in the array and update its time ⏱️
                    const subjectToUpdate = targetTimetableDocument.studySubjects.find(
                        sub => sub._id.toString() === subjectIdentifier
                    );
                    if (subjectToUpdate) {
                        subjectToUpdate.timeSpentInHours = newlyLoggedHours;
                        updated = true;
                    } else {
                        console.log("Subject not found for ID:", subjectIdentifier);
                    }
                }
            }
            if (updated) {
                targetTimetableDocument.markModified('studySubjects');
                // Save the updated document back to the database 💾
                await targetTimetableDocument.save();
                console.log("Successfully saved updated timetable document");
            }
        } else {
            console.log("Timetable document not found for:", targetUsername, currentDayClassification);
        }

        // Redirect back to the same user's timetable page after saving 🔄
        response.redirect(`/timetable/${targetUsername}`);

    } catch (updateError) {
        console.error("Error updating progress:", updateError);
        response.status(500).send("Server Error saving your progress.");
    }
};

// Controller to render the beautiful visualization dashboard 📊
const renderProgressDashboard = async (request, response) => {
    try {
        const targetUsername = request.params.username;
        const userTimetableData = await DailyTimetable.find({ username: targetUsername });

        let subjectProgressList = [];
        let totalTimeSpent = 0;
        let currentStreakCount = 5; // Placeholder streak 🔥

        // Combine all subjects from all day classifications 🌐
        let aggregatedSubjects = {};

        userTimetableData.forEach(doc => {
            doc.studySubjects.forEach(subject => {
                if (!aggregatedSubjects[subject.subjectName]) {
                    aggregatedSubjects[subject.subjectName] = {
                        name: subject.subjectName,
                        spent: 0,
                        target: 0
                    };
                }
                aggregatedSubjects[subject.subjectName].spent += subject.timeSpentInHours;
                aggregatedSubjects[subject.subjectName].target += subject.allocatedTimeInHours;
            });
        });

        subjectProgressList = Object.values(aggregatedSubjects).map(subject => {
            // Prevent division by zero if target is 0 🛡️
            const targetHours = subject.target > 0 ? subject.target : 1;
            const percentageCompleted = (subject.spent / targetHours) * 100;
            totalTimeSpent += subject.spent;

            return {
                name: subject.name,
                spent: subject.spent,
                target: subject.target,
                // Cap the percentage at 100% so the bar doesn't overflow! 🛑
                progressPercentage: Math.min(percentageCompleted, 100)
            };
        });

        // Render the dashboard view 🎨
        response.render('dashboard', {
            username: targetUsername,
            streakCount: currentStreakCount,
            totalHoursLogged: totalTimeSpent,
            subjectProgressList: subjectProgressList
        });

    } catch (error) {
        console.error("Error loading dashboard:", error);
        response.status(500).send("Error loading your visualization dashboard.");
    }
};

// Export all the beautifully named controllers 📦
module.exports = {
    renderUserTimetable,
    updateUserProgress,
    renderProgressDashboard
};