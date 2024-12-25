import mongoose from "mongoose";

const PlaylistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }], 
    createdAt: { type: Date, default: Date.now }
});

export const Playlist = mongoose.model("Playlist", PlaylistSchema);