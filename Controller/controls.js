const { INFO } = require("../Model/info");

function parseListInput(value) {
    if (!value) return [];
    if (Array.isArray(value)) {
        return value.filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
    }

    return String(value)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

function parseNumberList(value) {
    return parseListInput(value)
        .map((item) => Number(item))
        .filter((item) => !Number.isNaN(item));
}

function buildQuestionEntries(questions, difficulty) {
    const questionItems = parseListInput(questions);
    if (!questionItems.length) return [];

    const normalizedDifficulty = difficulty || "Easy";
    return questionItems.map((question) => ({
        q: question,
        difficulty: normalizedDifficulty
    }));
}

async function getAllDetails(req, res) {
    try {
        const targetUsername = req.params.username;

        const userProgressHistory = await INFO.find({ username: targetUsername }).sort({ day: -1 });

        console.log("Fetched User Progress Data Successfully! 🎉");

        res.status(200).render("home", {
            userProgressList: userProgressHistory,
            username: targetUsername
        });
    } catch (error) {
        res.status(500).send("An error occurred while loading the dashboard: " + error.message + " 🛑");
    }
}

async function setLeetCodeNum(req, res) {
    try {
        const targetUsername = req.params.username;
        const { day, leetcodeNum } = req.body;
        const parsedNumbers = parseNumberList(leetcodeNum);

        if (!parsedNumbers.length) {
            return res.redirect(`/${targetUsername}`);
        }

        await INFO.findOneAndUpdate(
            { username: targetUsername, day: day },
            {
                $push: {
                    leetcodeNum: {
                        $each: parsedNumbers
                    }
                }
            },
            { new: true }
        );

        res.redirect(`/${targetUsername}`);
    } catch (error) {
        res.status(500).send("Error updating LeetCode numbers: " + error.message + " 🛑");
    }
}

async function setUsername(req, res) {
    try {
        const newUsername = req.body.username;

        if (!newUsername) {
            return res.status(400).send("A valid username is required! 🛑");
        }

        await INFO.create({
            username: newUsername,
            day: "1",
            date: new Date().toLocaleDateString(),
            leetcodeNum: [],
            topics: [],
            questions: [],
            algorithms: []
        });

        res.redirect(`/${newUsername}`);
    } catch (error) {
        res.status(500).send("Error creating user: " + error.message + " 🛑");
    }
}

async function updateDetails(req, res) {
    try {
        const targetUsername = req.params.username;
        const { day, topics, questions, algorithms, leetcodeNum, difficulty } = req.body;

        const pushOperations = {};
        if (topics) pushOperations.topics = { $each: parseListInput(topics) };
        if (questions) pushOperations.questions = { $each: buildQuestionEntries(questions, difficulty) };
        if (algorithms) pushOperations.algorithms = { $each: parseListInput(algorithms) };
        if (leetcodeNum) pushOperations.leetcodeNum = { $each: parseNumberList(leetcodeNum) };

        await INFO.findOneAndUpdate(
            { username: targetUsername, day: day },
            {
                $set: {
                    date: req.body.date || new Date().toLocaleDateString()
                },
                $push: pushOperations
            },
            { new: true }
        );

        res.redirect(`/${targetUsername}`);
    } catch (error) {
        res.status(500).send("Error updating details: " + error.message + " 🛑");
    }
}

async function createNewDay(req, res) {
    try {
        const targetUsername = req.params.username;
        const { day, topics, questions, algorithms, leetcodeNum, difficulty } = req.body;

        if (!targetUsername || !day) {
            return res.status(400).send("Both username and day are required! 🛑");
        }

        await INFO.create({
            username: targetUsername,
            day: String(day),
            date: req.body.date || new Date().toLocaleDateString(),
            leetcodeNum: parseNumberList(leetcodeNum),
            topics: parseListInput(topics),
            questions: buildQuestionEntries(questions, difficulty),
            algorithms: parseListInput(algorithms)
        });

        res.redirect(`/${targetUsername}`);
    } catch (error) {
        res.status(500).send("Error creating a new day: " + error.message + " 🛑");
    }
}

async function bulkInsertData(req, res) {
    try {
        const documentsArray = req.body;

        console.log("Received documents for bulk insertion:", documentsArray);

        if (!Array.isArray(documentsArray) || documentsArray.length === 0) {
            return res.status(400).send("Invalid input: Please provide an array of documents to insert. 🛑");
        }

        await INFO.insertMany(documentsArray);

        res.status(201).send("All documents inserted successfully! 🎉");
    } catch (error) {
        res.status(500).send("Error bulk inserting data: " + error.message + " 🛑");
    }
}

module.exports = { bulkInsertData, getAllDetails, setLeetCodeNum, setUsername, updateDetails, createNewDay };