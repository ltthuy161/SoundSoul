import express from "express";
import { User } from "../models/user.model.js";
import {
    createSong,
    deleteSong,
    playSong,
    getAllSongs,
    createPlaylist,
    addSongToPlaylist,
    getPlaylists,
    getPlaylistById,
    removeSongFromPlaylist
} from "../controller/admin.controller.js";
import { get } from "mongoose";

const router = express.Router();

// Song Routes
router.get("/songs", getAllSongs);
router.get("/songs/:id", playSong);
router.post("/songs", createSong);
router.delete("/songs/:id", deleteSong);

// Playlist Routes
router.post("/playlists", createPlaylist); // Create a new playlist
router.get("/playlists", getPlaylists); // Get all playlists
router.get("/playlists/:id", getPlaylistById);
router.post("/playlists/:playlistId/songs/:songId", addSongToPlaylist); // Add a song to a playlist
router.delete("/playlists/:playlistId/songs/:songId", removeSongFromPlaylist); // Remove a song from a playlist

export default router;
