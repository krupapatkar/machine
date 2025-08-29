import { Router } from "express";
import {createState,editState,deleteState,getStateById,getAllStates} from "../controllers/stateController";

const router = Router();

router.post("/create", createState);
router.get("/:id", getStateById);
router.post("/:id", editState);
router.delete("/:id", deleteState);
router.post("/getAllStates", getAllStates);

export default router;
