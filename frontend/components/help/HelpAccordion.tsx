"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = {
  id: string;
  title: string;
  content: React.ReactNode;
};

export function HelpAccordion({ items }: { items: Item[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="divide-y divide-slate-200 dark:divide-slate-800">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className="first:pt-0">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="flex w-full items-center justify-between py-4 text-left font-medium text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-slate-200"
            >
              <span>{item.title}</span>
              <ChevronDown
                className={cn("h-5 w-5 shrink-0 text-slate-500 transition-transform", isOpen && "rotate-180")}
              />
            </button>
            <div
              className={cn(
                "overflow-hidden text-sm text-slate-600 dark:text-slate-400 transition-all duration-200",
                isOpen ? "max-h-[500px] pb-4" : "max-h-0"
              )}
            >
              <div className="pr-8">{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
