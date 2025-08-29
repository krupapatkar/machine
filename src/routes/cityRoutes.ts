import { Router } from "express";
import {createCity,getCityById,editCity,deleteCity,getAllCities,getCityId} from "../controllers/cityController";

const router = Router();

router.post("/create", createCity);
router.get("/:id", getCityById);
router.post("/:id", editCity);
router.get("/get/:id", getCityId); 
router.delete("/:id", deleteCity);
router.post("/list", getAllCities);


export default router;
