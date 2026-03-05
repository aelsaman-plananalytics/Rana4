"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  GitBranch,
  ListTodo,
  Package,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/standards", label: "Standards", icon: FileText },
  { href: "/fragnets", label: "Fragnets", icon: GitBranch },
  { href: "/activities", label: "Activities", icon: ListTodo },
  { href: "/deliverables", label: "Deliverables", icon: Package },
  { href: "/export", label: "Export", icon: Download },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 flex-col border-r border-slate-800/50 bg-slate-900">
      <nav className="flex flex-1 flex-col gap-1 py-3 px-3.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ease-out",
                "hover:translate-x-0.5 hover:bg-white/5",
                isActive
                  ? "border-l-2 border-slate-50 bg-white/10 pl-[calc(0.75rem-2px)] font-semibold text-white"
                  : "border-l-2 border-transparent font-medium text-slate-400"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  isActive ? "text-white" : "text-slate-500"
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
