const fs = require("fs");
const path = require("path");

// Load default image as Buffer
const defaultImagePath = path.join("./images", "default.png");
const defaultImage = fs.readFileSync(defaultImagePath);

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
