const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3030;

app.use(cors());
app.use(require('body-parser').urlencoded({ extended: false }));

const reviews_data = JSON.parse(fs.readFileSync("./data/reviews.json", 'utf8'));
const dealerships_data = JSON.parse(fs.readFileSync("./data/dealerships.json", 'utf8'));

mongoose.connect("mongodb://mongo_db:27017/", { 'dbName': 'dealershipsDB' });

const Reviews = require('./review');
const Dealerships = require('./dealership');

// Initialize DB data
(async () => {
  try {
    await Reviews.deleteMany({});
    await Reviews.insertMany(reviews_data['reviews']);

    await Dealerships.deleteMany({});
    await Dealerships.insertMany(dealerships_data['dealerships']);
  } catch (error) {
    console.error("Error initializing DB:", error);
  }
})();

// Home route
app.get('/', (req, res) => {
  res.json({ status: 200, message: "Welcome to the Mongoose API" });
});

// Fetch all reviews
app.get('/fetchReviews', async (req, res) => {
  try {
    const documents = await Reviews.find();
    res.json({ status: 200, reviews: documents });
  } catch (error) {
    res.status(500).json({ status: 500, error: 'Error fetching reviews' });
  }
});

// Fetch reviews by dealer
app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const documents = await Reviews.find({ dealership: req.params.id });
    res.json({ status: 200, reviews: documents });
  } catch (error) {
    res.status(500).json({ status: 500, error: 'Error fetching reviews for dealer' });
  }
});

// Fetch all dealerships
app.get('/fetchDealers', async (req, res) => {
  try {
    const dealers = await Dealerships.find();
    res.json({ status: 200, dealers });
  } catch (error) {
    res.status(500).json({ status: 500, error: 'Error fetching dealerships' });
  }
});

// Fetch dealers by state
app.get('/fetchDealers/:state', async (req, res) => {
  const state = req.params.state;
  try {
    const dealers = await Dealerships.find({ state: new RegExp(`^${state}$`, 'i') });
    if (dealers.length === 0) {
      return res.status(404).json({ status: 404, message: `No dealers found in ${state}` });
    }
    res.json({ status: 200, dealers });
  } catch (error) {
    res.status(500).json({ status: 500, error: 'Error fetching dealerships by state' });
  }
});

// Fetch dealer by id
app.get('/fetchDealer/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const dealer = await Dealerships.findOne({ id });
    if (!dealer) {
      return res.status(404).json({ status: 404, message: `Dealer with id ${id} not found` });
    }
    res.json({ status: 200, dealer: [dealer] }); // wrap in array for frontend
  } catch (error) {
    res.status(500).json({ status: 500, error: 'Error fetching dealer' });
  }
});

// Insert review
app.post('/insert_review', express.raw({ type: '*/*' }), async (req, res) => {
  try {
    const data = JSON.parse(req.body);
    const documents = await Reviews.find().sort({ id: -1 });
    const new_id = documents.length > 0 ? documents[0]['id'] + 1 : 1;

    const review = new Reviews({
      id: new_id,
      name: data['name'],
      dealership: data['dealership'],
      review: data['review'],
      purchase: data['purchase'],
      purchase_date: data['purchase_date'],
      car_make: data['car_make'],
      car_model: data['car_model'],
      car_year: data['car_year'],
    });

    const savedReview = await review.save();
    res.json({ status: 200, review: savedReview });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, error: 'Error inserting review' });
  }
});

// Catch-all 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ status: 404, error: "Route not found" });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
