'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  BarChart3,
  Award,
  Brain,
  Users,
  Target,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import Image from 'next/image';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
  viewport: { once: true }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#1A1A24] font-sans selection:bg-[#1A1A24] selection:text-white flex flex-col">
      {/* 1. Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-white/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/axoria-logo.svg"
              alt="Axoria"
              width={36}
              height={36}
              className="object-contain"
            />
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-sm font-medium hover:text-[#1A1A24]/80 transition-colors hidden sm:block"
            >
              Sign In
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* 2. Hero Section */}
        <section className="py-24 md:py-32 px-4 flex flex-col items-center justify-center text-center">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <motion.div
              {...fadeInUp}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-surface/50 px-3 py-1 text-sm font-medium text-muted-foreground mb-8"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              AI-Powered Capacity Building & Learning Platform
            </motion.div>
            
            <motion.h1
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6"
            >
              Build Capacity.
              <br />
              Close Skill Gaps.
              <br />
              Empower Teams.
            </motion.h1>
            
            <motion.p
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            >
              An AI-powered learning management platform that transforms how organizations train, develop competencies, and share knowledge.
            </motion.p>
            
            <motion.div
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Link href="/sign-up" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-12 px-8 text-base group">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#features" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto h-12 px-8 text-base">
                  Learn More
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* 3. Problem Section */}
        <section id="problem" className="py-24 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              {...fadeInUp}
              className="flex flex-col items-center text-center mb-16"
            >
              <span className="text-sm uppercase tracking-widest text-muted-foreground font-semibold mb-4">
                The Problem
              </span>
              <h2 className="text-3xl md:text-4xl font-bold">
                Organizations struggle with fragmented training
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: BookOpen,
                  title: "Unstructured Training",
                  description: "Training programs are scattered, inconsistent, and hard to track across departments."
                },
                {
                  icon: Target,
                  title: "Invisible Skill Gaps",
                  description: "No visibility into what competencies teams have versus what they need."
                },
                {
                  icon: Users,
                  title: "Knowledge Silos",
                  description: "Critical knowledge is trapped with individuals and lost when they leave."
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-[#F5F5F7] rounded-2xl p-8 flex flex-col items-start"
                >
                  <div className="bg-white rounded-xl p-3 shadow-sm mb-6">
                    <item.icon className="h-6 w-6 text-[#1A1A24]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Features Section */}
        <section id="features" className="py-24 px-4 bg-[#F5F5F7]/50">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              {...fadeInUp}
              className="flex flex-col items-center text-center mb-16"
            >
              <span className="text-sm uppercase tracking-widest text-muted-foreground font-semibold mb-4">
                The Solution
              </span>
              <h2 className="text-3xl md:text-4xl font-bold">
                Everything you need to build organizational capacity
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Brain,
                  title: "AI-Powered Quizzes",
                  description: "Auto-generate assessments from course content. AI grades subjective answers with detailed feedback."
                },
                {
                  icon: BarChart3,
                  title: "Skill Gap Analytics",
                  description: "Visualize competency gaps across teams and departments. Data-driven training decisions."
                },
                {
                  icon: Award,
                  title: "Auto Certificates",
                  description: "Beautiful certificates generated automatically when learners complete courses and pass assessments."
                },
                {
                  icon: Users,
                  title: "Role-Based Access",
                  description: "Admin, Manager, Trainer, and Learner roles with purpose-built dashboards for each."
                },
                {
                  icon: Target,
                  title: "Competency Framework",
                  description: "Define skills, map them to roles, and track progress against organizational requirements."
                },
                {
                  icon: Sparkles,
                  title: "AI Assistant",
                  description: "Ask anything about training, courses, or skills. Get instant, context-aware answers powered by AI."
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-8 border border-border/50 hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="mb-6 flex items-center justify-center w-12 h-12 rounded-full bg-[#F5F5F7] text-[#1A1A24]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed flex-1">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. How it Works Section */}
        <section id="how-it-works" className="py-24 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              {...fadeInUp}
              className="flex flex-col items-center text-center mb-16"
            >
              <span className="text-sm uppercase tracking-widest text-muted-foreground font-semibold mb-4">
                How It Works
              </span>
              <h2 className="text-3xl md:text-4xl font-bold">
                From assignment to certification in four steps
              </h2>
            </motion.div>

            <div className="relative">
              {/* Connecting line (Desktop only) */}
              <div className="hidden md:block absolute top-6 left-[10%] right-[10%] border-t-2 border-dashed border-border z-0"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
                {[
                  { step: "1", title: "Assign", description: "Managers assign courses to team members with due dates" },
                  { step: "2", title: "Learn", description: "Learners take courses with video, PDF, and article lessons" },
                  { step: "3", title: "Assess", description: "AI-powered quizzes validate comprehension and skills" },
                  { step: "4", title: "Certify", description: "Auto-generated certificates on successful completion" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#1A1A24] text-white flex items-center justify-center font-bold text-lg mb-6 mx-auto shadow-md">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground px-2">
                      {item.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 6. CTA Section */}
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              {...fadeInUp}
              className="bg-[#1A1A24] text-white rounded-3xl p-12 md:p-20 text-center flex flex-col items-center justify-center relative overflow-hidden"
            >
              {/* Subtle background decoration */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">
                Ready to transform your organization's learning?
              </h2>
              <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 relative z-10">
                Start building capacity today with AI-powered training management.
              </p>
              
              <Link href="/sign-up" className="relative z-10">
                <Button variant="secondary" className="h-12 px-8 text-base bg-white text-[#1A1A24] hover:bg-white/90 group font-semibold">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* 7. Footer */}
      <footer className="border-t border-border py-8 px-4 bg-white">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © 2026 Axoria. Empowering modern organizations with AI-driven capacity building.
          </p>
          <div className="flex items-center gap-2">
            <Image
              src="/axoria-logo.svg"
              alt="Axoria"
              width={24}
              height={24}
              className="opacity-80"
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
