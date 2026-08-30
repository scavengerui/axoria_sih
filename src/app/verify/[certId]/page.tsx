"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Printer,
  Copy,
  Check,
  ArrowLeft,
  ExternalLink,
  QrCode,
  Sparkles,
  Building2,
  Calendar,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function PublicVerifyCertificatePage({
  params,
}: {
  params: Promise<{ certId: string }>;
}) {
  const resolvedParams = use(params);
  const certId = resolvedParams.certId || "AX-9842F10A";

  const [copied, setCopied] = useState(false);

  // Dynamic / Mock metadata mapping
  const issueDate = "August 30, 2026";
  const recipientName = "Siva Dhanush";
  
  // Resolve course name from certId or fallback
  const isAgile = certId.toLowerCase().includes("agile") || certId === "2";
  const isPrivacy = certId.toLowerCase().includes("privacy") || certId === "3";
  const isDocker = certId.toLowerCase().includes("docker") || certId === "4";
  
  const courseTitle = isAgile
    ? "Agile Leadership & Cross-Functional Team Management"
    : isPrivacy
      ? "Data Privacy, GDPR & Governance Compliance"
      : isDocker
        ? "Docker Containerization & Zero-Trust Security"
        : "Enterprise Information Security & Threat Defense";

  const verificationHash = `0x${certId.replace(/[^a-zA-Z0-9]/g, "").padEnd(16, "a").toLowerCase()}e47b99c01824f2d3a9`;

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Verification URL copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleLinkedInShare = () => {
    const url = typeof window !== "undefined" ? encodeURIComponent(window.location.href) : "";
    const name = encodeURIComponent(courseTitle);
    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${name}&organizationName=Axoria+Enterprise+Learning&issueYear=2026&issueMonth=8&certUrl=${url}&certId=${certId}`;
    window.open(linkedInUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-muted/20 py-10 px-4 sm:px-6 flex flex-col items-center justify-center font-sans print:bg-white print:p-0">
      {/* Top Navbar */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-6 print:hidden">
        <Link
          href="/certificates"
          className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Certificates
        </Link>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-background text-xs gap-1 py-1 px-2.5 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-success" /> Ledger ID: {certId}
          </Badge>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="w-full max-w-3xl flex flex-wrap items-center justify-between gap-3 mb-6 p-4 bg-background rounded-2xl border border-border shadow-xs print:hidden">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-success/15 rounded-xl text-success">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-foreground">Verified Credential Record</h3>
            <p className="text-[11px] text-muted-foreground">Immutable proof issued by Axoria Capacity Connect</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="text-xs h-8 gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy Link"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLinkedInShare}
            className="text-xs h-8 gap-1.5 font-semibold text-primary hover:bg-primary/5"
          >
            <Share2 className="w-3.5 h-3.5" /> Share to LinkedIn
          </Button>

          <Button
            size="sm"
            onClick={handlePrint}
            className="text-xs h-8 gap-1.5 font-semibold"
          >
            <Printer className="w-3.5 h-3.5" /> Print / Save PDF
          </Button>
        </div>
      </div>

      {/* OFFICIAL CERTIFICATE CARD */}
      <div className="w-full max-w-3xl bg-background rounded-3xl border-4 border-double border-primary/20 shadow-2xl p-8 sm:p-14 relative overflow-hidden print:border-2 print:shadow-none print:m-0 print:p-8">
        {/* Background Watermark & Decorative Badges */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full pointer-events-none -z-0" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-primary/10 to-transparent rounded-tr-full pointer-events-none -z-0" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          {/* Header Seal */}
          <div className="flex items-center justify-between w-full border-b border-border/80 pb-6">
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-sm">
                A
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-wider uppercase text-foreground">AXORIA</span>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Capacity Connect LMS</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 bg-success/10 border border-success/30 rounded-full text-[11px] font-semibold text-success">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Authenticity
            </div>
          </div>

          {/* Certificate Main Title */}
          <div className="space-y-2 pt-2">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Certificate of Competency</p>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Executive Certification
            </h1>
            <p className="text-xs text-muted-foreground">This is to officially certify that</p>
          </div>

          {/* Recipient Name */}
          <div className="py-2 border-b-2 border-primary/30 px-8 min-w-[280px]">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground italic">
              {recipientName}
            </h2>
          </div>

          {/* Course Statement */}
          <div className="max-w-lg space-y-2">
            <p className="text-xs text-muted-foreground leading-relaxed">
              has successfully mastered the curriculum, completed in-lesson active reflection checkpoints, and passed the comprehensive Capstone Certification Exam for:
            </p>
            <p className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              &ldquo;{courseTitle}&rdquo;
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full pt-6 border-t border-border/80 text-center">
            <div className="space-y-0.5">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Date Issued</span>
              <p className="text-xs font-semibold text-foreground">{issueDate}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Credential ID</span>
              <p className="text-xs font-mono font-bold text-foreground">{certId}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Passing Score</span>
              <p className="text-xs font-semibold text-success">Passed (&ge;60%)</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Issuer</span>
              <p className="text-xs font-semibold text-foreground">Axoria Board</p>
            </div>
          </div>

          {/* Verification Hash & Signature Seal */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 text-left border-t border-border/60">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
                <Lock className="w-3 h-3 text-primary" /> Hash: <span className="text-foreground">{verificationHash}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Cryptographically signed & permanently registered on Axoria Enterprise Ledger.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-center">
                <div className="w-20 h-0.5 bg-foreground/60 mb-1 mx-auto" />
                <p className="text-[10px] font-bold text-foreground">Dr. R. Sundaram</p>
                <p className="text-[9px] text-muted-foreground">Chief Academic Officer</p>
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-primary/40 bg-primary/5 flex items-center justify-center text-primary shadow-xs">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
