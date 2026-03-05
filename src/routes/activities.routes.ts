import { Router } from "express";
import * as activitiesController from "../controllers/activities.controller.js";

const router = Router();

router.post("/", activitiesController.create);
router.get("/fragnet/:fragnetId", activitiesController.getByFragnetId);
router.get("/:id", activitiesController.getById);
router.put("/:id", activitiesController.update);
router.delete("/:id", activitiesController.remove);

export default router;
