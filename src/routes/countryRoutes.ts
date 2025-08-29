//  src/controllers/countryController.ts
import { Router } from "express";
import {createCountry,getCountryById,editCountry,deleteCountry,getAllUsers} from "../controllers/countryController";
import { authenticateUser } from "../middleware/authMiddleware";


const router = Router();

router.post("/create",createCountry);
router.post("/list", getAllUsers);
router.get("/:id", getCountryById);
router.post("/:id",editCountry);
router.delete("/:id",deleteCountry);


export default router;
