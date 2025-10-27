const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, "public")));


// In-memory storage
let reviews = [];
let idCounter = 1;

// Create a new review
app.post("/reviews", (req, res) => {
  const { employeeName, reviewer, metrics, comments } = req.body;
  if (!employeeName || !reviewer || !metrics) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const newReview = {
    id: idCounter++,
    employeeName,
    reviewer,
    metrics,
    comments: comments || "",
    createdAt: new Date(),
    updatedAt: new Date()
  };

  reviews.push(newReview);
  res.status(201).json(newReview);
});

// Get all reviews
app.get("/reviews", (req, res) => {
  res.json(reviews);
});

// Get review by ID
app.get("/reviews/:id", (req, res) => {
  const review = reviews.find(r => r.id == req.params.id);
  if (!review) return res.status(404).json({ message: "Review not found" });
  res.json(review);
});

// Update review
app.put("/reviews/:id", (req, res) => {
  const review = reviews.find(r => r.id == req.params.id);
  if (!review) return res.status(404).json({ message: "Review not found" });

  const { employeeName, reviewer, metrics, comments } = req.body;
  if (employeeName) review.employeeName = employeeName;
  if (reviewer) review.reviewer = reviewer;
  if (metrics) review.metrics = metrics;
  if (comments !== undefined) review.comments = comments;
  review.updatedAt = new Date();

  res.json(review);
});

// Delete review
app.delete("/reviews/:id", (req, res) => {
  const index = reviews.findIndex(r => r.id == req.params.id);
  if (index === -1) return res.status(404).json({ message: "Review not found" });
  reviews.splice(index, 1);
  res.json({ message: "Review deleted" });
});

// Root route
app.get("/", (req, res) => {
  res.send("Employee Performance Review System API is running.");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});