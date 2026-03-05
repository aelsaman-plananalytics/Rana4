import Link from "next/link";

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white/95 px-6 py-3 dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
            Rana4
          </Link>
          <Link
            href="/app"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            Back to platform
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
