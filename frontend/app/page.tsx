import { LandingHeader } from "@/components/marketing/LandingHeader";
import { Hero } from "@/components/marketing/Hero";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";

export default function LandingPage() {
  return (
    <>
      <LandingHeader />
      <main className="min-h-screen bg-slate-950">
        <Hero />
        <FeatureGrid />
      </main>
      <footer className="border-t border-slate-800 bg-slate-950 px-6 py-8 text-center text-sm text-slate-500">
        <span className="text-cyan-400/80">Rana4</span> — Structured Scheduling Platform
      </footer>
    </>
  );
}
