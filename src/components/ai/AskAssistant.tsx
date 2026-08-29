"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useOrganization, useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Loader2,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { askAssistant } from "@/lib/actions/ai";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Clean markdown formatter: strips stray asterisks, renders bold & links cleanly
function FormattedAssistantMessage({ content }: { content: string }) {
  // 1. Clean up nested/adjacent asterisks and markdown quirks
  const cleaned = content
    .replace(/\*\*\[([^\]]+)\]\(([^)]+)\)\*\*/g, "[$1]($2)") // **[Link](url)** -> [Link](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)\*\*/g, "[$1]($2)")    // [Link](url)** -> [Link](url)
    .replace(/\*\*\[([^\]]+)\]\(([^)]+)\)/g, "[$1]($2)");    // **[Link](url) -> [Link](url)

  // Split into paragraphs / lines
  const lines = cleaned.split("\n").filter((l) => l.trim().length > 0);

  const formatInlineText = (text: string) => {
    // Parse links and bold tokens
    const tokens: React.ReactNode[] = [];
    // Match either [Link](url) OR **Bold**
    const combinedRegex = /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)/g;
    let lastIndex = 0;
    let match;

    while ((match = combinedRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        // Plain text before token
        tokens.push(text.substring(lastIndex, match.index).replace(/\*\*/g, ""));
      }

      if (match[1]) {
        // Link match: [LinkText](url)
        const linkText = match[2];
        const linkHref = match[3];
        tokens.push(
          <Link
            key={`l-${match.index}`}
            href={linkHref}
            className="inline-flex items-center gap-1 font-semibold text-primary underline underline-offset-2 hover:text-primary/80 bg-primary/10 px-1.5 py-0.2 rounded transition-colors"
          >
            {linkText}
            <ExternalLink className="h-2.5 w-2.5 inline" />
          </Link>
        );
      } else if (match[4]) {
        // Bold match: **BoldText**
        tokens.push(
          <strong key={`b-${match.index}`} className="font-semibold text-foreground">
            {match[5]}
          </strong>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      tokens.push(text.substring(lastIndex).replace(/\*\*/g, ""));
    }

    return tokens.length > 0 ? tokens : text.replace(/\*\*/g, "");
  };

  return (
    <div className="space-y-2 text-xs leading-relaxed">
      {lines.map((line, idx) => {
        const isBullet = line.startsWith("- ") || line.startsWith("* ");
        const isNumbered = /^\d+\.\s/.test(line);

        if (isBullet) {
          const bulletContent = line.replace(/^[-*]\s+/, "");
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1">
              <span className="text-primary font-bold">•</span>
              <div className="flex-1">{formatInlineText(bulletContent)}</div>
            </div>
          );
        }

        if (isNumbered) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1">
              <div className="flex-1">{formatInlineText(line)}</div>
            </div>
          );
        }

        return <p key={idx}>{formatInlineText(line)}</p>;
      })}
    </div>
  );
}

export function AskAssistant() {
  const pathname = usePathname();
  const { user } = useUser();
  const { membership } = useOrganization();

  const userRole = membership?.role || "org:admin";
  const userName = user?.fullName || user?.firstName || undefined;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hi ${user?.firstName || "there"}! I'm Axoria AI. I'm aware you're an **${
        userRole === "org:admin" ? "Administrator" : userRole === "org:manager" ? "Manager" : userRole === "org:trainer" ? "Trainer" : "Learner"
      }** and can help you manage, create, or navigate training. What would you like to know?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom smoothly on message update
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isLoading) {
      inputRef.current?.focus();
    }
  }, [isOpen, isLoading]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput("");
    setIsLoading(true);

    try {
      const historyPayload = newHistory
        .filter((m) => m.id !== "welcome")
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const result = await askAssistant(textToSend.trim(), historyPayload, {
        userRole,
        currentPage: pathname,
        userName,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I had trouble generating a response. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        content: "Chat cleared! How can I assist you now?",
        timestamp: new Date(),
      },
    ]);
  };

  const suggestedQuestions =
    userRole === "org:admin"
      ? [
          "How do learners earn certificates?",
          "How do I approve trainer courses?",
          "Where do I view org skill gap analytics?",
        ]
      : userRole === "org:manager"
        ? [
            "How do I assign mandatory training?",
            "Show me my team's completion status",
            "Which courses are available?",
          ]
        : userRole === "org:trainer"
          ? [
              "How do I create a course with AI quizzes?",
              "Where do I view my published courses?",
              "Can I add YouTube video lessons?",
            ]
          : [
              "What mandatory training should I take?",
              "How do I earn my certificate?",
              "Show me cybersecurity courses",
            ];

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-50 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-2xl hover:shadow-primary/30 transition-all hover:scale-105 flex items-center justify-center border border-primary-foreground/20 cursor-pointer"
          title="Ask Axoria AI"
        >
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-[390px] h-[520px] max-w-[calc(100vw-2.5rem)] max-h-[calc(100vh-6rem)] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-3 duration-200">
          {/* Header - Fixed */}
          <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs font-semibold flex items-center gap-1.5">
                  Axoria AI
                  <span className="text-[10px] font-normal text-muted-foreground px-1.5 py-0.2 rounded-full bg-muted border">
                    {userRole === "org:admin" ? "Admin" : userRole === "org:manager" ? "Manager" : userRole === "org:trainer" ? "Trainer" : "Learner"}
                  </span>
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Powered by Groq 120B
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={handleClearChat}
                title="Clear conversation"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Native Scrollable Messages Area */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 overscroll-contain">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2.5",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}

                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-xs font-normal"
                      : "bg-muted/60 text-foreground border border-border/50 rounded-bl-xs"
                  )}
                >
                  {message.role === "user" ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  ) : (
                    <FormattedAssistantMessage content={message.content} />
                  )}
                </div>

                {message.role === "user" && (
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                    <User className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="bg-muted/60 border border-border/50 rounded-2xl rounded-bl-xs px-3.5 py-2.5 flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span className="text-[11px] text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}

            {/* Suggested Questions */}
            {messages.length === 1 && (
              <div className="space-y-1.5 mt-3 pt-2 border-t border-border/40">
                <p className="text-[11px] text-muted-foreground font-medium">
                  Suggested prompts:
                </p>
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="block w-full text-left text-xs px-3 py-2 rounded-xl border border-border bg-card hover:bg-accent hover:text-accent-foreground transition-colors font-medium shadow-2xs cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Bottom scroll anchor */}
            <div ref={messageEndRef} />
          </div>

          {/* Input Area - Fixed */}
          <div className="shrink-0 p-3 border-t border-border bg-background">
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about courses, roles, analytics..."
                disabled={isLoading}
                className="flex-1 border border-border bg-muted/30 focus-visible:ring-1 text-xs h-9"
              />
              <Button
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
