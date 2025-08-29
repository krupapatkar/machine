// src/routes/userRoutes.ts
import { Router } from "express";
import { signup,getUserById,editUser,deleteUser } from "../controllers/userController";

const router = Router();

router.post("/create", signup);
router.get("/:id", getUserById); 
router.put("/:id", editUser); 
router.delete("/:id", deleteUser);

export default router;
