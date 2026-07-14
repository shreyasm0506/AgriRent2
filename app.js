require("./db");

const express = require("express");
const path = require("path");
const app = express();

// Body-parsing middleware MUST come before any routes that read req.body.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets (css/js/images) from /public — resolved from this file's
// location so it works regardless of the working directory the server is started from.
app.use(express.static(path.join(__dirname, "public")));

// Mount API routes under /api/* so they don't collide with the page routes
// below (e.g. GET /api/equipment vs GET /equipment for the HTML page).
const equipmentRoutes = require("./routes/equipment");
app.use("/api/equipment", equipmentRoutes);

const bookingRoutes = require("./routes/booking");
app.use("/api/bookings", bookingRoutes);

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// Page routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});
app.get("/home", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});
app.get("/equipment", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "equipment.html"));
});
app.get("/book", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "booking.html"));
});
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "login.html"));
});
app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "register.html"));
});
app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "about.html"));
});
app.get("/contact", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "contact.html"));
});
app.get("/farmer-dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "farmer-dashboard.html"));
});
app.get("/owner-dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "owner-dashboard.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
});