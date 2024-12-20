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
    }
}, {timestamps: true} );
// timestamps: true adds createdAt and updatedAt fields to the schema

export const User = mongoose.model("User", userSchema);