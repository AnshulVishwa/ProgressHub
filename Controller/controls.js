const { INFO } = require("../Model/info");

async function getAllDetails(req, res) {
    try {
        const targetUsername = req.params.username;
        const userProgressHistory = await INFO.find({ username: targetUsername }).sort({ day: -1 });

        res.status(200).render("home", {
            userProgressList: userProgressHistory,
            username: targetUsername
        });
    } catch (error) {
        res.status(500).send("An error occurred while loading the dashboard: " + error.message + " 🛑");
    }
}

async function setUsername(req, res) {
    try {
        const newUsername = req.body.username;

        if (!newUsername) return res.status(400).send("A valid username is required! 🛑");

        const existingUser = await INFO.findOne({ username: newUsername });
        if (!existingUser) {
            await INFO.create({
                username: newUsername,
                day: "1",
                date: new Date().toLocaleDateString(),
                leetcodeNum: [],
                topics: [],
                questions: [],
                algorithms: []
            });
        }

        res.redirect(`/${newUsername}`);
    } catch (error) {
        res.status(500).send("Error creating user: " + error.message + " 🛑");
    }
}

async function createNewDay(req, res) {
    try {
        const targetUsername = req.params.username;
        const { day, topics, questions, algorithms, leetcodeNum } = req.body;

        if (!targetUsername || !day) return res.status(400).send("Both username and day are required! 🛑");

        // 🧹 DATA CLEANUP: Forcing everything into clean arrays!
        const cleanTopics = topics ? (Array.isArray(topics) ? topics : [topics]) : [];
        const cleanAlgorithms = algorithms ? (Array.isArray(algorithms) ? algorithms : [algorithms]) : [];
        const cleanLeetcodeNum = leetcodeNum ? (Array.isArray(leetcodeNum) ? leetcodeNum : [leetcodeNum]) : [];

        let cleanQuestions = [];
        if (questions) {
            if (Array.isArray(questions)) {
                cleanQuestions = questions;
            } else if (typeof questions === 'object') {
                // If Express parsed it as an object { "0": { q: "...", difficulty: "..." } }, extract the values!
                cleanQuestions = Object.values(questions);
            }
        }

        await INFO.create({
            username: targetUsername,
            day: String(day),
            date: new Date().toLocaleDateString(),
            leetcodeNum: cleanLeetcodeNum,
            topics: cleanTopics,
            questions: cleanQuestions,
            algorithms: cleanAlgorithms
        });

        res.redirect(`/${targetUsername}`);
    } catch (error) {
        res.status(500).send("Error creating a new day: " + error.message + " 🛑");
    }
}

async function updateDetails(req, res) {
    try {
        const targetUsername = req.params.username;
        const { day, topics, questions, algorithms, leetcodeNum } = req.body;

        const newUpdatesToPush = {};

        // 🚨 MONGODB RULE: You MUST use $each when pushing arrays, or it creates [object Object]!
        if (topics) {
            newUpdatesToPush.topics = { $each: Array.isArray(topics) ? topics : [topics] };
        }
        if (algorithms) {
            newUpdatesToPush.algorithms = { $each: Array.isArray(algorithms) ? algorithms : [algorithms] };
        }
        if (leetcodeNum) {
            newUpdatesToPush.leetcodeNum = { $each: Array.isArray(leetcodeNum) ? leetcodeNum : [leetcodeNum] };
        }
        if (questions) {
            let cleanQuestions = [];
            if (Array.isArray(questions)) {
                cleanQuestions = questions;
            } else if (typeof questions === 'object') {
                cleanQuestions = Object.values(questions);
            }
            if (cleanQuestions.length > 0) {
                newUpdatesToPush.questions = { $each: cleanQuestions };
            }
        }

        await INFO.findOneAndUpdate(
            { username: targetUsername, day: day },
            {
                $set: { date: new Date().toLocaleDateString() },
                $push: newUpdatesToPush
            },
            { new: true }
        );

        res.redirect(`/${targetUsername}`);
    } catch (error) {
        res.status(500).send("Error updating details: " + error.message + " 🛑");
    }
}

async function setLeetCodeNum(req, res) {
    try {
        const targetUsername = req.params.username;
        const { day, leetcodeNum } = req.body;

        const numList = Array.isArray(leetcodeNum) ? leetcodeNum : [leetcodeNum];

        await INFO.findOneAndUpdate(
            { username: targetUsername, day: day },
            { $push: { leetcodeNum: { $each: numList } } },
            { new: true }
        );

        res.redirect(`/${targetUsername}`);
    } catch (error) {
        res.status(500).send("Error updating LeetCode numbers: " + error.message + " 🛑");
    }
}

async function bulkInsertData(req, res) {
    try {
        const documentsArray = req.body;

        if (!Array.isArray(documentsArray) || documentsArray.length === 0) {
            return res.status(400).send("Invalid input: Please provide an array of documents to insert. 🛑");
        }

        await INFO.insertMany(documentsArray);
        res.status(201).send("All documents inserted successfully! 🎉");
    } catch (error) {
        res.status(500).send("Error bulk inserting data: " + error.message + " 🛑");
    }
}

module.exports = {
    getAllDetails,
    setUsername,
    updateDetails,
    createNewDay,
    setLeetCodeNum,
    bulkInsertData
};