import { User } from "../models/user.model.js";

// Lấy danh sách người dùng
export const getUsers = async (req, res) => {
    try {
        const users = await User.find({
            role: { $nin: ["creator", "admin"] },
        }).select("fullname email role createdAt");
        res.status(200).json(users);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách người dùng:", error);
        res.status(500).json({ message: "Lỗi server!" });
    }
};

export const getCreators = async (req, res) => {
    try {
        // Fetch all creators with their approval details
        const creators = await User.find({ role: "creator" });
        res.status(200).json(creators);
    } catch (error) {
        console.error("Error fetching creators:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const approveCreator = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedCreator = await User.findByIdAndUpdate(
            id,
            {
                "creatorDetails.approved": true,
                "creatorDetails.approvedAt": new Date(),
            },
            { new: true }
        );

        if (!updatedCreator) {
            return res.status(404).json({ message: "Creator not found" });
        }

        res.status(200).json({
            message: "Creator approved successfully",
            creator: updatedCreator,
        });
    } catch (error) {
        console.error("Error approving creator:", error);
        res.status(500).json({ message: "Error approving creator" });
    }
};


const userController = { getUsers, getCreators, approveCreator }; // Tạo object chứa các hàm

export default userController;
