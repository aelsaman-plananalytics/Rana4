import type { Request } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

const secret =
  process.env.NODE_ENV === "production"
    ? (process.env.JWT_SECRET ?? "")
    : (process.env.JWT_SECRET ?? "dev-secret-change-in-production");

export interface AuthPayload {
  userId: string;
  email: string;
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload & AuthPayload;
    if (decoded.userId && decoded.email) return { userId: decoded.userId, email: decoded.email };
    return null;
  } catch {
    return null;
  }
}

export function getBearerToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return auth.slice(7).trim() || null;
}
