"use client";

import Link from "next/link";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/contexts/auth-context";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingHeader() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-white transition-colors hover:text-cyan-400"
        >
          <span className="text-cyan-400">Rana</span>4
        </Link>
        <nav className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <Link href="/help">Help</Link>
          </Button>
          {user ? (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <Link href="/settings">Account</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="rounded-lg border-0 bg-cyan-500 text-white shadow-cyan-500/20 hover:bg-cyan-400 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
              >
                <Link href="/app">Enter Platform</Link>
              </Button>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <Link href="/login">Log in</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="rounded-lg border-0 bg-cyan-500 text-white shadow-cyan-500/20 hover:bg-cyan-400 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
              >
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
