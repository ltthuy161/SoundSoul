import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        fullname: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            required: true,
            enum: ["admin", "free-user", "premium-user", "creator"],
            default: "free-user",
        },
        creatorDetails: {
            approved: { type: Boolean, default: false },
            approvedAt: { type: Date, default: null },
        },
        // Fields for password reset functionality
        resetPasswordToken: {
            type: String,
            default: null, // Initialize as null
        },
        resetPasswordExpires: {
            type: Date,
            default: null, // Initialize as null
        },
        emailVerificationToken: { type: String },
        emailVerificationExpires: { type: Date },
        isEmailVerified: { type: Boolean, default: false },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);

const User = mongoose.model("User", userSchema);

export { User }; // Named Export