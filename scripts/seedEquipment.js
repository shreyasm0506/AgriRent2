// One-off script to (re)populate the Equipment collection with sample listings.
// Run with:  node scripts/seedEquipment.js
const mongoose = require("../db");
const Equipment = require("../models/Equipment");

const sampleEquipment = [
    {
        name: "Mahindra 575 Tractor",
        category: "tractor",
        owner: "Ravi Kumar",
        pricePerDay: 1200,
        location: "Mandya, Karnataka",
        description: "Reliable 45 HP 4WD tractor, well maintained, ideal for ploughing and tilling.",
        specs: ["45 HP", "4WD"],
        rating: 4,
        reviewCount: 128,
        available: true,
        availabilityStatus: "available",
        availabilityLabel: "Available today",
    },
    {
        name: "Heavy Duty Rotavator",
        category: "rotavator",
        owner: "Suresh Gowda",
        pricePerDay: 700,
        location: "Mysuru, Karnataka",
        description: "6 ft rotavator with 36 blades, great for soil preparation before sowing.",
        specs: ["6 ft", "36 blades"],
        rating: 5,
        reviewCount: 64,
        available: true,
        availabilityStatus: "available",
        availabilityLabel: "Available today",
    },
    {
        name: "Combine Harvester",
        category: "harvestor",
        owner: "Prakash Rao",
        pricePerDay: 3000,
        location: "Hassan, Karnataka",
        description: "Self-propelled John Deere combine harvester for fast, efficient grain harvesting.",
        specs: ["John Deere", "Self-propelled"],
        rating: 4,
        reviewCount: 41,
        available: true,
        availabilityStatus: "limited",
        availabilityLabel: "2 left this week",
    },
    {
        name: "Boom Sprayer 500L",
        category: "sprayer",
        owner: "Anita Desai",
        pricePerDay: 900,
        location: "Tumakuru, Karnataka",
        description: "500L capacity boom sprayer with 12m boom width, diesel powered.",
        specs: ["12 m boom", "Diesel"],
        rating: 4,
        reviewCount: 37,
        available: true,
        availabilityStatus: "available",
        availabilityLabel: "Available today",
    },
    {
        name: "Disc Cultivator",
        category: "cultivator",
        owner: "Manjunath H.",
        pricePerDay: 650,
        location: "Bengaluru Rural, Karnataka",
        description: "9-disc cultivator for breaking up soil and clearing weeds efficiently.",
        specs: ["9 discs"],
        rating: 4,
        reviewCount: 23,
        available: false,
        availabilityStatus: "booked",
        availabilityLabel: "Booked till Fri",
    },
    {
        name: "Farm Trailer (2T)",
        category: "trailer",
        owner: "Lakshmi Naidu",
        pricePerDay: 500,
        location: "Kolar, Karnataka",
        description: "2-tonne hydraulic tipping trailer, suitable for transporting produce and equipment.",
        specs: ["Hydraulic tip"],
        rating: 3,
        reviewCount: 19,
        available: true,
        availabilityStatus: "available",
        availabilityLabel: "Available today",
    },
];

async function seed() {
    try {
        await mongoose.connection.asPromise();
        console.log("Clearing existing equipment...");
        await Equipment.deleteMany({});
        console.log(`Inserting ${sampleEquipment.length} equipment listings...`);
        await Equipment.insertMany(sampleEquipment);
        console.log("✅ Seed complete.");
    } catch (err) {
        console.error("❌ Seed failed:", err);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
