const express = require("express");
const { getTimetableDashboard, renderLogTimetableDay, createNewTimetableDay } = require("../Controller/timetable");
const Router = express.Router();

Router.get("/dashboard/:username", getTimetableDashboard);
Router.get("/:username/new", renderLogTimetableDay);
Router.post("/:username/new", createNewTimetableDay);

module.exports = Router;