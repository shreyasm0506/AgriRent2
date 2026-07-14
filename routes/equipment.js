const express = require("express");
const router = express.Router();
const Equipment = require("../models/Equipment");

// GET /api/equipment
// Supports filtering via query params:
//   category   - e.g. "tractor" (comma-separated for multiple)
//   q          - free text search across name/description
//   minPrice   - number
//   maxPrice   - number
//   availability - "available" to only return in-stock items
//   sort       - "price_asc" | "price_desc" | "rating"
router.get("/", async (req, res) => {
    try {
        const { category, q, minPrice, maxPrice, availability, sort } = req.query;
        const filter = {};

        if (category) {
            const categories = category.split(",").map((c) => c.trim()).filter(Boolean);
            if (categories.length) filter.category = { $in: categories };
        }

        if (minPrice || maxPrice) {
            filter.pricePerDay = {};
            if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
            if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
        }

        if (availability === "available") {
            filter.available = true;
        }

        if (q) {
            filter.$or = [
                { name: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } },
                { location: { $regex: q, $options: "i" } },
            ];
        }

        let query = Equipment.find(filter);

        switch (sort) {
            case "price_asc":
                query = query.sort({ pricePerDay: 1 });
                break;
            case "price_desc":
                query = query.sort({ pricePerDay: -1 });
                break;
            case "rating":
                query = query.sort({ rating: -1 });
                break;
            default:
                query = query.sort({ createdAt: -1 });
        }

        const equipment = await query.exec();
        res.json({ count: equipment.length, equipment });
    } catch (err) {
        console.error("Error fetching equipment:", err);
        res.status(500).json({ error: "Failed to fetch equipment" });
    }
});

// GET /api/equipment/:id
router.get("/:id", async (req, res) => {
    try {
        const item = await Equipment.findById(req.params.id);
        if (!item) return res.status(404).json({ error: "Equipment not found" });
        res.json(item);
    } catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({ error: "Invalid equipment id" });
        }
        console.error("Error fetching equipment:", err);
        res.status(500).json({ error: "Failed to fetch equipment" });
    }
});

// POST /api/equipment - create a new listing
router.post("/", async (req, res) => {
    try {
        const item = await Equipment.create(req.body);
        res.status(201).json(item);
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({ error: err.message });
        }
        console.error("Error creating equipment:", err);
        res.status(500).json({ error: "Failed to create equipment" });
    }
});

// PUT /api/equipment/:id - update a listing
router.put("/:id", async (req, res) => {
    try {
        const item = await Equipment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!item) return res.status(404).json({ error: "Equipment not found" });
        res.json(item);
    } catch (err) {
        if (err.name === "ValidationError" || err.name === "CastError") {
            return res.status(400).json({ error: err.message });
        }
        console.error("Error updating equipment:", err);
        res.status(500).json({ error: "Failed to update equipment" });
    }
});

// DELETE /api/equipment/:id
router.delete("/:id", async (req, res) => {
    try {
        const item = await Equipment.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ error: "Equipment not found" });
        res.json({ message: "Equipment deleted" });
    } catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({ error: "Invalid equipment id" });
        }
        console.error("Error deleting equipment:", err);
        res.status(500).json({ error: "Failed to delete equipment" });
    }
});

module.exports = router;
