import { Song } from "../models/song.model.js";
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
            imageUrl: song.imageUrl
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching song", error });
    }
};
export const getAllSongs = async (req, res, next) => {
	try {
		// -1 = Descending => newest -> oldest
		// 1 = Ascending => oldest -> newest
		const songs = await Song.find().sort({ createdAt: -1 });
		res.json(songs);
	} catch (error) {
		next(error);
	}
};

// helper function for cloudinary uploads
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

		// Extract duration from audio file
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

		// if song belongs to an album, update the album's songs array
		if (song.albumId) {
			await Album.findByIdAndUpdate(song.albumId, {
				$pull: { songs: song._id },
			});
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