const path = require("path");
const fs = require("fs");

// Correct path relative to the `models` folder
const defaultImagePath = path.join(__dirname, "./public/images/default.png");

let defaultImage;
try {
    defaultImage = fs.readFileSync(defaultImagePath);
} catch (err) {
    console.error("❌ Default image not found at:", defaultImagePath);
    process.exit(1);
}

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

// Middleware to set default profile picture if not provided
userSchema.pre("save", function (next) {
    if (!this.profilepic || !this.profilepic.data) {
        this.profilepic = {
            data: defaultImage,
            contentType: "image/png"
        };
    }
    next();
});

module.exports = mongoose.model("user", userSchema);
