// Theme Toggle Functionality
function toggleTheme() {
    const htmlElement = document.documentElement;
    const themeIcon = document.getElementById('theme-icon');
    const currentTheme = htmlElement.getAttribute('data-theme');
    
    if (currentTheme === 'light') {
        htmlElement.setAttribute('data-theme', 'dark');
        themeIcon.src = 'https://img.icons8.com/ios-filled/50/ffffff/moon-symbol.png';
        localStorage.setItem('theme', 'dark');
    } else {
        htmlElement.setAttribute('data-theme', 'light');
        themeIcon.src = 'https://img.icons8.com/ios-filled/50/ffffff/sun.png';
        localStorage.setItem('theme', 'light');
    }
}

// Load Saved Theme on Page Load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.src = savedTheme === 'light' 
            ? 'https://img.icons8.com/ios-filled/50/ffffff/sun.png' 
            : 'https://img.icons8.com/ios-filled/50/ffffff/moon-symbol.png';
    }
    updateNavBar();
});

// Function to update navigation bar
function updateNavBar() {
    const navBar = document.getElementById("nav-bar");
    const username = localStorage.getItem("username");
    if (username) {
        navBar.innerHTML = `
            <a href="index.html">Home</a>
            <a href="profile.html">Profile</a>
            ${username === "admin" ? '<a href="admin.html">Admin</a>' : ''}
            <a href="#" id="logout-link">Logout</a>
            <button class="theme-toggle" aria-label="Toggle Dark Mode" onclick="toggleTheme()">
                <img src="https://img.icons8.com/ios-filled/50/ffffff/sun.png" alt="Toggle Theme" id="theme-icon">
            </button>
        `;
        document.getElementById("logout-link").addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("username");
            localStorage.removeItem("isAdmin");
            alert("Logged out successfully!");
            window.location.href = "login.html";
        });
    } else {
        navBar.innerHTML = `
            <a href="index.html">Home</a>
            <a href="profile.html">Profile</a>
            <a href="login.html">Login</a>
            <a href="register.html">Register</a>
            <button class="theme-toggle" aria-label="Toggle Dark Mode" onclick="toggleTheme()">
                <img src="https://img.icons8.com/ios-filled/50/ffffff/sun.png" alt="Toggle Theme" id="theme-icon">
            </button>
        `;
    }

    const savedTheme = localStorage.getItem('theme') || 'light';
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.src = savedTheme === 'light' 
            ? 'https://img.icons8.com/ios-filled/50/ffffff/sun.png' 
            : 'https://img.icons8.com/ios-filled/50/ffffff/moon-symbol.png';
    }
}

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

