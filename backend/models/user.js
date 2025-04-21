const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Store hashed passwords in production
    bookings: [{
        eventId: String,
        eventName: String,
        date: Date,
        
        ticketPrice: Number
    }]
});

module.exports = mongoose.model("User", userSchema);