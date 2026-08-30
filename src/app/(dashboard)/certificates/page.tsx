"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Award, Download, Calendar, FileText, CheckCircle2, ShieldCheck, Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import { getUserCertificates } from "@/lib/actions/enrollment";
import { useEffect } from "react";

interface CertificateItem {
  id: string;
  courseName: string;
  issueDate: string;
  certificateId: string;
  instructor: string;
}

const DEFAULT_CERTIFICATES: CertificateItem[] = [
  {
    id: "cert-1",
    courseName: "Enterprise Information Security & Threat Defense",
    issueDate: "2026-08-15",
    certificateId: "AX-SEC-92847",
    instructor: "Dr. Raghavan Sundaram",
  },
  {
    id: "cert-2",
    courseName: "Data Privacy, GDPR & Governance Compliance",
    issueDate: "2026-08-20",
    certificateId: "AX-PRV-48192",
    instructor: "Dr. Ananya Sengupta",
  },
];

export default function CertificatesPage() {
  const { user } = useUser();
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDbLoaded, setIsDbLoaded] = useState(false);

  useEffect(() => {
    async function loadCerts() {
      if (!user?.id) return;
      try {
        const res = await getUserCertificates(user.id);
        if (res.success && res.certificates) {
          const formatted = res.certificates.map((c: any) => ({
            id: c._id,
            courseName: c.courseId?.title || "Enterprise Capability Training",
            issueDate: new Date(c.issuedAt).toLocaleDateString(),
            certificateId: c.certificateId || "AX-SIH-2026",
            instructor: "Dr. Raghavan Sundaram",
          }));
          setCertificates(formatted);
          setIsDbLoaded(true);
        }
      } catch (err) {
        console.error("Error loading certificates:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCerts();
  }, [user?.id]);

  const learnerName = user?.fullName || "Learner Name";

  // Real in-browser PDF / Image Certificate Generator
  const downloadCertificate = (cert: CertificateItem) => {
    setIsGenerating(true);
    toast.info(`Generating Certificate for ${cert.courseName}...`);

    try {
      // Create high-res offscreen canvas
      const canvas = document.createElement("canvas");
      canvas.width = 1600;
      canvas.height = 1100;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        toast.error("Unable to create certificate canvas.");
        return;
      }

      // Background & Borders
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Elegant double border
      ctx.strokeStyle = "#1A1A24";
      ctx.lineWidth = 12;
      ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

      ctx.strokeStyle = "#E5E5EA";
      ctx.lineWidth = 3;
      ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

      // Gold top badge accent
      ctx.fillStyle = "#1A1A24";
      ctx.fillRect(canvas.width / 2 - 100, 40, 200, 10);

      // Header: AXORIA
      ctx.font = "bold 44px sans-serif";
      ctx.fillStyle = "#1A1A24";
      ctx.textAlign = "center";
      ctx.fillText("AXORIA", canvas.width / 2, 160);

      ctx.font = "500 18px sans-serif";
      ctx.fillStyle = "#6B7280";
      ctx.letterSpacing = "4px";
      ctx.fillText("CAPACITY BUILDING & LEARNING PLATFORM", canvas.width / 2, 200);

      // Certificate of Completion
      ctx.font = "bold 56px serif";
      ctx.fillStyle = "#1A1A24";
      ctx.letterSpacing = "0px";
      ctx.fillText("Certificate of Completion", canvas.width / 2, 320);

      ctx.font = "italic 22px serif";
      ctx.fillStyle = "#6B7280";
      ctx.fillText("This is proudly presented to", canvas.width / 2, 390);

      // Learner Name
      ctx.font = "bold 52px sans-serif";
      ctx.fillStyle = "#1A1A24";
      ctx.fillText(learnerName, canvas.width / 2, 480);

      // Divider line
      ctx.strokeStyle = "#1A1A24";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 250, 520);
      ctx.lineTo(canvas.width / 2 + 250, 520);
      ctx.stroke();

      // Description
      ctx.font = "20px sans-serif";
      ctx.fillStyle = "#4B5563";
      ctx.fillText(
        "for successfully demonstrating proficiency and completing all modules of",
        canvas.width / 2,
        580
      );

      // Course Name
      ctx.font = "bold 38px sans-serif";
      ctx.fillStyle = "#1A1A24";
      ctx.fillText(cert.courseName, canvas.width / 2, 650);

      // Bottom Signatures & Verification
      const bottomY = 880;

      // Left: Issue Date & Verification ID
      ctx.textAlign = "left";
      ctx.font = "16px sans-serif";
      ctx.fillStyle = "#6B7280";
      ctx.fillText(`Issued On: ${new Date(cert.issueDate).toLocaleDateString()}`, 120, bottomY);
      ctx.fillText(`Certificate ID: ${cert.certificateId}`, 120, bottomY + 30);
      ctx.fillText("Verification: axoria.io/verify", 120, bottomY + 60);

      // Center: Official Stamp
      ctx.textAlign = "center";
      ctx.fillStyle = "#1A1A24";
      ctx.beginPath();
      ctx.arc(canvas.width / 2, bottomY + 20, 50, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = "bold 12px sans-serif";
      ctx.fillText("OFFICIAL", canvas.width / 2, bottomY + 15);
      ctx.fillText("VERIFIED", canvas.width / 2, bottomY + 32);

      // Right: Instructor signature
      ctx.textAlign = "right";
      ctx.font = "italic bold 28px serif";
      ctx.fillStyle = "#1A1A24";
      ctx.fillText(cert.instructor, canvas.width - 120, bottomY + 20);
      ctx.beginPath();
      ctx.moveTo(canvas.width - 320, bottomY + 35);
      ctx.lineTo(canvas.width - 120, bottomY + 35);
      ctx.stroke();
      ctx.font = "16px sans-serif";
      ctx.fillStyle = "#6B7280";
      ctx.fillText("Authorized Course Instructor", canvas.width - 120, bottomY + 60);

      // Trigger instant browser download as high-res PNG / printable document
      const link = document.createElement("a");
      link.download = `Axoria-Certificate-${cert.certificateId}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast.success(`Downloaded Certificate #${cert.certificateId}! 🏆`);
    } catch (err: any) {
      console.error("Certificate download error:", err);
      toast.error("Failed to generate certificate download.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Certificates</h1>
        <p className="text-muted-foreground mt-1">
          View, verify, and download your officially issued completion credentials.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="p-6 space-y-4 border-border">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </Card>
          ))}
        </div>
      ) : certificates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border rounded-xl border-dashed bg-muted/10">
          <Award className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-semibold">No certificates yet</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Complete courses that offer certifications to see them appear here. Keep learning!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <Card
              key={cert.id}
              className="relative overflow-hidden group hover:shadow-md transition-all border-border"
            >
              {/* Decorative top border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />

              <CardHeader className="pb-4 pt-6">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary mb-3">
                    <Award className="h-6 w-6" />
                  </div>
                  <Badge
                    variant="secondary"
                    className="font-mono text-xs text-muted-foreground"
                  >
                    {cert.certificateId}
                  </Badge>
                </div>
                <CardTitle className="leading-tight line-clamp-2 min-h-[3rem] text-base">
                  {cert.courseName}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span suppressHydrationWarning className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Issued: {new Date(cert.issueDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1 text-success font-medium">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Link href={`/verify/${cert.certificateId}`} className="flex-1">
                    <Button
                      className="w-full gap-1.5 text-xs h-9 font-semibold"
                      variant="default"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Verify & Share
                    </Button>
                  </Link>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 shrink-0"
                    title="Quick Download PNG"
                    disabled={isGenerating}
                    onClick={() => downloadCertificate(cert)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Certificate Preview Modal */}
      {selectedCert && (
        <Dialog open={Boolean(selectedCert)} onOpenChange={() => setSelectedCert(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" /> Certificate of Completion
              </DialogTitle>
            </DialogHeader>

            <div className="border-2 border-primary/20 rounded-2xl p-6 bg-muted/10 space-y-4 text-center">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                Official Credential
              </p>
              <h3 className="text-xl font-serif font-bold">{learnerName}</h3>
              <p className="text-xs text-muted-foreground">has successfully completed</p>
              <p className="text-base font-semibold text-primary">{selectedCert.courseName}</p>

              <div className="pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                <span>ID: {selectedCert.certificateId}</span>
                <span>Issued: {new Date(selectedCert.issueDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="default"
                className="gap-1.5"
                onClick={() => downloadCertificate(selectedCert)}
              >
                <Download className="h-4 w-4" /> Download Certificate
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