// Populate event grid with search, genre, and college filtering
if (document.querySelector(".event-grid")) {
    let allEvents = [];
    let selectedGenre = "all";
    let selectedCollege = "all";

    fetchEvents().then(events => {
        allEvents = events;
        displayEvents(allEvents, selectedGenre, selectedCollege);

        // Show filter container on page load
        const filterContainer = document.querySelector(".filter-container");
        if (filterContainer) {
            filterContainer.style.display = "block";
        }

        // Genre selection (buttons)
        document.querySelectorAll(".filter-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                selectedGenre = btn.dataset.genre;
                document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                displayEvents(allEvents, selectedGenre, selectedCollege);
            });
        });

        // Default genre to "All"
        const allGenreBtn = document.querySelector(".filter-btn[data-genre='all']");
        if (allGenreBtn) {
            allGenreBtn.classList.add("active");
        }

        // College selection (buttons)
        document.querySelectorAll(".college-icon").forEach(btn => {
            btn.addEventListener("click", () => {
                selectedCollege = btn.dataset.college;
                document.querySelectorAll(".college-icon").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                displayEvents(allEvents, selectedGenre, selectedCollege);
            });
        });

        // Default college to "All"
        const allCollegeBtn = document.querySelector(".college-icon[data-college='all']");
        if (allCollegeBtn) {
            allCollegeBtn.classList.add("active");
        }

        // Search functionality
        const searchInput = document.getElementById("event-search");
        if (searchInput) {
            searchInput.addEventListener("input", () => {
                const searchTerm = searchInput.value.toLowerCase();
                let filteredEvents = allEvents;
                if (selectedCollege !== "all") {
                    filteredEvents = filteredEvents.filter(event => event.college === selectedCollege);
                }
                if (selectedGenre !== "all") {
                    filteredEvents = filteredEvents.filter(event => event.genre === selectedGenre);
                }
                filteredEvents = filteredEvents.filter(event =>
                    event.name.toLowerCase().includes(searchTerm) ||
                    (event.genre && event.genre.toLowerCase().includes(searchTerm)) ||
                    (event.college && event.college.toLowerCase().includes(searchTerm))
                );
                displayEvents(filteredEvents, selectedGenre, selectedCollege);
            });
        }
    });

    function displayEvents(events, genre, college) {
        const eventGrid = document.querySelector(".event-grid");
        eventGrid.innerHTML = '';
        let filteredEvents = [...events]; // Create a copy to avoid mutating the original
        if (college !== "all") {
            filteredEvents = filteredEvents.filter(event => event.college === college);
        }
        if (genre !== "all") {
            filteredEvents = filteredEvents.filter(event => event.genre === genre);
        }
        if (filteredEvents.length > 0) {
            filteredEvents.forEach(event => {
                const tile = document.createElement("div");
                tile.classList.add("event-tile");
                tile.innerHTML = `
                    <img src="${event.bannerUrl}" alt="${event.name}">
                    <div class="event-info">
                        <h3>${event.name}</h3>
                        <p>${event.description || "Join us for an exciting event!"}</p>
                        <p><strong>College:</strong> ${event.college}</p>
                        <p><strong>Genre:</strong> ${event.genre || "General"}</p>
                    </div>
                `;
                tile.addEventListener("click", () => {
                    window.location.href = `event-details.html?id=${event.eventId}`;
                });
                eventGrid.appendChild(tile);
            });
        } else {
            eventGrid.innerHTML = "<p>No events available.</p>";
        }
    }
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

            const bookBtn = document.getElementById("book-btn");
            const username = localStorage.getItem("username");
            if (!username) {
                bookBtn.disabled = true;
                bookBtn.textContent = "Login to Book";
                bookBtn.style.backgroundColor = "#ccc";
                bookBtn.style.cursor = "not-allowed";
                const loginPrompt = document.createElement("p");
                loginPrompt.innerHTML = 'Please <a href="login.html">login</a> to book this event.';
                document.querySelector(".event-details").appendChild(loginPrompt);
            } else {
                bookBtn.addEventListener("click", async () => {
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
                localStorage.setItem("isAdmin", data.isAdmin);
                alert("Login successful!");
                if (data.isAdmin) {
                    window.location.href = "admin.html";
                } else {
                    window.location.href = "index.html";
                }
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
                    bookingsList.innerHTML = "";

                    bookings.forEach(booking => {
                        const item = document.createElement("div");
                        item.classList.add("booking-item");
                        item.innerHTML = `
                            <h3>${booking.eventName}</h3>
                            <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
                            <p><strong>Ticket Price:</strong> $${booking.ticketPrice}</p>
                            <button class="cancel-btn" data-event-id="${booking.eventId}">Cancel Booking</button>
                        `;
                        bookingsList.appendChild(item);
                    });

                    document.querySelectorAll(".cancel-btn").forEach(button => {
                        button.addEventListener("click", (e) => {
                            const eventId = e.target.getAttribute("data-event-id");
                            cancelBooking(eventId);
                        });
                    });
                }
            })
            .catch(err => {
                console.error("Error fetching bookings:", err);
                bookingsList.innerHTML = "<p>Error loading bookings.</p>";
            });
    }
}

// Admin Page Logic
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin.html')) {
        checkAdminAccess();
        loadEvents();
        setupAddEventForm();
        setupEditForm();
    }
});

// Check if the user is an admin
function checkAdminAccess() {
    const username = localStorage.getItem('username');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const adminContent = document.querySelector('.admin-content');
    const accessDenied = document.querySelector('.access-denied');

    if (!username || !isAdmin) {
        accessDenied.style.display = 'block';
        adminContent.style.display = 'none';
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    } else {
        accessDenied.style.display = 'none';
        adminContent.style.display = 'block';
    }
}

