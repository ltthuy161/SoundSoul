import { Router } from "express";
import userController from '../controller/user.controller.js';

const router = Router();

// Route: Lấy danh sách người dùng (không phải creator)
router.get('/', userController.getUsers);

// Route: Lấy danh sách creator
router.get('/creators', userController.getCreators);

// Phê duyệt creator
router.patch("/creators/:id/approve", userController.approveCreator);

export default router;