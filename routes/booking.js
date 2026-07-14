const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Equipment = require("../models/Equipment");

function msToDays(ms) {
    return Math.round(ms / (1000 * 60 * 60 * 24));
}

// POST /api/bookings - create a new booking request
router.post("/", async (req, res) => {
    try {
        const { equipmentId, renterName, renterPhone, renterEmail, startDate, endDate } = req.body;

        if (!equipmentId || !mongoose.Types.ObjectId.isValid(equipmentId)) {
            return res.status(400).json({ error: "A valid equipmentId is required" });
        }
        if (!renterName || !renterPhone) {
            return res.status(400).json({ error: "Name and phone are required" });
        }
        if (!startDate || !endDate) {
            return res.status(400).json({ error: "Start and end dates are required" });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (isNaN(start) || isNaN(end)) {
            return res.status(400).json({ error: "Invalid date format" });
        }
        if (start < today) {
            return res.status(400).json({ error: "Start date cannot be in the past" });
        }
        if (end < start) {
            return res.status(400).json({ error: "End date must be on or after the start date" });
        }

        const equipment = await Equipment.findById(equipmentId);
        if (!equipment) {
            return res.status(404).json({ error: "Equipment not found" });
        }
        if (!equipment.available) {
            return res.status(409).json({ error: "This equipment is not currently available" });
        }

        // Reject overlapping bookings that haven't been cancelled.
        const overlap = await Booking.findOne({
            equipmentId,
            status: { $ne: "Cancelled" },
            startDate: { $lte: end },
            endDate: { $gte: start },
        });
        if (overlap) {
            return res.status(409).json({ error: "Equipment is already booked for part of that date range" });
        }

        const days = msToDays(end - start) + 1; // inclusive of both start and end day
        const totalPrice = days * equipment.pricePerDay;

        const booking = await Booking.create({
            equipmentId,
            renterName,
            renterPhone,
            renterEmail,
            startDate: start,
            endDate: end,
            days,
            totalPrice,
        });

        res.status(201).json(booking);
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({ error: err.message });
        }
        console.error("Error creating booking:", err);
        res.status(500).json({ error: "Failed to create booking" });
    }
});

// GET /api/bookings/:id - fetch a single booking with equipment details
router.get("/:id", async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate("equipmentId");
        if (!booking) return res.status(404).json({ error: "Booking not found" });
        res.json(booking);
    } catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({ error: "Invalid booking id" });
        }
        console.error("Error fetching booking:", err);
        res.status(500).json({ error: "Failed to fetch booking" });
    }
});

// GET /api/bookings - list bookings, optionally filtered by equipmentId
router.get("/", async (req, res) => {
    try {
        const filter = {};
        if (req.query.equipmentId) filter.equipmentId = req.query.equipmentId;
        const bookings = await Booking.find(filter).populate("equipmentId").sort({ createdAt: -1 });
        res.json({ count: bookings.length, bookings });
    } catch (err) {
        console.error("Error fetching bookings:", err);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
});

// PUT /api/bookings/:id/status - update booking status (for owner dashboard later)
router.put("/:id/status", async (req, res) => {
    try {
        const { status } = req.body;
        if (!["Pending", "Confirmed", "Cancelled"].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }
        const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!booking) return res.status(404).json({ error: "Booking not found" });
        res.json(booking);
    } catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({ error: "Invalid booking id" });
        }
        console.error("Error updating booking:", err);
        res.status(500).json({ error: "Failed to update booking" });
    }
});

module.exports = router;
