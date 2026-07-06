const { INFO } = require("../Model/info");

async function getAllDetails(req, res) {
    try {
        const targetUsername = req.params.username;

        // 1. FIXED: Changed { day: 1 } to { day: -1 } for Descending Order! 📉
        const allUserProgressTracker = await INFO.find({ username: targetUsername }).sort({ day: -1 });

        console.log("Fetched Progress Data Successfully!");

        // Pass the entire array to the template 🔄
        res.status(200).render("home", { userProgressList: allUserProgressTracker, username: targetUsername });
    }
    catch (error) {
        res.status(500).send("An error occurred loading the dashboard: " + error.message);
    }
}

async function setUsername(req, res) {
    try {
        const newUsername = req.body.username;

        if (!newUsername) {
            return res.status(400).send("Username is required 🛑");
        }

        await INFO.create({
            username: newUsername,
            day: 1,
            date: new Date().toLocaleDateString(),
            topics: [],
            questions: [],
            algorithms: []
        });

        // 2. FIXED: Redirect to the user's home dashboard instead of showing JSON! 🏠
        res.redirect(`/${newUsername}`);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
}

async function updateDetails(req, res) {
    try {
        const targetUsername = req.params.username;
        const { day, topics, questions, algorithms } = req.body;

        await INFO.findOneAndUpdate(
            { username: targetUsername, day: day },
            {
                $set: {
                    date: new Date().toLocaleDateString()
                },
                $push: {
                    topics: topics,
                    questions: questions,
                    algorithms: algorithms
                }
            },
            { new: true } 
        );

        // 3. FIXED: Redirect back to the dashboard after updating! 🚀
        res.redirect(`/${targetUsername}`);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
}

async function createNewDay(req, res) {
    try {
        const targetUsername = req.params.username;
        const { day, topics, questions, algorithms } = req.body;

        if (!targetUsername || !day) {
            return res.status(400).send("Username and day are required 🛑");
        }

        await INFO.create({
            username: targetUsername,
            day: day,
            date: new Date().toLocaleDateString(),
            topics: topics || [],           
            questions: questions || [],
            algorithms: algorithms || []
        });

        // 4. FIXED: Redirect back to the dashboard after creating a new day! 🎉
        res.redirect(`/${targetUsername}`);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
}

module.exports = { getAllDetails, setUsername, updateDetails, createNewDay };