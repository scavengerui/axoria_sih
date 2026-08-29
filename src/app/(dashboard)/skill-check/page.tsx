"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  Sparkles,
  Award,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  HelpCircle,
  TrendingUp,
  Layers,
  Check,
  X,
  Target,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { generateIdeaSkillCheck } from "@/lib/actions/ai";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SAMPLE_IDEAS = [
  "Docker Container Security & Zero-Trust",
  "React Server Components & Next.js Architecture",
  "System Design & Distributed Caching",
  "Prompt Engineering & LLM Guardrails",
  "Kubernetes Pod Autoscaling & Ingress",
  "Executive Cross-Functional Leadership",
];

export default function SkillCheckPage() {
  const router = useRouter();

  // Configuration Form State
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced" | "Expert">("Intermediate");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [isGenerating, setIsGenerating] = useState(false);

  // Test Runner State
  const [testActive, setTestActive] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const handleStartTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isGenerating) return;

    setIsGenerating(true);
    toast.info(`Generating ${questionCount} diagnostic questions on "${topic}" with Groq LPU...`);

    try {
      const res = await generateIdeaSkillCheck({
        topic: topic.trim(),
        difficulty,
        questionCount,
      });

      if (res.success && res.questions && res.questions.length > 0) {
        setQuestions(res.questions);
        setSelectedAnswers({});
        setCurrentIdx(0);
        setTestSubmitted(false);
        setFinalScore(0);
        setTestActive(true);
        toast.success(`Diagnostic ready! ${res.questions.length} questions loaded.`);
      } else {
        toast.error("Failed to generate questions. Please try again.");
      }
    } catch (err: any) {
      toast.error("Generation error: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (optIdx: number) => {
    if (testSubmitted) return;
    const currentQ = questions[currentIdx];
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id || currentIdx]: optIdx,
    }));
  };

  const handleSubmitTest = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      const selected = selectedAnswers[q.id || idx];
      if (selected === q.correctIndex) {
        correct++;
      }
    });

    const score = Math.round((correct / Math.max(1, questions.length)) * 100);
    setFinalScore(score);
    setTestSubmitted(true);

    if (score >= 80) {
      toast.success(`🎉 Outstanding! Mastery score: ${score}% (${correct}/${questions.length})`);
    } else if (score >= 60) {
      toast.success(`👏 Good performance! Score: ${score}% (${correct}/${questions.length})`);
    } else {
      toast.info(`Score: ${score}% (${correct}/${questions.length}). Review your results below.`);
    }
  };

  const handleReset = () => {
    setTestActive(false);
    setQuestions([]);
    setSelectedAnswers({});
    setTestSubmitted(false);
    setFinalScore(0);
    setCurrentIdx(0);
  };

  const currentQ = questions[currentIdx];
  const answeredCount = Object.keys(selectedAnswers).length;
  const currentSelected = currentQ ? selectedAnswers[currentQ.id || currentIdx] : undefined;

  const getTier = (score: number) => {
    if (score >= 85) return { title: "Senior Practitioner / Mastery", color: "bg-success/15 text-success border-success/30", icon: "🏆" };
    if (score >= 70) return { title: "Proficient / Solid Competency", color: "bg-primary/10 text-primary border-primary/20", icon: "🌟" };
    if (score >= 50) return { title: "Developing / Foundational Knowledge", color: "bg-warning/15 text-warning border-warning/30", icon: "📘" };
    return { title: "Novice / High Upskill Potential", color: "bg-destructive/15 text-destructive border-destructive/30", icon: "💡" };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Zap className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Skill Check & Idea Arena</h1>
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary font-semibold">
              Diagnostic Benchmark
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Test your knowledge on any concept, architecture, or idea. Generate up to 20 adaptive questions and benchmark your competency.
          </p>
        </div>

        {testActive && (
          <Button variant="outline" size="sm" onClick={handleReset} className="text-xs h-9 gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Test New Topic
          </Button>
        )}
      </div>

      {!testActive ? (
        /* CONFIGURATION SETUP CARD */
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              <span>Configure Your Diagnostic Assessment</span>
              <Badge variant="outline" className="text-[11px] font-mono">
                Max 20 Questions
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Enter any topic or idea. Axoria AI will synthesize technical scenario questions to assess your mastery.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleStartTest} className="space-y-5">
              {/* Topic Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  Topic or Concept Name:
                </label>
                <Input
                  placeholder="e.g. Next.js Server Components, Kubernetes Autoscaling, System Design, Zero-Trust..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="text-xs h-10 font-medium"
                  autoFocus
                />
              </div>

              {/* Sample Topics */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-muted-foreground font-medium">
                  💡 Popular Benchmark Topics:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_IDEAS.map((idea) => (
                    <button
                      key={idea}
                      type="button"
                      onClick={() => setTopic(idea)}
                      className="text-[11px] px-2.5 py-1 rounded-lg border border-border bg-muted/30 hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-colors text-left"
                    >
                      {idea}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Difficulty */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  Target Proficiency Tier:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["Beginner", "Intermediate", "Advanced", "Expert"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`py-2 rounded-xl border text-xs transition-all ${
                        difficulty === lvl
                          ? "border-primary bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Count Selector (Max 20) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-foreground">
                    Number of Diagnostic Questions:
                  </label>
                  <span className="text-xs font-bold text-primary font-mono">
                    {questionCount} Questions
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setQuestionCount(cnt)}
                      className={`py-2 rounded-xl border text-xs font-mono transition-all ${
                        questionCount === cnt
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {cnt} Questions
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 border-t border-border flex justify-end">
                <Button
                  type="submit"
                  disabled={isGenerating || !topic.trim()}
                  className="text-xs h-10 font-semibold gap-2 px-5"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Synthesizing Diagnostic with Groq...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Start Skill Check ({questionCount} Questions) <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : !testSubmitted ? (
        /* ACTIVE TEST RUNNER */
        <div className="space-y-6">
          {/* Progress Header */}
          <Card className="border border-border shadow-xs p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-semibold text-foreground">
                    {topic}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {difficulty} Level
                  </Badge>
                </div>

                <span className="text-muted-foreground font-mono">
                  Question <strong className="text-foreground">{currentIdx + 1}</strong> of {questions.length} ({answeredCount} answered)
                </span>
              </div>

              <Progress value={Math.round(((currentIdx + 1) / questions.length) * 100)} className="h-1.5" />

              {/* Question Navigation Matrix */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {questions.map((q, idx) => {
                  const isAnswered = selectedAnswers[q.id || idx] !== undefined;
                  const isCur = idx === currentIdx;

                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentIdx(idx)}
                      className={cn(
                        "w-7 h-7 rounded-lg text-xs font-mono transition-all flex items-center justify-center border",
                        isCur
                          ? "border-primary bg-primary text-primary-foreground font-bold shadow-xs"
                          : isAnswered
                            ? "border-primary/40 bg-primary/10 text-primary font-semibold"
                            : "border-border text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Question Card */}
          {currentQ && (
            <Card className="border border-border shadow-sm p-6 space-y-6">
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Question {currentIdx + 1} of {questions.length}
                </span>
                <h2 className="text-base sm:text-lg font-semibold text-foreground leading-relaxed">
                  {currentQ.text}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options?.map((opt: string, optIdx: number) => {
                  const isSelected = currentSelected === optIdx;

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(optIdx)}
                      className={cn(
                        "w-full text-left p-4 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary font-semibold shadow-xs"
                          : "border-border hover:bg-muted/60 text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "w-6 h-6 rounded-lg text-xs font-mono flex items-center justify-center border",
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary font-bold"
                              : "bg-muted text-muted-foreground border-border"
                          )}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                  disabled={currentIdx === 0}
                  className="text-xs h-9 gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Previous
                </Button>

                <div className="flex gap-2">
                  {currentIdx < questions.length - 1 ? (
                    <Button
                      size="sm"
                      onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                      className="text-xs h-9 gap-1.5"
                    >
                      Next Question <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={handleSubmitTest}
                      disabled={answeredCount < questions.length}
                      className="text-xs h-9 font-semibold bg-success hover:bg-success/90 text-white gap-1.5"
                    >
                      <Award className="w-4 h-4" /> Submit Diagnostic ({answeredCount}/{questions.length})
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      ) : (
        /* COMPREHENSIVE SCORE & BENCHMARK REPORT */
        <div className="space-y-8 animate-in fade-in">
          {/* Score Summary Card */}
          <Card className="border border-border shadow-md overflow-hidden">
            <div className="p-8 bg-gradient-to-br from-card via-muted/20 to-primary/5 text-center space-y-4">
              <Badge variant="outline" className="text-xs px-3 py-1 bg-background">
                Diagnostic Assessment Complete
              </Badge>

              <div className="space-y-1">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                  {finalScore}%
                </h2>
                <p className="text-xs text-muted-foreground font-mono">
                  {Math.round((finalScore / 100) * questions.length)} of {questions.length} Questions Correct
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold shadow-xs"
                style={{ backgroundColor: "var(--background)" }}
              >
                <span>{getTier(finalScore).icon}</span>
                <span>Proficiency Tier: <strong>{getTier(finalScore).title}</strong></span>
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-3">
                <Button variant="outline" size="sm" onClick={handleReset} className="text-xs h-9 gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" /> Test Another Idea
                </Button>

                <Link href="/catalog">
                  <Button size="sm" className="text-xs h-9 gap-1.5 font-semibold">
                    <BookOpen className="w-3.5 h-3.5" /> Generate Full Course on &ldquo;{topic}&rdquo;
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Detailed Question Review Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" /> Question-by-Question Deep Dive ({questions.length} Items)
              </h3>
              <Badge variant="secondary" className="text-[10px]">
                Detailed Explanations
              </Badge>
            </div>

            <div className="space-y-4">
              {questions.map((q, idx) => {
                const userSelected = selectedAnswers[q.id || idx];
                const isCorrect = userSelected === q.correctIndex;

                return (
                  <Card key={q.id || idx} className="border border-border shadow-xs p-5 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg text-xs font-mono flex items-center justify-center bg-muted text-muted-foreground font-bold">
                          {idx + 1}
                        </span>
                        <p className="text-xs sm:text-sm font-semibold text-foreground">
                          {q.text}
                        </p>
                      </div>

                      {isCorrect ? (
                        <Badge variant="secondary" className="bg-success/15 text-success border-success/30 text-[10px] shrink-0 gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Correct
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-[10px] shrink-0 gap-1">
                          <XCircle className="w-3 h-3" /> Missed
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options?.map((opt: string, optIdx: number) => {
                        const isThisCorrect = q.correctIndex === optIdx;
                        const isUserChoice = userSelected === optIdx;

                        let style = "border-border text-muted-foreground bg-card";
                        if (isThisCorrect) {
                          style = "border-success bg-success/15 text-success font-semibold";
                        } else if (isUserChoice && !isThisCorrect) {
                          style = "border-destructive bg-destructive/15 text-destructive font-semibold";
                        }

                        return (
                          <div
                            key={optIdx}
                            className={cn("p-2.5 rounded-lg border flex items-center justify-between", style)}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="font-mono text-[10px] font-bold">
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              <span className="truncate">{opt}</span>
                            </div>
                            {isThisCorrect && <Check className="w-3.5 h-3.5 text-success shrink-0" />}
                            {isUserChoice && !isThisCorrect && <X className="w-3.5 h-3.5 text-destructive shrink-0" />}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="p-3 bg-muted/30 rounded-xl border border-border/60 text-xs text-muted-foreground leading-relaxed">
                        💡 <strong className="text-foreground">Why this is correct:</strong> {q.explanation}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
