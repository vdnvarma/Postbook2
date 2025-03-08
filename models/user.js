require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MongoDB URI is undefined! Check your environment variables.");
  process.exit(1);
}

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
  });

// Correct path relative to the `models` folder
const defaultImagePath = "./public/images/uploads/default.png";
let defaultImageBuffer = null;
let defaultImageType = "image/png"; // Change based on the file type

if (fs.existsSync(defaultImagePath)) {
  defaultImageBuffer = fs.readFileSync(defaultImagePath);
} else {
  console.error("❌ Default profile image not found at:", defaultImagePath);
}

// Define User Schema
const userSchema = mongoose.Schema({
  username: String,
  name: String,
  age: Number,
  email: String,
  password: String,
  profilepic: {
    data: { type: Buffer, default: defaultImageBuffer },
    contentType: { type: String, default: defaultImageType },
  },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "post" }],
});

module.exports = mongoose.model("user", userSchema);
