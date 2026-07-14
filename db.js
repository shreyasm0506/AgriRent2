require("dotenv").config();
const mongoose = require("mongoose");

if (!process.env.MONGOURL) {
    console.error("❌ MONGOURL is not set. Check your .env file.");
    process.exit(1);
}

mongoose.connect(process.env.MONGOURL, {
        serverSelectionTimeoutMS: 10000,
    })
    .then(() => {
        console.log("✅ MongoDB Connected");
    })
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err);
    });

module.exports = mongoose;