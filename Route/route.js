const express = require("express");
const { getAllDetails, setUsername, updateDetails, createNewDay, setLeetCodeNum } = require("../Controller/controls");
const Router = express.Router();

Router.get("/", (req, res) => res.render("setUsername"));

Router.get("/:username", getAllDetails);
Router.post("/username", setUsername);

Router.get("/:username/newday", (req, res) => res.render("newday", { username: req.params.username }));

Router.get("/:username/update", (req, res) => res.render("update", { username: req.params.username }));

Router.post("/:username/update", updateDetails);
Router.post("/:username/newday", createNewDay);

Router.post("/:username/leetcode", setLeetCodeNum);



module.exports = Router;