const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require("dotenv").config()
const express = require("express")
const connectDB = require("./connect")
const route = require("./Route/route")
const path = require("path")
const app = express()

app.set("view engine", "ejs")

app.set("views", path.join(process.cwd(), "View"));

app.use(express.urlencoded({ extended: true }))

// MongoDB Connection
connectDB()

app.use("/", route)

app.listen(
    process.env.PORT || 5000,
    () => console.log(`Server Started at port ${process.env.PORT}`)
)

module.exports = app;