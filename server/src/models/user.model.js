import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }, 
    role: {
        type: String,
        required: true,
        enum: [ "admin", "free-user", "premium-user", "creator"],
        default: "free-user"
    },
    creatorDetails: {
        approved: { type: Boolean, default: false },
        approvedAt: { type: Date, default: null },
    },
}, {timestamps: true} );
// timestamps: true adds createdAt and updatedAt fields to the schema

const User = mongoose.model("User", userSchema);

export { User }; // Named Export