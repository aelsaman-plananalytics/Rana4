/**
 * OpenAPI 3.0 spec for Rana4 API. Served at /api-docs (Swagger UI).
 * Spec lives in openapi.json to avoid esbuild parse issues with large object literals.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const specPath = join(__dirname, "openapi.json");

export const openApiSpec = JSON.parse(readFileSync(specPath, "utf-8"));
