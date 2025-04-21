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
    description: String,
    college: { type: String, required: true } // Added college field
});

module.exports = mongoose.model("Event", eventSchema);
//Example insertion 
// {
//     "eventId": "3",
//     "name": "Sports Marathon",
//     "date": "2025-05-15T00:00:00Z",
//     "day": "Thursday",
//     "ticketPrice": 30,
//     "teamSize": 2,
//     "genre": "sports",
//     "bannerUrl": "https://via.placeholder.com/300x150.png?text=Marathon",
//     "description": "Run for glory in this annual marathon!"
//   }