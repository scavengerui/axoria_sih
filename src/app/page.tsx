"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BarChart3,
  Award,
  Brain,
  Users,
  Target,
  Sparkles,
  ChevronRight,
  Play,
  Compass,
  CheckCircle2,
  Lightbulb,
  Zap,
  HardDrive,
  ShieldCheck,
  Flame,
  Layers,
  Lock,
} from "lucide-react";

export default function LandingPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
    viewport: { once: true },
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1A1A24] antialiased selection:bg-primary selection:text-white">
      {/* 1. Sticky Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/axoria-logo.svg" alt="Axoria" className="h-8 w-8" />
            <span className="font-extrabold tracking-wider text-lg">AXORIA</span>
            <Badge variant="outline" className="text-[10px] hidden sm:inline-flex bg-primary/5 text-primary border-primary/20">
              SIH 2026
            </Badge>
          </Link>

          <nav className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/catalog"
              className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden md:block"
            >
              Course Catalog (22)
            </Link>
            <Link
              href="/skill-check"
              className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden md:block"
            >
              Skill Check Arena
            </Link>
            <Link
              href="/sign-in"
              className="text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
            >
              Sign In
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="h-9 px-4 text-xs sm:text-sm font-bold shadow-xs">
                Get Started Free
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* 2. Hero Section with Interactive Live Product UI Mockup */}
        <section className="py-20 md:py-28 px-4 flex flex-col items-center justify-center text-center overflow-hidden relative">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-transparent blur-3xl pointer-events-none -z-0" />

          <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10">
            <motion.div
              {...fadeInUp}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary mb-6"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Next-Gen AI Capacity Building & Enterprise LMS
            </motion.div>

            <motion.h1
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.1 }}
              className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6"
            >
              Build Capacity.
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent">
                Close Skill Gaps.
              </span>
              <br />
              Empower Teams.
            </motion.h1>

            <motion.p
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed"
            >
              Zero-to-course in under 2 seconds. Transform unstructured SOPs, scanned PDFs, and organizational knowledge into interactive learning tracks with verifiable certificates.
            </motion.p>

            <motion.div
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto mb-14"
            >
              <Link href="/sign-up" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-11 px-7 text-sm font-bold group shadow-md">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/catalog" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto h-11 px-7 text-sm font-semibold">
                  Explore 22 Live Courses
                </Button>
              </Link>
            </motion.div>

            {/* INTERACTIVE PRODUCT UI FRAME MOCKUP (Zero Awkward Photos) */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              viewport={{ once: true }}
              className="w-full max-w-4xl bg-slate-950 text-white rounded-3xl border-4 border-slate-800 shadow-2xl p-4 sm:p-6 text-left relative overflow-hidden"
            >
              {/* Fake Browser Top Bar */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  axoria.enterprise/learn/cyber-threat-defense
                </span>
                <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                  <ShieldCheck className="w-3 h-3 mr-1" /> Verified Ledger Active
                </Badge>
              </div>

              {/* Inside Mockup Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Left: Video & Flowchart Preview (8 Cols) */}
                <div className="md:col-span-8 space-y-3">
                  <div className="bg-slate-900 rounded-2xl p-3 border border-slate-800 relative group overflow-hidden aspect-video flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                    <span className="absolute bottom-3 left-3 text-[11px] font-semibold bg-black/70 px-2 py-0.5 rounded-md">
                      🎬 Lecture: Zero-Trust Threat Defense Architecture
                    </span>
                  </div>

                  {/* Flowchart Mock */}
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                      <Compass className="w-3 h-3" /> Architecture Schematic
                    </span>
                    <p className="font-mono text-[11px] text-slate-300">
                      Identity Token ──▶ Context Policy Gate ──▶ Isolated Container Execution
                    </p>
                  </div>
                </div>

                {/* Right: AI Reflection Checkpoint & Score (4 Cols) */}
                <div className="md:col-span-4 space-y-3 flex flex-col justify-between">
                  <div className="p-3.5 bg-blue-950/40 rounded-2xl border border-blue-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-blue-300 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3 text-yellow-400" /> Reflection Checkpoint
                      </span>
                      <Badge className="text-[9px] bg-emerald-500 text-white">92% Relevance ✨</Badge>
                    </div>
                    <p className="text-[11px] text-slate-300 italic leading-snug">
                      &ldquo;We enforce hardware FIDO2 keys and drop root capabilities on all container subnets.&rdquo;
                    </p>
                    <p className="text-[10px] text-slate-400 border-t border-slate-800 pt-1.5">
                      💡 <strong>AI Feedback:</strong> Exceptional grasp of zero-trust containment.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center space-y-1">
                    <span className="text-[10px] text-slate-400">Exam Pass Rate</span>
                    <p className="text-lg font-extrabold text-emerald-400">100% Passed</p>
                    <Badge variant="outline" className="text-[9px] text-slate-300 font-mono">
                      Cert #AX-SEC-92847
                    </Badge>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 3. Tech Stack & Enterprise Metrics Bar */}
        <section className="py-8 border-y border-border/50 bg-[#F5F5F7]/40 px-4">
          <div className="container mx-auto max-w-6xl flex flex-wrap items-center justify-around gap-6 text-center text-xs font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-primary" /> Groq LPU Sub-600ms AI</span>
            <span className="flex items-center gap-1.5"><HardDrive className="w-4 h-4 text-primary" /> 500 MB Personal Vault</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-success" /> Immutable Ledger Credentials</span>
            <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-primary" /> Synapse OCR Intelligence</span>
            <span className="flex items-center gap-1.5"><Flame className="w-4 h-4 text-orange-500" /> Gamified 4-Day Streaks</span>
          </div>
        </section>

        {/* 4. Problem Section */}
        <section id="problem" className="py-24 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div {...fadeInUp} className="flex flex-col items-center text-center mb-16">
              <span className="text-xs uppercase tracking-widest text-primary font-bold mb-3">
                The Bottleneck
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Traditional capacity building takes 4 weeks and fails retention
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: BookOpen,
                  title: "Fragmented Legacy Materials",
                  description: "Training SOPs are trapped in physical circulars, messy PDFs, and outdated spreadsheets with zero interactive synthesis."
                },
                {
                  icon: Target,
                  title: "Invisible Skill Gaps",
                  description: "Organizations have no real-time telemetry into what competencies teams actually possess versus what compliance requires."
                },
                {
                  icon: Users,
                  title: "Passive Video Drop-Off",
                  description: "Watching passive video lectures leads to a 70% forgetting curve within 48 hours without active reflection checkpoints."
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-[#F5F5F7] rounded-3xl p-8 flex flex-col items-start border border-border/40 hover:shadow-md transition-shadow"
                >
                  <div className="bg-white rounded-2xl p-3.5 shadow-xs mb-6 text-primary">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Features Section (The Solution) */}
        <section id="features" className="py-24 px-4 bg-[#F5F5F7]/60">
          <div className="container mx-auto max-w-6xl">
            <motion.div {...fadeInUp} className="flex flex-col items-center text-center mb-16">
              <span className="text-xs uppercase tracking-widest text-primary font-bold mb-3">
                The Solution
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Everything required to build organizational capacity
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Brain,
                  title: "Zero-to-Course AI Synthesis",
                  description: "Generate structured multi-module courses with auto-linked YouTube lectures and visual flowcharts in <2 seconds."
                },
                {
                  icon: Sparkles,
                  title: "Synapse OCR Document AI",
                  description: "Upload any messy scan or photo. AI synthesizes executive summaries, 5-question quizzes, and 3D flashcards."
                },
                {
                  icon: Zap,
                  title: "Skill Check & Idea Arena",
                  description: "Benchmark competency on any idea with up to 20 adaptive questions and instant proficiency tier scoring."
                },
                {
                  icon: Award,
                  title: "Verifiable Public Certificates",
                  description: "Issue tamper-proof certificates with unique SHA-256 hash IDs and 1-click LinkedIn profile sharing."
                },
                {
                  icon: HardDrive,
                  title: "500 MB Personal Cloud Vault",
                  description: "Account-specific storage locker for study notes, SOPs, and project archives with 1-click downloads."
                },
                {
                  icon: BarChart3,
                  title: "Competency Spider Radar",
                  description: "Interactive data visualizations mapping team capacity across 6 core pillars with 1-click bridge courses."
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-3xl p-8 border border-border/70 hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary w-fit mb-5">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold mb-2 text-foreground">{feature.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Call to Action */}
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="bg-[#1A1A24] text-white rounded-3xl p-10 md:p-16 text-center space-y-6 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
              
              <Badge variant="outline" className="text-xs text-blue-300 border-blue-400/30 bg-blue-500/10">
                Ready for Smart India Hackathon
              </Badge>

              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight max-w-2xl mx-auto">
                Ready to transform organizational learning?
              </h2>
              <p className="text-sm md:text-base text-slate-300 max-w-xl mx-auto">
                Start building capacity, closing competency gaps, and issuing verifiable certificates today.
              </p>

              <div className="pt-2">
                <Link href="/sign-up">
                  <Button size="lg" className="h-12 px-8 font-bold bg-white text-[#1A1A24] hover:bg-slate-100 shadow-lg text-sm">
                    Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 7. Footer */}
      <footer className="py-8 border-t border-border bg-white text-xs text-muted-foreground">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <img src="/axoria-logo.svg" alt="Axoria" className="h-5 w-5" />
            <span className="font-bold text-foreground">AXORIA</span>
            <span>• Built for Smart India Hackathon 2026</span>
          </div>
          <p>© 2026 Axoria Capacity Connect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
