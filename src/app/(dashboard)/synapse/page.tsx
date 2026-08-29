"use client";

import { useState } from "react";
import {
  Sparkles,
  Upload,
  FileText,
  FileCode,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Award,
  Layers,
  MessageSquare,
  RefreshCw,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Send,
  Plus,
  Check,
  X,
  FileSpreadsheet,
  FileCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { analyzeDocumentWithSynapse, askSynapseDoubt } from "@/lib/actions/ai";
import Link from "next/link";

const SAMPLE_DOCUMENT_TEXT = `AXORIA ENTERPRISE ZERO-TRUST & BROWSER SECURITY DIRECTORY

1. PURPOSE & PRINCIPLES
The purpose of this standard is to mandate strict operational hygiene across all enterprise endpoints. The core tenet of our Zero-Trust architecture is 'Never Trust, Always Verify'. Every access request—regardless of origin or network location—must be explicitly authenticated, authorized, and cryptographically validated before granting access.

2. BROWSER EXTENSIONS & ADD-ON GOVERNANCE
Third-party browser extensions introduce significant attack surfaces. Over-privileged extensions with 'read and change all data on all websites' permissions can intercept active OAuth session tokens, bypass multi-factor authentication (MFA), and execute unauthorized API calls. Employees are strictly prohibited from installing unverified browser extensions. Only extensions certified by the Information Security Committee in the Enterprise Add-on Registry are permitted.

3. AUTHENTICATION & CREDENTIAL HYGIENE
All corporate accounts must enforce FIDO2 WebAuthn hardware keys or time-based one-time password (TOTP) authenticators. SMS-based OTPs are strictly disallowed for administrative and developer access due to susceptibility to SIM-swapping and SS7 intercept vulnerabilities. Passwords must contain a minimum of 16 characters and undergo continuous compromised-credential checking.

4. INCIDENT TRIAGE & QUARANTINE PROTOCOLS
If an endpoint exhibits unauthorized token activity or unauthorized extension execution:
- Step 1: Immediate network isolation via Host Quarantine.
- Step 2: Global token revocation in the identity provider (IdP) within 5 minutes.
- Step 3: Forensic log acquisition and dispatch to the Security Operations Center (SOC).`;

export default function SynapsePage() {
  const [docTitle, setDocTitle] = useState("");
  const [docContent, setDocContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Active Tab in Analysis View
  const [activeTab, setActiveTab] = useState("summary");

  // Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Flashcards State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Chat with Document State
  const [doubtQuestion, setDoubtQuestion] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [isAnsweringDoubt, setIsAnsweringDoubt] = useState(false);

  // Handle File Upload (txt, md, json, pdf, pptx, docx text reading via server parser)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const readableName = file.name.replace(/\.[^/.]+$/, "");
    setDocTitle(readableName);
    toast.info(`Extracting clean text from "${file.name}"...`);

    try {
      if (
        file.name.endsWith(".txt") ||
        file.name.endsWith(".md") ||
        file.name.endsWith(".json") ||
        file.name.endsWith(".csv")
      ) {
        const text = await file.text();
        setDocContent(text);
        toast.success(`Extracted ${text.length} characters from ${file.name}`);
      } else {
        // Use server-side clean text extractor
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/parse-document", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.success && data.text) {
          setDocContent(data.text);
          toast.success(`Extracted ${data.textLength} characters from ${file.name}`);
        } else {
          toast.error(data.error || "Could not read binary stream. Please paste text directly.");
        }
      }
    } catch (err: any) {
      toast.error("Failed to parse file: " + err.message);
    }
  };

  const handleLoadSample = () => {
    setDocTitle("Enterprise Zero-Trust & Browser Security Directive");
    setDocContent(SAMPLE_DOCUMENT_TEXT);
    toast.success("Sample enterprise security document loaded!");
  };

  const handleRunAnalysis = async () => {
    if (!docContent.trim()) {
      toast.error("Please upload a file or paste document text.");
      return;
    }

    setIsAnalyzing(true);
    toast.info("Synapse is analyzing document with Groq Llama 3.3...");

    try {
      // Clean any accidental binary stream characters if raw PDF stream was pasted
      let textToSend = docContent;
      if (textToSend.includes("%PDF-") || textToSend.includes("/FlateDecode") || textToSend.includes("endobj")) {
        textToSend = textToSend.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ").trim();
      }

      const res = await analyzeDocumentWithSynapse(
        docTitle.trim() || "Uploaded Document",
        textToSend
      );

      if (res.success && res.data) {
        setAnalysisResult(res.data);
        setSelectedAnswers({});
        setQuizSubmitted(false);
        setQuizScore(0);
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setChatMessages([
          {
            role: "assistant",
            content: `I have analyzed **"${docTitle || "your document"}"**. You can test yourself with the Quiz, review Flashcards, or ask me any doubts about it!`,
          },
        ]);
        toast.success("Synapse Analysis Complete! ⚡");
      } else {
        toast.error(res.error || "Failed to analyze document. Please check your Groq API key.");
      }
    } catch (err: any) {
      toast.error("Groq AI analysis error: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuizAnswer = (qId: string, optIdx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleQuizSubmit = () => {
    let correct = 0;
    const questions = analysisResult?.quiz || [];
    questions.forEach((q: any) => {
      if (selectedAnswers[q.id] === q.correctIndex) correct++;
    });

    const score = Math.round((correct / Math.max(1, questions.length)) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);

    if (score >= 70) {
      toast.success(`Passed with ${score}%! Verified competency achieved 🏆`);
    } else {
      toast.error(`Score: ${score}%. Minimum passing score is 70%.`);
    }
  };

  const handleAskDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtQuestion.trim() || isAnsweringDoubt) return;

    const userQ = doubtQuestion.trim();
    setDoubtQuestion("");
    const newHistory = [...chatMessages, { role: "user" as const, content: userQ }];
    setChatMessages(newHistory);
    setIsAnsweringDoubt(true);

    try {
      const res = await askSynapseDoubt(docTitle || "Document", docContent, userQ, newHistory);
      if (res.success && res.answer) {
        setChatMessages([...newHistory, { role: "assistant", content: res.answer }]);
      } else {
        setChatMessages([
          ...newHistory,
          { role: "assistant", content: "I'm having trouble analyzing this question right now." },
        ]);
      }
    } catch {
      toast.error("Failed to get answer.");
    } finally {
      setIsAnsweringDoubt(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Synapse</h1>
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary font-semibold">
              Universal Document Intelligence
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Upload any presentation, policy, PDF, or text notes to instantly synthesize summaries, interactive quizzes, flashcards, and doubt resolution.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLoadSample}
          className="text-xs h-9 gap-1.5 border-dashed"
        >
          <FileCheck className="w-3.5 h-3.5 text-primary" /> Load Sample Security SOP
        </Button>
      </div>

      {/* DOCUMENT INPUT / UPLOAD CARD */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Upload or Paste Knowledge Material</CardTitle>
          <CardDescription className="text-xs">
            Supports PDF, PPTX, DOCX, Markdown, Text, Code, or raw meeting notes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Dropzone Upload */}
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center space-y-3 bg-muted/20 flex flex-col items-center justify-center relative hover:border-primary/50 transition-colors">
              <Upload className="w-8 h-8 text-primary" />
              <div>
                <p className="text-xs font-semibold text-foreground">Drag & Drop or Click to Upload</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">.pdf, .pptx, .docx, .txt, .md</p>
              </div>
              <input
                type="file"
                accept=".pdf,.pptx,.docx,.txt,.md,.json,.csv"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            {/* Title & Text Area */}
            <div className="md:col-span-2 space-y-3">
              <Input
                placeholder="Document Title (e.g. Q3 Compliance & Data Governance Standard)"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="text-xs h-9"
              />
              <Textarea
                placeholder="Or paste your presentation transcript, compliance checklist, or lecture notes here..."
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
                className="text-xs min-h-[110px] font-mono leading-relaxed"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-[11px] text-muted-foreground font-mono">
              {docContent.length > 0 ? `${docContent.length} characters ready for Groq LPU synthesis` : "Ready for input"}
            </span>

            <Button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || !docContent.trim()}
              className="gap-2 text-xs h-9 font-semibold"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Synthesizing with Groq AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> Synthesize with Synapse
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SYNAPSE MULTI-TAB RESULTS */}
      {analysisResult && (
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 max-w-2xl">
              <TabsTrigger value="summary" className="text-xs gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Summary
              </TabsTrigger>
              <TabsTrigger value="quiz" className="text-xs gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" /> AI Quiz ({analysisResult.quiz?.length || 5})
              </TabsTrigger>
              <TabsTrigger value="flashcards" className="text-xs gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Flashcards ({analysisResult.flashcards?.length || 5})
              </TabsTrigger>
              <TabsTrigger value="doubts" className="text-xs gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> Ask Doubts
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: EXECUTIVE SUMMARY */}
            <TabsContent value="summary" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" /> Executive Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-xs text-muted-foreground leading-relaxed">
                    <p className="p-4 bg-muted/30 rounded-xl border border-border/70 text-foreground text-xs leading-relaxed">
                      {analysisResult.summary}
                    </p>

                    <div className="space-y-2 pt-2">
                      <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">
                        Core Principles & Takeaways:
                      </h4>
                      <ul className="space-y-2">
                        {analysisResult.keyTakeaways?.map((takeaway: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-foreground">
                            <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">
                              {idx + 1}
                            </span>
                            <span>{takeaway}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border border-border flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Transform Knowledge</CardTitle>
                    <CardDescription className="text-xs">
                      Export this synthesized material into corporate training.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link href="/trainer/courses/new">
                      <Button className="w-full text-xs h-9 gap-2 font-semibold">
                        <Plus className="w-3.5 h-3.5" /> Convert to Official Course
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("quiz")}
                      className="w-full text-xs h-9 gap-2"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-primary" /> Take Generated Quiz
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("flashcards")}
                      className="w-full text-xs h-9 gap-2"
                    >
                      <Layers className="w-3.5 h-3.5 text-primary" /> Study Flashcards
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 2: INTERACTIVE AI QUIZ */}
            <TabsContent value="quiz" className="space-y-6">
              <Card className="border border-border">
                <CardHeader className="pb-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">Assessment: {docTitle || "Document Quiz"}</CardTitle>
                    <CardDescription className="text-xs">
                      Passing score: 70% • Grounded strictly in uploaded content.
                    </CardDescription>
                  </div>
                  {quizSubmitted && (
                    <Badge
                      variant={quizScore >= 70 ? "secondary" : "destructive"}
                      className="text-xs font-semibold px-3 py-1"
                    >
                      Score: {quizScore}% {quizScore >= 70 ? "🎉 Passed" : "⚠️ Try Again"}
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="space-y-6">
                  {analysisResult.quiz?.map((q: any, qIdx: number) => (
                    <div key={q.id || qIdx} className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-3">
                      <p className="text-xs font-semibold text-foreground">
                        {qIdx + 1}. {q.text}
                      </p>

                      <div className="space-y-2">
                        {q.options.map((opt: string, optIdx: number) => {
                          const isSelected = selectedAnswers[q.id] === optIdx;
                          const isCorrect = q.correctIndex === optIdx;

                          let btnClass = "border-border hover:bg-muted text-foreground";
                          if (quizSubmitted) {
                            if (isCorrect) btnClass = "border-success bg-success/15 text-success font-semibold";
                            else if (isSelected && !isCorrect)
                              btnClass = "border-destructive bg-destructive/15 text-destructive font-semibold";
                          } else if (isSelected) {
                            btnClass = "border-primary bg-primary/10 text-primary font-semibold";
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleQuizAnswer(q.id, optIdx)}
                              className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${btnClass}`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && isCorrect && <Check className="h-3.5 w-3.5 text-success" />}
                              {quizSubmitted && isSelected && !isCorrect && <X className="h-3.5 w-3.5 text-destructive" />}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && q.explanation && (
                        <p className="text-[11px] text-muted-foreground p-2.5 bg-background rounded-lg border border-border/50">
                          💡 <strong className="text-foreground">Explanation:</strong> {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}

                  <div className="flex justify-between items-center pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAnswers({});
                        setQuizSubmitted(false);
                        setQuizScore(0);
                      }}
                      className="text-xs h-9"
                    >
                      <RotateCw className="w-3.5 h-3.5 mr-1.5" /> Reset Answers
                    </Button>

                    {!quizSubmitted && (
                      <Button
                        size="sm"
                        onClick={handleQuizSubmit}
                        disabled={Object.keys(selectedAnswers).length < (analysisResult.quiz?.length || 1)}
                        className="text-xs h-9 font-semibold"
                      >
                        Submit Assessment
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: REVISION FLASHCARDS */}
            <TabsContent value="flashcards" className="space-y-6">
              <Card className="border border-border">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">Interactive Revision Flashcards</CardTitle>
                      <CardDescription className="text-xs">
                        Click the card to flip between Question and Key Insight.
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Card {currentCardIndex + 1} of {analysisResult.flashcards?.length || 5}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 flex flex-col items-center">
                  {/* 3D Flip Card */}
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="w-full max-w-lg min-h-[220px] p-8 rounded-2xl border-2 border-border/80 bg-gradient-to-br from-card to-muted/40 shadow-sm cursor-pointer flex flex-col items-center justify-center text-center hover:border-primary/50 transition-all select-none relative group"
                  >
                    <Badge variant="outline" className="absolute top-4 left-4 text-[10px]">
                      {isFlipped ? "Answer / Insight" : "Prompt / Question"}
                    </Badge>

                    <div className="space-y-2 max-w-md">
                      <p className="text-sm sm:text-base font-semibold text-foreground leading-relaxed">
                        {isFlipped
                          ? analysisResult.flashcards?.[currentCardIndex]?.back
                          : analysisResult.flashcards?.[currentCardIndex]?.front}
                      </p>
                    </div>

                    <span className="text-[10px] text-muted-foreground absolute bottom-4 group-hover:text-primary transition-colors">
                      Click card to flip ↻
                    </span>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentCardIndex((prev) => Math.max(0, prev - 1));
                      }}
                      disabled={currentCardIndex === 0}
                      className="text-xs h-9 gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentCardIndex((prev) =>
                          Math.min((analysisResult.flashcards?.length || 1) - 1, prev + 1)
                        );
                      }}
                      disabled={currentCardIndex === (analysisResult.flashcards?.length || 1) - 1}
                      className="text-xs h-9 gap-1"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 4: CHAT WITH DOCUMENT (ASK DOUBTS) */}
            <TabsContent value="doubts" className="space-y-6">
              <Card className="border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" /> Ask Doubts About This Document
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Ask any question, request simpler explanations, or check edge cases grounded in this material.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Chat Thread */}
                  <div className="space-y-3 max-h-[350px] overflow-y-auto p-4 rounded-xl bg-muted/20 border border-border/70">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-3 text-xs leading-relaxed ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-xl max-w-[80%] ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground font-medium"
                              : "bg-background border border-border text-foreground shadow-sm"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {isAnsweringDoubt && (
                      <div className="flex gap-2 items-center text-xs text-muted-foreground p-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                        <span>Synapse is reading document context...</span>
                      </div>
                    )}
                  </div>

                  {/* Ask Form */}
                  <form onSubmit={handleAskDoubt} className="flex gap-2">
                    <Input
                      placeholder="e.g. Explain Section 2 risks in simple words, or what is the quarantine step?"
                      value={doubtQuestion}
                      onChange={(e) => setDoubtQuestion(e.target.value)}
                      className="text-xs h-9"
                    />
                    <Button type="submit" size="sm" disabled={isAnsweringDoubt || !doubtQuestion.trim()} className="text-xs h-9 px-4 gap-1.5">
                      <Send className="w-3.5 h-3.5" /> Ask
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
