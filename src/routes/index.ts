// src/routes/index.ts
import { Router } from "express";
import userRoutes from "./userRoutes"; 
import countryRoutes from "./countryRoutes";
import cityRoutes from "./cityRoutes";
import stateRoutes from "./stateRoutes";
import loginRoutes from "./loginRoutes"; 
import forgetPasswordRoutes from "./PasswordRouts"; 


const router = Router();
router.use("/user", userRoutes);
router.use("/country", countryRoutes);
router.use("/state", stateRoutes);
router.use("/city", cityRoutes);
router.use("/login", loginRoutes);
router.use("/password", forgetPasswordRoutes);



export default router;