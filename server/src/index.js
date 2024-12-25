import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import adminRoutes from "./routes/admin.route.js";
import cors from "cors";    
import fileUpload from "express-fileupload";
import path from "path";

dotenv.config();
const __dirname = path.resolve();
const app = express();

//middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Configure CORS
app.use(
    cors({
        origin: "http://127.0.0.1:5500", // Frontend origin
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Allowable HTTP methods
        credentials: true, // Allow cookies if needed
    })
);
app.use(
	fileUpload({
		useTempFiles: true,
		tempFileDir: path.join(__dirname, "tmp"),
		createParentPath: true,
		limits: {
			fileSize: 10 * 1024 * 1024, // 10MB  max file size
		},
	})
);
const PORT = process.env.PORT;

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);


app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
    connectDB();
});
