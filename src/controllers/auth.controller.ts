import type { Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../utils/prisma.js";
import { signToken } from "../utils/auth.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { validateEmailWithZeroBounce } from "../services/zerobounce.js";

const SALT_ROUNDS = 10;

function toUserResponse(user: { id: string; email: string; name: string | null; createdAt: Date }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function register(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { email, password, name } = req.body as { email?: string; password?: string; name?: string };
    const emailStr = email != null ? String(email).trim().toLowerCase() : "";
    const passwordStr = password != null ? String(password) : "";

    if (!emailStr) {
      res.status(400).json({ error: "Email is required" });
      return;
    }
    if (passwordStr.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }

    const zb = await validateEmailWithZeroBounce(emailStr);
    if (!zb.valid) {
      res.status(400).json({ error: zb.error ?? "Email could not be verified" });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email: emailStr } });
    if (existing) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(passwordStr, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        email: emailStr,
        passwordHash,
        name: name != null && String(name).trim() !== "" ? String(name).trim() : null,
      },
    });

    const token = signToken({ userId: user.id, email: user.email });
    res.status(201).json({
      user: toUserResponse(user),
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create account" });
  }
}

export async function login(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    const emailStr = email != null ? String(email).trim().toLowerCase() : "";
    const passwordStr = password != null ? String(password) : "";

    if (!emailStr || !passwordStr) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email: emailStr } });
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const match = await bcrypt.compare(passwordStr, user.passwordHash);
    if (!match) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email });
    res.json({
      user: toUserResponse(user),
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to sign in" });
  }
}

export async function me(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(toUserResponse(user));
}

export async function updateMe(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  try {
    const { name } = req.body as { name?: string };
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: name !== undefined ? { name: String(name).trim() || null } : undefined,
      select: { id: true, email: true, name: true, createdAt: true },
    });
    res.json(toUserResponse(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
}

export async function changePassword(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  try {
    const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "Current password and new password are required" });
      return;
    }
    if (newPassword.length < 8) {
      res.status(400).json({ error: "New password must be at least 8 characters" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
      res.status(401).json({ error: "Current password is incorrect" });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash },
    });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to change password" });
  }
}
