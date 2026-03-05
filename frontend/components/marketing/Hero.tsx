"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-24 pb-32 md:pt-32 md:pb-40">
      {/* Futuristic background: grid + gradient */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,hsl(222_47%_6%_/_0.97)_0%,hsl(222_50%_4%)_50%,hsl(220_55%_5%)_100%)] dark:bg-[linear-gradient(to_bottom,hsl(222_47%_6%)_0%,hsl(222_50%_3%)_100%)]" />
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(187_85%_50%_/_0.5) 1px, transparent 1px),
            linear-gradient(90deg, hsl(187_85%_50%_/_0.5) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />
      <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px] dark:bg-cyan-400/15" />

      <div className="relative mx-auto max-w-4xl text-center">
        <motion.div
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm font-medium text-cyan-400 dark:border-cyan-400/40 dark:bg-cyan-400/10 dark:text-cyan-300"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
          </span>
          Next-gen schedule control
        </motion.div>
        <motion.h1
          className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          Structured Scheduling.
          <br />
          <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-300 bg-clip-text text-transparent">
            Reimagined.
          </span>
        </motion.h1>
        <motion.p
          className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 dark:text-slate-400"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        >
          Standardised Fragnets, Dual-Duration Modelling, Deterministic Export.
          <br className="hidden sm:block" />
          One platform for serious schedule control.
        </motion.p>
        <motion.div
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        >
          <Button
            asChild
            size="lg"
            className="rounded-xl border-0 bg-cyan-500 px-6 text-base font-medium text-white shadow-lg shadow-cyan-500/30 transition-all duration-200 hover:bg-cyan-400 hover:shadow-cyan-400/40 dark:bg-cyan-500 dark:text-slate-950 dark:shadow-cyan-500/25 dark:hover:bg-cyan-400"
          >
            <Link href="/app">
              Enter Platform
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-xl border-cyan-500/50 bg-transparent px-6 text-base text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 hover:border-cyan-400/60 dark:border-cyan-400/50 dark:text-cyan-300 dark:hover:bg-cyan-400/10"
          >
            <Link href="#features">
              Learn More
              <ChevronDown className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
