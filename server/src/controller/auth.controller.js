import {User} from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    try {
        console.log("Request Body:", req.body);

        const { fullname, email, password, role } = req.body;

        // Validate required fields
        if (!fullname || !email || !password || !role) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        // Enforce password strength
        if (password.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters long" });
        }

        // Hash the password
        const hashPassword = bcrypt.hashSync(password, 10);

        // Check for duplicate email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use" });
        }

        // Create user data
        const userData = {
            fullname,
            email,
            password: hashPassword,
            role,
        };

        // Add creatorDetails only if role is "creator"
        if (role === "creator") {
            userData.creatorDetails = {
                approved: false,
                approvedAt: null,
            };
        }

        // Create a new user
        const newUser = new User(userData);

        // Explicitly remove creatorDetails for non-creator roles (additional safeguard)
        if (role !== "creator") {
            newUser.creatorDetails = undefined;
        }

        await newUser.save();

        console.log("User saved successfully:", newUser);

        // Send success response
        res.status(201).json({
            message: `User created successfully with fullname ${fullname}`,
        });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res
                .status(404)
                .json({ error: `User with email ${email} not found` });
        }

        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h",
            }
        );
        res.status(200).json({ token });
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
};