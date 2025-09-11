const mongoose = require('mongoose');
const fs = require('fs');

// Import your models
const Reviews = require('./review');
const Dealerships = require('./dealership');

// Connect to your local MongoDB
mongoose.connect("mongodb://localhost:27017/", { dbName: 'finalproject' })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

(async () => {
  try {
    // Read JSON files from 'data' folder
    const reviews_data = JSON.parse(fs.readFileSync("./data/reviews.json", 'utf8'));
    const dealerships_data = JSON.parse(fs.readFileSync("./data/dealerships.json", 'utf8'));

    // Clear existing collections
    await Reviews.deleteMany({});
    await Dealerships.deleteMany({});

    // Insert data
    await Reviews.insertMany(reviews_data['reviews']);
    await Dealerships.insertMany(dealerships_data['dealerships']);

    console.log("✅ Data inserted successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Error inserting data:", error);
    process.exit(1);
  }
})();
