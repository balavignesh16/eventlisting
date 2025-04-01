const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/user");
const Event = require("./models/event");
const app = express();

app.use(express.static("../public"));
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect("mongodb+srv://balavigneshrxi:bala2006@eventlisting.7nzva.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB Atlas");
}).catch(err => {
    console.error("Failed to connect to MongoDB Atlas:", err);
});

// Register a new user
app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    console.log("Registration attempt:", { username, password });
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log("Username already exists:", username);
            return res.status(400).send("Username already exists");
        }
        const user = new User({ username, password });
        await user.save();
        console.log("User saved successfully:", username);
        res.status(201).send("User registered successfully");
    } catch (err) {
        console.error("Error registering user:", err);
        res.status(500).send("Error registering user");
    }
});

// Login a user
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    console.log("Login attempt:", { username, password });
    try {
        const user = await User.findOne({ username });
        if (!user || user.password !== password) {
            console.log("Login failed for:", username);
            return res.status(401).send("Invalid username or password");
        }
        console.log("Login successful for:", username);
        res.json({
            message: "Login successful",
            username: user.username,
            isAdmin: username === "admin" // Add isAdmin flag
        });
    } catch (err) {
        console.error("Error logging in:", err);
        res.status(500).send("Error logging in");
    }
});

// Get all events
app.get("/events", async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (err) {
        console.error("Error fetching events:", err);
        res.status(500).send("Error fetching events");
    }
});

// Add or update an event (admin only)
app.post("/events", async (req, res) => {
    const { username } = req.query; // Get username from query parameter
    if (username !== "admin") {
        return res.status(403).send("Forbidden: Only admin can add or update events");
    }

    const { eventId, name, date, day, ticketPrice, teamSize, genre, bannerUrl, description } = req.body;
    try {
        const existingEvent = await Event.findOne({ eventId });
        if (existingEvent) {
            await Event.updateOne({ eventId }, { name, date, day, ticketPrice, teamSize, genre, bannerUrl, description });
            console.log("Event updated:", eventId);
            res.status(200).send("Event updated successfully");
        } else {
            const event = new Event({ eventId, name, date, day, ticketPrice, teamSize, genre, bannerUrl, description });
            await event.save();
            console.log("Event added:", eventId);
            res.status(201).send("Event added successfully");
        }
    } catch (err) {
        console.error("Error adding/updating event:", err);
        res.status(500).send("Error adding/updating event");
    }
});

// Delete an event (admin only)
app.delete("/events/:eventId", async (req, res) => {
    const { username } = req.query; // Get username from query parameter
    if (username !== "admin") {
        return res.status(403).send("Forbidden: Only admin can delete events");
    }

    const { eventId } = req.params;
    try {
        const event = await Event.findOneAndDelete({ eventId });
        if (!event) {
            return res.status(404).send("Event not found");
        }
        // Remove the event from all users' bookings
        await User.updateMany(
            { "bookings.eventId": eventId },
            { $pull: { bookings: { eventId } } }
        );
        console.log("Event deleted:", eventId);
        res.status(200).send("Event deleted successfully");
    } catch (err) {
        console.error("Error deleting event:", err);
        res.status(500).send("Error deleting event");
    }
});

// Get registration details for an event (admin only)
app.get("/events/:eventId/registrations", async (req, res) => {
    const { username } = req.query; // Get username from query parameter
    if (username !== "admin") {
        return res.status(403).send("Forbidden: Only admin can view registrations");
    }

    const { eventId } = req.params;
    try {
        const users = await User.find({ "bookings.eventId": eventId });
        const registrations = users.map(user => ({
            username: user.username,
            eventName: user.bookings.find(booking => booking.eventId === eventId).eventName,
            date: user.bookings.find(booking => booking.eventId === eventId).date,
            ticketPrice: user.bookings.find(booking => booking.eventId === eventId).ticketPrice
        }));
        res.json({
            totalRegistrations: registrations.length,
            users: registrations
        });
    } catch (err) {
        console.error("Error fetching registrations:", err);
        res.status(500).send("Error fetching registrations");
    }
});

// Book an event (only for logged-in users)
app.post("/book", async (req, res) => {
    const { username, eventId } = req.body;
    if (!username) {
        console.log("Booking attempt failed: No username provided");
        return res.status(401).send("You must be logged in to book an event");
    }
    try {
        const user = await User.findOne({ username });
        const event = await Event.findOne({ eventId });
        if (!user || !event) {
            return res.status(404).send("User or event not found");
        }
        if (user.bookings.some(b => b.eventId === eventId)) {
            return res.status(400).send("Event already booked");
        }
        user.bookings.push({
            eventId: event.eventId,
            eventName: event.name,
            date: event.date,
            ticketPrice: event.ticketPrice
        });
        await user.save();
        console.log("Booking added for:", username, eventId);
        res.status(201).send("Event booked successfully");
    } catch (err) {
        console.error("Error booking event:", err);
        res.status(500).send("Error booking event");
    }
});
app.post("/bookings/cancel", async (req, res) => {
    const { username, eventId } = req.body;
    
    // Remove the booking from the database (Example: MongoDB or JSON file)
    const result = await bookingsCollection.deleteOne({ username, eventId });

    if (result.deletedCount > 0) {
        res.send("Booking canceled successfully.");
    } else {
        res.status(400).send("Failed to cancel booking or booking not found.");
    }
});


// Get user bookings
app.get("/bookings/:username", async (req, res) => {
    const { username } = req.params;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.json(user.bookings);
    } catch (err) {
        console.error("Error fetching bookings:", err);
        res.status(500).send("Error fetching bookings");
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));