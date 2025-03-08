require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI

if (!MONGO_URI) {
  console.error("❌ MongoDB URI is undefined! Check your environment variables.");
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(MONGO_URI).then(() => {
  console.log("✅ MongoDB Connected");
}).catch(err => {
  console.error("❌ MongoDB Connection Error:", err);
});

const userSchema = mongoose.Schema({
    username: String,
    name: String,
    age: Number,
    email: String,
    password: String,
    profilepic: {
        data: Buffer,
        contentType: String
    },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "post" }]
});

module.exports = mongoose.model("user", userSchema);
