// Connect to MongoDB
const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/miniproject", {
    useNewUrlParser: true,  // Parses MongoDB connection strings
    useUnifiedTopology: true // Uses the new server discovery and monitoring engine
}).then(() => {
    console.log("MongoDB connected successfully");
}).catch((err) => {
    console.error("MongoDB connection error:", err);
});


const userSchema = mongoose.Schema({
    username: String,
    name: String,
    age: Number,
    email: String,
    password: String,
    posts:[{type: mongoose.Schema.Types.ObjectId, ref: "post"}],  
});

module.exports = mongoose.model('user' , userSchema);




// // Define schema
// const userSchema = new mongoose.Schema({
//     username: { type: String, required: true },
//     name: { type: String, required: true },
//     age: { type: Number, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true }
//     posts: [
//         {type: mongoose.Schema.Types.ObjectId, ref: "post"}
//     ]
// });

// // Export the model
// module.exports = mongoose.model('user', userSchema);
