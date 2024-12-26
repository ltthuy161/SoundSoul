import { Song } from "../models/song.model.js";
import { Playlist } from "../models/playlist.model.js";
import cloudinary from "../lib/cloudinary.js";
import { parseFile } from "music-metadata";
export const playSong = async (req, res) => {
	try {
		const song = await Song.findById(req.params.id);
		if (!song) {
			return res.status(404).json({ message: "Song not found" });
		}

		res.status(200).json({
			title: song.title,
			artist: song.artist,
			audioUrl: song.audioUrl,
			imageUrl: song.imageUrl,
			duration: song.duration,
		});
	} catch (error) {
		res.status(500).json({ message: "Error fetching song", error });
	}
};

export const getAllSongs = async (req, res, next) => {
	try {
		const songs = await Song.find().sort({ createdAt: -1 });
		res.json(songs);
	} catch (error) {
		next(error);
	}
};

// Helper function for cloudinary uploads
const uploadToCloudinary = async (file) => {
	try {
		const result = await cloudinary.uploader.upload(file.tempFilePath, {
			resource_type: "auto",
		});
		return result.secure_url;
	} catch (error) {
		console.log("Error in uploadToCloudinary", error);
		throw new Error("Error uploading to cloudinary");
	}
};

export const createSong = async (req, res, next) => {
	try {
		if (!req.files || !req.files.audioFile || !req.files.imageFile) {
			return res.status(400).json({ message: "Please upload all files" });
		}

		const { title, artist } = req.body;
		const audioFile = req.files.audioFile;
		const imageFile = req.files.imageFile;

		const audioUrl = await uploadToCloudinary(audioFile);
		const imageUrl = await uploadToCloudinary(imageFile);

		const metadata = await parseFile(audioFile.tempFilePath);
		const durationInSeconds = Math.ceil(metadata.format.duration);
		const song = new Song({
			title,
			artist,
			audioUrl,
			imageUrl,
			duration: durationInSeconds,
		});

		await song.save();

		res.status(201).json(song);
	} catch (error) {
		console.log("Error in createSong", error);
		next(error);
	}
};

export const deleteSong = async (req, res, next) => {
	try {
		const { id } = req.params;

		const song = await Song.findById(id);
		if (!song) {
			return res.status(404).json({ message: "Song not found" });
		}

		await Song.findByIdAndDelete(id);
		res.status(200).json({ message: "Song deleted successfully" });
	} catch (error) {
		console.log("Error in deleteSong", error);
		next(error);
	}
};

export const checkAdmin = async (req, res, next) => {
	res.status(200).json({ admin: true });
};

// Playlist Endpoints
export const createPlaylist = async (req, res, next) => {
	try {
		const { name, description } = req.body;

		if (!name) {
			return res.status(400).json({ message: "Playlist name is required" });
		}

		const playlist = new Playlist({ name, description });
		await playlist.save();

		res.status(201).json({ message: "Playlist created successfully", playlist });
	} catch (error) {
		console.log("Error in createPlaylist", error);
		next(error);
	}
};

export const addSongToPlaylist = async (req, res, next) => {
	try {
		const { playlistId, songId } = req.params;

		// Find the playlist
		const playlist = await Playlist.findById(playlistId);
		if (!playlist) {
			return res.status(404).json({ message: "Playlist not found" });
		}

		// Find the song
		const song = await Song.findById(songId);
		if (!song) {
			return res.status(404).json({ message: "Song not found" });
		}

		// Check if the song already exists in the playlist
		if (playlist.songs.includes(songId)) {
			return res.status(400).json({ message: "Song already exists in the playlist" });
		}

		// Add the song to the playlist
		playlist.songs.push(songId);
		await playlist.save();

		res.status(200).json({ message: "Song added to playlist", playlist });
	} catch (error) {
		console.log("Error in addSongToPlaylist", error);
		next(error);
	}
};

// Get a specific playlist by ID
export const getPlaylistById = async (req, res, next) => {
	try {
		const { id } = req.params;

		const playlist = await Playlist.findById(id).populate("songs");
		if (!playlist) {
			return res.status(404).json({ message: "Playlist not found" });
		}

		res.status(200).json(playlist);
	} catch (error) {
		console.log("Error in getPlaylistById", error);
		next(error);
	}
};

export const getPlaylists = async (req, res, next) => {
	try {
		const playlists = await Playlist.find().populate("songs");
		res.json(playlists);
	} catch (error) {
		console.log("Error in getPlaylists", error);
		next(error);
	}
};

export const removeSongFromPlaylist = async (req, res, next) => {
	try {
		const { playlistId, songId } = req.params;

		const playlist = await Playlist.findById(playlistId);
		if (!playlist) {
			return res.status(404).json({ message: "Playlist not found" });
		}

		playlist.songs = playlist.songs.filter((song) => song.toString() !== songId);
		await playlist.save();

		res.status(200).json({ message: "Song removed from playlist", playlist });
	} catch (error) {
		console.log("Error in removeSongFromPlaylist", error);
		next(error);
	}
};
export const editSong = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, artist } = req.body;

        // Find the song by ID
        const song = await Song.findById(id);
        if (!song) {
            return res.status(404).json({ message: "Song not found" });
        }

        // Update the title and artist if provided
        if (title) {
            song.title = title;
        }
        if (artist) {
            song.artist = artist;
        }

        // Check if audio or image files are provided and update them
        if (req.files) {
            if (req.files.audioFile) {
                const audioUrl = await uploadToCloudinary(req.files.audioFile);
                song.audioUrl = audioUrl;

                // Update the song duration if a new audio file is uploaded
                const metadata = await parseFile(req.files.audioFile.tempFilePath);
                song.duration = Math.ceil(metadata.format.duration);
            }

            if (req.files.imageFile) {
                const imageUrl = await uploadToCloudinary(req.files.imageFile);
                song.imageUrl = imageUrl;
            }
        }

        // Save the updated song to the database
        await song.save();

        res.status(200).json({ message: "Song updated successfully", song });
    } catch (error) {
        console.log("Error in editSong", error);
        next(error);
    }
};
