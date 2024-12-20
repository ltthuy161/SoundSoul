import {User} from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
export const register = async (req, res) => {
    try {
        console.log("Request Body:", req.body); // Log request body for debugging

        const { fullname, email, password, role } = req.body;

        // Validate fields
        if (!fullname || !email || !password || !role) {
            return res.status(400).json({ error: "All fields are required" });
        }

        console.log("Passed Validation");

        // Hash the password
        const hashPassword = bcrypt.hashSync(password, 10);

        // Create a new user
        const newUser = new User({
            fullname,
            email,
            password: hashPassword,
            role,
        });

        await newUser.save();
        console.log("User saved successfully:", newUser);

        // Send success response
        res.status(201).json({
            message: `User created successfully with fullname ${fullname}`,
        });
    } catch (error) {
        console.error("Error during registration:", error); // Log detailed error
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