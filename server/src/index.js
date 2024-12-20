import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import cors from "cors";    

dotenv.config();

const app = express();

//middleware
app.use(express.json());

// Configure CORS
app.use(
    cors({
        origin: "http://127.0.0.1:5500", // Frontend origin
        methods: ["GET", "POST", "PUT", "DELETE"], // Allowable HTTP methods
        credentials: true, // Allow cookies if needed
    })
);

const PORT = process.env.PORT;

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
    connectDB();
});
