// Fetch events from backend
async function fetchEvents() {
    try {
        const response = await fetch("http://localhost:3000/events");
        return await response.json();
    } catch (err) {
        console.error("Error fetching events:", err);
        return [];
    }
}

// Populate event grid
if (document.querySelector(".event-grid")) {
    fetchEvents().then(events => {
        const eventGrid = document.querySelector(".event-grid");
        events.forEach(event => {
            const tile = document.createElement("div");
            tile.classList.add("event-tile");
            tile.innerHTML = `
                <img src="${event.bannerUrl}" alt="${event.name}">
                <h3>${event.name}</h3>
            `;
            tile.addEventListener("click", () => {
                window.location.href = `event-details.html?id=${event.eventId}`;
            });
            eventGrid.appendChild(tile);
        });

        // Filter functionality
        document.querySelectorAll(".filter-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const genre = btn.dataset.genre;
                eventGrid.innerHTML = "";
                const filteredEvents = genre === "all" ? events : events.filter(e => e.genre === genre);
                filteredEvents.forEach(event => {
                    const tile = document.createElement("div");
                    tile.classList.add("event-tile");
                    tile.innerHTML = `
                        <img src="${event.bannerUrl}" alt="${event.name}">
                        <h3>${event.name}</h3>
                    `;
                    tile.addEventListener("click", () => {
                        window.location.href = `event-details.html?id=${event.eventId}`;
                    });
                    eventGrid.appendChild(tile);
                });
            });
        });
    });
}

// Event details page
if (document.querySelector(".event-details")) {
    fetchEvents().then(events => {
        const urlParams = new URLSearchParams(window.location.search);
        const eventId = urlParams.get("id");
        const event = events.find(e => e.eventId === eventId);
        if (event) {
            document.getElementById("banner").src = event.bannerUrl;
            document.getElementById("event-name").textContent = event.name;
            document.getElementById("event-date").textContent = new Date(event.date).toLocaleDateString();
            document.getElementById("event-day").textContent = event.day;
            document.getElementById("ticket-price").textContent = event.ticketPrice;
            document.getElementById("team-size").textContent = event.teamSize;
            document.getElementById("description").textContent = event.description;

            // Book event
            document.getElementById("book-btn").addEventListener("click", async () => {
                const username = localStorage.getItem("username");
                if (!username) {
                    alert("Please login to book an event!");
                    window.location.href = "login.html";
                    return;
                }
                try {
                    const response = await fetch("http://localhost:3000/book", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ username, eventId })
                    });
                    const result = await response.text();
                    if (response.ok) {
                        alert("Event booked successfully!");
                    } else {
                        alert(result);
                    }
                } catch (err) {
                    console.error("Booking error:", err);
                    alert("Error booking event");
                }
            });
        }
    });
}

// Registration form handler
if (document.getElementById("register-form")) {
    const registerForm = document.getElementById("register-form");
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            const result = await response.text();
            if (response.ok) {
                alert("Registration successful! Please login.");
                window.location.href = "login.html";
            } else {
                alert(result);
            }
        } catch (err) {
            console.error("Registration error:", err);
            alert("Error registering user");
        }
    });
}

// Login form handler
if (document.getElementById("login-form")) {
    const loginForm = document.getElementById("login-form");
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("username", data.username);
                alert("Login successful!");
                window.location.href = "profile.html";
            } else {
                alert("Invalid username or password");
            }
        } catch (err) {
            console.error("Login error:", err);
            alert("Error logging in");
        }
    });
}

// Profile page with bookings
if (document.querySelector(".profile")) {
    const username = localStorage.getItem("username");
    const bookingsList = document.querySelector(".bookings-list");
    if (!username) {
        bookingsList.innerHTML = "<p>Please login to see your bookings.</p>";
    } else {
        fetch(`http://localhost:3000/bookings/${username}`)
            .then(response => response.json())
            .then(bookings => {
                if (bookings.length === 0) {
                    bookingsList.innerHTML = `<p>Welcome, ${username}! No bookings yet.</p>`;
                } else {
                    bookings.forEach(booking => {
                        const item = document.createElement("div");
                        item.classList.add("booking-item");
                        item.innerHTML = `
                            <h3>${booking.eventName}</h3>
                            <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
                            <p><strong>Ticket Price:</strong> $${booking.ticketPrice}</p>
                        `;
                        bookingsList.appendChild(item);
                    });
                }
            })
            .catch(err => {
                console.error("Error fetching bookings:", err);
                bookingsList.innerHTML = "<p>Error loading bookings.</p>";
            });
    }
}