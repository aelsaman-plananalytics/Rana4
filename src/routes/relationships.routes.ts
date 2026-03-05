import { Router } from "express";
import * as relationshipsController from "../controllers/relationships.controller.js";

const router = Router();

router.post("/", relationshipsController.create);
router.get("/fragnet/:fragnetId", relationshipsController.getByFragnetId);
router.delete("/:id", relationshipsController.remove);

export default router;
