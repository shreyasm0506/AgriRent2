const mongoose = require("mongoose");

const CATEGORIES = ["tractor", "harvestor", "rotavator", "cultivator", "sprayer", "trailer"];
const AVAILABILITY_STATUSES = ["available", "limited", "booked"];

const equipmentSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        category: { type: String, enum: CATEGORIES, required: true },
        owner: { type: String, required: true },
        pricePerDay: { type: Number, required: true, min: 0 },
        location: { type: String, required: true },
        description: { type: String, default: "" },
        specs: { type: [String], default: [] },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        reviewCount: { type: Number, default: 0 },
        available: { type: Boolean, default: true },
        availabilityStatus: {
            type: String,
            enum: AVAILABILITY_STATUSES,
            default: "available",
        },
        availabilityLabel: { type: String, default: "Available today" },
    },
    { timestamps: true }
);

equipmentSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Equipment", equipmentSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.AVAILABILITY_STATUSES = AVAILABILITY_STATUSES;
