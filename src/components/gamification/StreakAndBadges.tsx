"use client";

import { useState } from "react";
import {
  Flame,
  Award,
  Trophy,
  Sparkles,
  Zap,
  CheckCircle2,
  Lock,
  ChevronRight,
  ShieldCheck,
  Star,
  Target,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface Achievement {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progressText: string;
  xp: number;
}

export const ACHIEVEMENTS_DATA: Achievement[] = [
  {
    id: "ach_1",
    title: "Active Recall Pioneer",
    category: "Reflection",
    description: "Submit your first in-lesson open-ended reflection and receive AI coaching feedback.",
    icon: "💡",
    unlocked: true,
    progressText: "Completed (88% Relevance)",
    xp: 250,
  },
  {
    id: "ach_2",
    title: "Capstone Ace 100%",
    category: "Mastery",
    description: "Achieve a flawless 100% score on any Capstone Certification Exam.",
    icon: "🏆",
    unlocked: true,
    progressText: "Earned on Security Defense",
    xp: 500,
  },
  {
    id: "ach_3",
    title: "Prompt Architect",
    category: "AI Creation",
    description: "Generate a custom personalized course on any topic using the Groq AI synthesizer.",
    icon: "🧠",
    unlocked: true,
    progressText: "Generated 3 Custom Tracks",
    xp: 300,
  },
  {
    id: "ach_4",
    title: "Synapse OCR Scholar",
    category: "Intelligence",
    description: "Upload an unstructured document or image and generate interactive study flashcards.",
    icon: "📑",
    unlocked: true,
    progressText: "Analyzed 4 Documents",
    xp: 250,
  },
  {
    id: "ach_5",
    title: "Arena Gladiator",
    category: "Diagnostic",
    description: "Complete a 20-question comprehensive diagnostic test in the Skill Check Arena.",
    icon: "⚡",
    unlocked: true,
    progressText: "Senior Practitioner Tier",
    xp: 400,
  },
  {
    id: "ach_6",
    title: "Consistency Titan",
    category: "Streak",
    description: "Maintain an active 4-day continuous learning streak across lessons and assessments.",
    icon: "🔥",
    unlocked: true,
    progressText: "Active: 4-Day Streak",
    xp: 350,
  },
];

export function StreakHeaderWidget() {
  const [open, setOpen] = useState(false);

  const streakDays = [
    { day: "M", label: "Mon", active: true },
    { day: "T", label: "Tue", active: true },
    { day: "W", label: "Wed", active: true },
    { day: "T", label: "Thu", active: true },
    { day: "F", label: "Fri", active: false },
    { day: "S", label: "Sat", active: false },
    { day: "S", label: "Sun", active: false },
  ];

  const totalXP = 2050;
  const currentLevel = "Level 3: Senior Synthesizer";
  const nextLevelXP = 2500;
  const levelProgress = Math.round((totalXP / nextLevelXP) * 100);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/15 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-semibold transition-all hover:scale-105"
        title="View Learning Streak & Trophy Case"
      >
        <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500 animate-pulse" />
        <span>4-Day Streak</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-orange-500/15 rounded-2xl text-orange-500">
                  <Flame className="w-6 h-6 fill-orange-500" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-foreground">
                    4-Day Active Streak 🔥
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    You are in the top 5% of active learners this week!
                  </DialogDescription>
                </div>
              </div>

              <Badge variant="outline" className="font-mono text-xs text-primary bg-primary/5">
                ✨ {totalXP} Total XP
              </Badge>
            </div>
          </DialogHeader>

          <div className="space-y-6 pt-2 text-xs">
            {/* Weekly Streak Matrix */}
            <div className="p-4 bg-muted/30 rounded-2xl border border-border space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-foreground">
                  <Calendar className="w-4 h-4 text-primary" /> Weekly Momentum
                </span>
                <span className="text-muted-foreground font-mono">4 / 7 Days Active</span>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center">
                {streakDays.map((d, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "p-2 rounded-xl border flex flex-col items-center gap-1 transition-all",
                      d.active
                        ? "bg-orange-500/15 border-orange-500/30 text-orange-600 dark:text-orange-400 font-bold shadow-xs"
                        : "bg-background border-border text-muted-foreground"
                    )}
                  >
                    <span className="text-[10px] font-mono">{d.label}</span>
                    <span className="text-xs">{d.active ? "🔥" : "⚪"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* XP & Level Progression */}
            <div className="p-4 bg-gradient-to-br from-primary/5 to-muted/20 rounded-2xl border border-border space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-primary" /> {currentLevel}
                </span>
                <span className="font-mono text-muted-foreground">{totalXP} / {nextLevelXP} XP</span>
              </div>
              <Progress value={levelProgress} className="h-2" />
              <p className="text-[11px] text-muted-foreground">
                Earn <strong>450 XP more</strong> by completing courses to unlock <em>Level 4: Principal Architect</em>!
              </p>
            </div>

            {/* Unlocked Achievements Showcase */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-yellow-500" /> Unlocked Achievements (6/6)
                </h4>
                <Badge variant="secondary" className="text-[10px] bg-success/15 text-success">
                  All Active
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ACHIEVEMENTS_DATA.map((ach) => (
                  <div
                    key={ach.id}
                    className="p-3 bg-card rounded-xl border border-border/80 flex items-start gap-3 shadow-xs hover:border-primary/40 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center text-lg shrink-0 border border-border/60">
                      {ach.icon}
                    </div>

                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-xs text-foreground truncate">{ach.title}</p>
                        <span className="text-[10px] font-mono text-primary font-bold">+{ach.xp}XP</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {ach.description}
                      </p>
                      <p className="text-[10px] font-medium text-success flex items-center gap-1 pt-1">
                        <CheckCircle2 className="w-3 h-3" /> {ach.progressText}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Quests */}
            <div className="p-4 bg-muted/20 rounded-2xl border border-border/70 space-y-2.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-primary" /> Today&apos;s Capacity Quests
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 bg-background rounded-lg border border-border/60">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span>Complete 1 reading module</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">+50 XP</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-background rounded-lg border border-border/60">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span>Submit 1 reflection prompt to AI coach</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">+100 XP</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-background rounded-lg border border-border/60">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span>Pass a Capstone Certification Exam (&ge;60%)</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">+250 XP</Badge>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
