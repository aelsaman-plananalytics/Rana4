"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/contexts/auth-context";
import { authApi, getApiErrorMessage } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const BACKEND_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000")
    : process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    setName(user.name ?? "");
  }, [user, loading, router]);

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setNameSaving(true);
    try {
      await authApi.updateMe({ name: name.trim() || undefined });
      await refreshUser();
      toast.success("Display name updated");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setNameSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordSaving(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Password updated");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setPasswordSaving(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-6 py-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Account and system preferences.
        </p>
      </div>

      <Card className="dark:border-slate-800 dark:bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Theme and display.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Theme</span>
            <div className="flex gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
              >
                <Sun className="mr-1.5 h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
              >
                <Moon className="mr-1.5 h-4 w-4" />
                Dark
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="dark:border-slate-800 dark:bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Your profile and sign-in details.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
            <Input
              value={user.email}
              readOnly
              className="max-w-xs font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">Email cannot be changed here.</p>
          </div>
          <form onSubmit={handleSaveName} className="grid gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Display name</label>
            <div className="flex gap-2">
              <Input
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="max-w-xs dark:border-slate-700 dark:bg-slate-900"
              />
              <Button type="submit" size="sm" disabled={nameSaving}>
                {nameSaving ? "Saving…" : "Save"}
              </Button>
            </div>
          </form>
          <form onSubmit={handleChangePassword} className="space-y-4 border-t border-slate-200 pt-6 dark:border-slate-700">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Change password</h4>
            <div className="grid gap-2">
              <label className="text-sm text-slate-600 dark:text-slate-400">Current password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="max-w-xs dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-slate-600 dark:text-slate-400">New password</label>
              <Input
                type="password"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="max-w-xs dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <Button type="submit" size="sm" disabled={passwordSaving}>
              {passwordSaving ? "Updating…" : "Update password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="dark:border-slate-800 dark:bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-base">System</CardTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Version and backend.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              Rana4 Frontend v0.1.0
            </span>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Backend URL</label>
            <Input
              value={BACKEND_URL}
              readOnly
              className="font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">API base URL used by the frontend (read-only).</p>
          </div>
        </CardContent>
      </Card>

      <Card className="dark:border-slate-800 dark:bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-base">Integrations</CardTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Future integrations and extensions.
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Placeholder for future integration options.
          </p>
        </CardContent>
      </Card>

      <div>
        <Button asChild variant="outline">
          <Link href="/app">Back to platform</Link>
        </Button>
      </div>
    </div>
  );
}