// Fetch and display all events with registration details
function loadEvents() {
    fetch('http://localhost:3000/events')
        .then(response => response.json())
        .then(events => {
            const eventsContainer = document.getElementById('events-container');
            eventsContainer.innerHTML = '';

            events.forEach(event => {
                const eventItem = document.createElement('div');
                eventItem.classList.add('event-item');
                eventItem.innerHTML = `
                    <div>
                        <h4>${event.name}</h4>
                        <p>Date: ${new Date(event.date).toLocaleDateString()}</p>
                        <p>Ticket Price: $${event.ticketPrice}</p>
                        <p>College: ${event.college}</p>
                        <p>${event.description}</p>
                        <div class="registrations" id="registrations-${event.eventId}">
                            <h5>Registrations: <span>Loading...</span></h5>
                            <ul></ul>
                        </div>
                    </div>
                    <div class="actions">
                        <button class="admin-btn edit" onclick="editEvent('${event.eventId}')">Edit</button>
                        <button class="admin-btn delete" onclick="deleteEvent('${event.eventId}')">Delete</button>
                        <button class="admin-btn view-registrations" onclick="loadRegistrations('${event.eventId}')">View Registrations</button>
                    </div>
                `;
                eventsContainer.appendChild(eventItem);
                loadRegistrations(event.eventId);
            });
        })
        .catch(error => console.error('Error fetching events:', error));
}

// Load registration details for an event
function loadRegistrations(eventId) {
    const username = localStorage.getItem('username');
    fetch(`http://localhost:3000/events/${eventId}/registrations?username=${username}`)
        .then(response => response.json())
        .then(data => {
            const registrationsDiv = document.getElementById(`registrations-${eventId}`);
            const span = registrationsDiv.querySelector('span');
            const ul = registrationsDiv.querySelector('ul');

            span.textContent = data.totalRegistrations;
            ul.innerHTML = '';

            data.users.forEach(user => {
                const li = document.createElement('li');
                li.textContent = `Username: ${user.username}, College: ${user.college}`;
                ul.appendChild(li);
            });
        })
        .catch(error => console.error('Error fetching registrations:', error));
}

// Setup the Add Event form
function setupAddEventForm() {
    const addEventForm = document.getElementById('add-event-form');
    addEventForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(addEventForm);
        const eventData = {
            eventId: Date.now().toString(),
            name: formData.get('name'),
            date: formData.get('date'),
            day: new Date(formData.get('date')).toLocaleDateString('en-US', { weekday: 'long' }),
            ticketPrice: parseFloat(formData.get('price')),
            teamSize: formData.get('teamSize') || "1",
            genre: formData.get('genre') || "General",
            college: formData.get('college') || "Unknown",
            bannerUrl: formData.get('bannerUrl') || "https://via.placeholder.com/300x150",
            description: formData.get('description')
        };

        addEvent(eventData);
    });
}

