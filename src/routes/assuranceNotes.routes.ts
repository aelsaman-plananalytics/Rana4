import { Router } from "express";
import * as assuranceNotesController from "../controllers/assuranceNotes.controller.js";

const router = Router();

router.post("/", assuranceNotesController.create);
router.get("/standard/:standardId", assuranceNotesController.getByStandardId);
router.delete("/:id", assuranceNotesController.remove);

export default router;
