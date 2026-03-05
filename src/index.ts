import "dotenv/config";
import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import activitiesRoutes from "./routes/activities.routes.js";
import assuranceNotesRoutes from "./routes/assuranceNotes.routes.js";
import authRoutes from "./routes/auth.routes.js";
import deliverablesRoutes from "./routes/deliverables.routes.js";
import exportRoutes from "./routes/export.routes.js";
import fragnetsRoutes from "./routes/fragnets.routes.js";
import healthRoutes from "./routes/healthRoutes.js";
import { openApiSpec } from "./openapi.js";
import relationshipsRoutes from "./routes/relationships.routes.js";
import standardsRoutes from "./routes/standards.routes.js";
import "./utils/prisma.js";

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors({ origin: true })); // allow frontend origin (e.g. localhost:3001)
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.get("/", (_req, res) => {
  res.redirect(302, "/health");
});

app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use("/export", exportRoutes);
app.use("/standards", standardsRoutes);
app.use("/deliverables", deliverablesRoutes);
app.use("/activities", activitiesRoutes);
app.use("/assurance-notes", assuranceNotesRoutes);
app.use("/fragnets", fragnetsRoutes);
app.use("/relationships", relationshipsRoutes);

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
