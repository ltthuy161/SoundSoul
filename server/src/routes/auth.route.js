import express from "express";
import { register, login, forgotPassword, resetPassword, verifyEmail } from "../controller/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword); // Thêm endpoint reset-password

router.get("/verify-email", verifyEmail)
router.get("/reset-password", (req, res) => {
    const { token, id } = req.query;
    console.log("Token:", token, "ID:", id);

    if (!token || !id) {
        return res.status(400).send("Invalid or missing token and ID.");
    }

    res.sendFile(path.resolve("/client/html/auth/reset.html"));
});

export default router;