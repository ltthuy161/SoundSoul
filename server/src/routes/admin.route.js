import express from "express";
import { User } from "../models/user.model.js";

const router = express.Router();

// Get all users (admin only)
router.get("/users", protectedRoute, async (req, res) => {
    try {
        const users = await User.find({}, "-password");
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;