"use client";

import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

function getBreadcrumbs(pathname: string): { label: string; href: string }[] {
  if (pathname === "/") return [{ label: "Dashboard", href: "/" }];
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [{ label: "Home", href: "/" }];
  let href = "";
  for (const seg of segments) {
    href += `/${seg}`;
    const label = seg.charAt(0).toUpperCase() + seg.slice(1);
    crumbs.push({ label, href });
  }
  return crumbs;
}

export function Header() {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <header className="sticky top-0 z-10 flex min-h-14 items-center border-b border-slate-200 bg-white/95 px-6 py-3 backdrop-blur-md">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-base font-semibold tracking-tight text-slate-900">
          Rana4 Scheduling System
        </h1>
        <nav className="flex items-center gap-1 text-xs text-slate-500" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1">
              {i > 0 && (
                <ChevronRight className="h-3.5 w-3 shrink-0 text-slate-300" aria-hidden />
              )}
              <span
                className={
                  i === breadcrumbs.length - 1
                    ? "font-medium text-slate-600"
                    : "text-slate-500"
                }
              >
                {crumb.label}
              </span>
            </span>
          ))}
        </nav>
      </div>
    </header>
  );
}