// Add or update an event
function addEvent(eventData) {
    const username = localStorage.getItem('username');
    fetch(`http://localhost:3000/events?username=${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
    })
        .then(response => {
            if (response.ok) {
                document.getElementById('add-event-form').reset();
                loadEvents();
                alert("Event added successfully!");
            } else {
                response.text().then(text => alert("Error adding event: " + text));
            }
        })
        .catch(error => console.error('Error adding event:', error));
}

// Setup the Edit Event form
function setupEditForm() {
    const editForm = document.getElementById('edit-event-form');
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const eventId = document.getElementById('edit-event-id').value;
        if (!eventId) {
            alert("Error: No event ID found for editing.");
            return;
        }

        const eventData = {
            eventId,
            name: document.getElementById('edit-event-name').value.trim(),
            date: document.getElementById('edit-event-date').value,
            day: new Date(document.getElementById('edit-event-date').value).toLocaleDateString('en-US', { weekday: 'long' }),
            ticketPrice: parseFloat(document.getElementById('edit-event-price').value) || 0,
            teamSize: document.getElementById('edit-event-team-size').value.trim() || "1",
            genre: document.getElementById('edit-event-genre').value.trim() || "General",
            college: document.getElementById('edit-event-college').value.trim() || "Unknown",
            bannerUrl: document.getElementById('edit-event-banner-url').value.trim() || "https://via.placeholder.com/300x150",
            description: document.getElementById('edit-event-description').value.trim()
        };

        console.log("Sending update data:", eventData);
        updateEvent(eventData);
    });
}

// Edit an event
function editEvent(eventId) {
    console.log("Editing event with ID:", eventId);
    fetch(`http://localhost:3000/events`)
        .then(response => response.json())
        .then(events => {
            const event = events.find(e => e.eventId === eventId);
            if (event) {
                console.log("Found event:", event);
                document.getElementById('edit-event-id').value = event.eventId;
                document.getElementById('edit-event-name').value = event.name;
                document.getElementById('edit-event-date').value = event.date.split('T')[0];
                document.getElementById('edit-event-price').value = event.ticketPrice;
                document.getElementById('edit-event-team-size').value = event.teamSize;
                document.getElementById('edit-event-genre').value = event.genre || "";
                document.getElementById('edit-event-college').value = event.college || "";
                document.getElementById('edit-event-banner-url').value = event.bannerUrl;
                document.getElementById('edit-event-description').value = event.description || "";
                document.getElementById('edit-form-container').style.display = 'block';
            } else {
                console.error("Event not found with ID:", eventId);
                alert("Event not found.");
            }
        })
        .catch(error => console.error('Error fetching event:', error));
}

// Update an event
function updateEvent(eventData) {
    const username = localStorage.getItem('username');
    fetch(`http://localhost:3000/events?username=${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
    })
        .then(response => {
            console.log("Update response status:", response.status);
            if (response.ok) {
                document.getElementById('edit-form-container').style.display = 'none';
                loadEvents();
                alert("Event updated successfully!");
            } else {
                response.text().then(text => {
                    console.error("Update error response:", text);
                    alert("Error updating event: " + text);
                });
            }
        })
        .catch(error => console.error('Error updating event:', error));
}

// Cancel edit
function cancelEdit() {
    document.getElementById('edit-form-container').style.display = 'none';
    document.getElementById('edit-event-form').reset();
}

// Delete an event
function deleteEvent(eventId) {
    if (window.confirm("Are you sure you want to delete this event?")) {
        const username = localStorage.getItem('username');
        fetch(`http://localhost:3000/events/${eventId}?username=${username}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    loadEvents();
                    alert("Event deleted successfully!");
                } else {
                    alert("Error deleting event");
                }
            })
            .catch(error => console.error('Error deleting event:', error));
    }
}

function cancelBooking(eventId) {
    const username = localStorage.getItem("username");

    if (confirm("Are you sure you want to cancel this booking?")) {
        console.log("Attempting to cancel booking for eventId:", eventId, "with username:", username);
        fetch("http://localhost:3000/bookings/cancel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, eventId })
        })
            .then(response => {
                console.log("Cancel booking response status:", response.status);
                return response.text();
            })
            .then(result => {
                console.log("Cancel booking response text:", result);
                if (result === "Booking canceled successfully") {
                    alert("Booking canceled successfully!");
                    location.reload();
                    // Alternative: Uncomment and use loadBookings() for smooth update
                    // loadBookings();
                } else {
                    alert(result);
                }
            })
            .catch(err => {
                console.error("Error canceling booking:", err);
                alert("Error canceling booking");
            });
    }
}

// Optional: Add loadBookings function for smooth update
function loadBookings() {
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
                    bookingsList.innerHTML = "";

                    bookings.forEach(booking => {
                        const item = document.createElement("div");
                        item.classList.add("booking-item");
                        item.innerHTML = `
                            <h3>${booking.eventName}</h3>
                            <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
                            <p><strong>Ticket Price:</strong> $${booking.ticketPrice}</p>
                            <button class="cancel-btn" data-event-id="${booking.eventId}">Cancel Booking</button>
                        `;
                        bookingsList.appendChild(item);
                    });

                    document.querySelectorAll(".cancel-btn").forEach(button => {
                        button.addEventListener("click", (e) => {
                            const eventId = e.target.getAttribute("data-event-id");
                            cancelBooking(eventId);
                        });
                    });
                }
            })
            .catch(err => {
                console.error("Error fetching bookings:", err);
                bookingsList.innerHTML = "<p>Error loading bookings.</p>";
            });
    }
}
document.getElementById('heading').addEventListener('click', function() {
    window.location.href = 'index.html';
});