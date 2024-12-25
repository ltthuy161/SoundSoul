import express from "express";
import { User } from "../models/user.model.js";
import { createSong, deleteSong, playSong, getAllSongs } from "../controller/admin.controller.js";
import { get } from "mongoose";
const router = express.Router();

// Get all users (admin only)
// router.get("/users", protectedRoute, async (req, res) => {
//     try {
//         const users = await User.find({}, "-password");
//         res.status(200).json(users);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// });
router.get("/songs", getAllSongs);
router.get("/songs/:id", playSong);
router.post("/songs", createSong);
router.delete("/songs/:id", deleteSong);
export default router;