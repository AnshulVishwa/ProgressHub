// routes/timetableRoutes.js
const express = require('express');
const tableRouter = express.Router();
const timetableController = require('../Controller/timetable');

// GET route to load and display the user's specific timetable

// GET route for the beautiful visualization dashboard 🎨
tableRouter.get('/dashboard/:username', timetableController.renderProgressDashboard);

tableRouter.get('/:username', timetableController.renderUserTimetable);
// POST route to handle form submissions and update the time spent
tableRouter.post('/update/:username', timetableController.updateUserProgress);

module.exports = tableRouter;