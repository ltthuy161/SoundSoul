import {User} from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";

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

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Kiểm tra email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({
                message: "If this email exists, a reset link will be sent.",
            });
        }

        // Tạo token reset mật khẩu
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenHash = bcrypt.hashSync(resetToken, 10);

        // Lưu token và thời hạn
        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpires = Date.now() + 20 * 60 * 1000; // Hết hạn sau 20 phút
        await user.save();

        // Gửi email chứa link frontend
        const resetURL = `http://127.0.0.1:5500/client/html/auth/reset.html?token=${resetToken}&id=${user._id}`;

        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: '"SoundSoul" <no-reply@soundsoul.com>',
            to: email,
            subject: "Reset Your Password",
            html: 
                `<div style="font-family: Arial, sans-serif; text-align: center;">
                    <h2>Reset Your Password</h2>
                    <p>Hello ${user.fullname},</p>
                    <p>We received a request to reset your password. Click the link below to reset your password:</p>
                    <a href="${resetURL}" style="display: inline-block; padding: 10px 20px; color: white; background-color: blue; text-decoration: none; border-radius: 5px;">
                        Reset Password
                    </a>
                    <p>This link will expire in 10 minutes. If you did not request this, please ignore this email.</p>
                </div>`
            ,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            message: "If this email exists, a reset link will be sent.",
        });
    } catch (error) {
        console.error("Error during forgot password:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, id } = req.query;
        const { newPassword } = req.body;

        console.log("Received ID:", id);
        console.log("Received Token:", token);

        // Find the user by ID
        const user = await User.findOne({ _id: id });
        if (!user) {
            console.error("User not found.");
            return res.status(400).json({ error: "User not found." });
        }

        console.log("Stored Token:", user.resetPasswordToken);
        console.log("Stored Expiration:", user.resetPasswordExpires);
        console.log("Current Time:", Date.now());

        // Check if token and expiration exist
        if (!user.resetPasswordToken || !user.resetPasswordExpires) {
            console.error("Reset token or expiration is missing.");
            return res.status(400).json({ error: "Reset token or expiration is missing." });
        }

        // Check if token has expired
        if (user.resetPasswordExpires <= Date.now()) {
            console.error("Reset token expired.");
            return res.status(400).json({ error: "Reset token expired." });
        }

        // Verify the token
        const isTokenValid = await bcrypt.compare(token, user.resetPasswordToken);
        if (!isTokenValid) {
            console.error("Invalid token.");
            return res.status(400).json({ error: "Invalid or expired token." });
        }

        // Update the password
        user.password = bcrypt.hashSync(newPassword, 10); // Hash the new password
        user.resetPasswordToken = undefined; // Clear the token
        user.resetPasswordExpires = undefined; // Clear the expiration
        await user.save();

        console.log("Password reset successfully.");
        res.status(200).json({ message: "Password reset successfully!" });
    } catch (error) {
        console.error("Error during reset password:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};