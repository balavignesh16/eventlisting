const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    eventId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    date: { type: Date, required: true },
    day: String,
    ticketPrice: Number,
    teamSize: Number,
    genre: String,
    bannerUrl: String,
    description: String
});

module.exports = mongoose.model("Event", eventSchema);