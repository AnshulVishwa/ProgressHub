const { Schema, model } = require("mongoose")

const infoSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    day: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    topics: [{
        type: String,
    }],
    questions: [{
        type: String,
        required: true
    }],
    algorithms: [{
        type: String,
        required: true
    }]
})

const INFO = model("INFO", infoSchema)

module.exports = { INFO }