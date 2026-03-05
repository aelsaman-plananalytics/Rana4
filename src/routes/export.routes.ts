import { Router } from "express";
import * as exportController from "../controllers/export.controller.js";

const router = Router();

router.post("/fragnet/:fragnetId", exportController.exportFragnet);

export default router;
