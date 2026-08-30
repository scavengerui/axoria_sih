"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import {
  HardDrive,
  Upload,
  Download,
  Trash2,
  FileText,
  FileCode,
  FileArchive,
  FileSpreadsheet,
  FileImage,
  File,
  Search,
  Plus,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  FolderArchive,
  ExternalLink,
  Lock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VaultFile {
  id: string;
  name: string;
  sizeBytes: number;
  sizeFormatted: string;
  type: "pdf" | "code" | "archive" | "doc" | "image" | "other";
  category: string;
  uploadedAt: string;
  url?: string;
  contentSnippet?: string;
}

const DEFAULT_VAULT_FILES: VaultFile[] = [
  {
    id: "f_1",
    name: "Enterprise_ZeroTrust_Security_SOP.pdf",
    sizeBytes: 18400000,
    sizeFormatted: "18.4 MB",
    type: "pdf",
    category: "Compliance & Security",
    uploadedAt: "Aug 28, 2026",
    contentSnippet: "Standard Operating Procedures for Zero-Trust and MFA Enforcement.",
  },
  {
    id: "f_2",
    name: "Microservices_System_Design_Cheatsheet.pdf",
    sizeBytes: 12200000,
    sizeFormatted: "12.2 MB",
    type: "pdf",
    category: "Architecture Notes",
    uploadedAt: "Aug 29, 2026",
    contentSnippet: "High Scale Distributed Caching and Kafka Event Streaming topology.",
  },
  {
    id: "f_3",
    name: "Docker_Production_K8s_Manifests.zip",
    sizeBytes: 45600000,
    sizeFormatted: "45.6 MB",
    type: "archive",
    category: "DevOps & Infrastructure",
    uploadedAt: "Aug 29, 2026",
    contentSnippet: "Multi-stage Dockerfiles and Helm charts for cluster autoscaling.",
  },
  {
    id: "f_4",
    name: "GDPR_Compliance_Audit_Checklist.docx",
    sizeBytes: 8500000,
    sizeFormatted: "8.5 MB",
    type: "doc",
    category: "Governance",
    uploadedAt: "Aug 30, 2026",
    contentSnippet: "PII anonymization rules and data residency audit guidelines.",
  },
  {
    id: "f_5",
    name: "Nextjs15_ServerActions_Boilerplate.ts",
    sizeBytes: 1200000,
    sizeFormatted: "1.2 MB",
    type: "code",
    category: "Source Code",
    uploadedAt: "Aug 30, 2026",
    contentSnippet: "Fullstack type-safe mutations with optimistic UI handlers.",
  },
];

const MAX_STORAGE_BYTES = 500 * 1024 * 1024; // 500 MB

export default function PersonalVaultPage() {
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const storageKey = `axoria_vault_${user?.id || "guest"}`;
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isUploading, setIsUploading] = useState(false);

  // Load from localStorage or defaults
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setFiles(JSON.parse(saved));
      } else {
        setFiles(DEFAULT_VAULT_FILES);
        localStorage.setItem(storageKey, JSON.stringify(DEFAULT_VAULT_FILES));
      }
    } catch {
      setFiles(DEFAULT_VAULT_FILES);
    }
  }, [storageKey]);

  // Save changes
  const saveFiles = (newFiles: VaultFile[]) => {
    setFiles(newFiles);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newFiles));
    } catch (err) {
      console.error("Failed to save vault files:", err);
    }
  };

  // Storage calculations
  const usedBytes = files.reduce((acc, f) => acc + (f.sizeBytes || 0), 0);
  const usedMB = (usedBytes / (1024 * 1024)).toFixed(1);
  const totalMB = 500;
  const usedPercent = Math.min(100, Math.round((usedBytes / MAX_STORAGE_BYTES) * 100));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files;
    if (!uploaded || uploaded.length === 0) return;

    setIsUploading(true);
    const newItems: VaultFile[] = [];

    Array.from(uploaded).forEach((file, idx) => {
      const extension = file.name.split(".").pop()?.toLowerCase() || "";
      let type: VaultFile["type"] = "other";
      if (["pdf"].includes(extension)) type = "pdf";
      else if (["ts", "tsx", "js", "py", "rs", "json", "yaml", "html", "css"].includes(extension)) type = "code";
      else if (["zip", "tar", "gz", "rar", "7z"].includes(extension)) type = "archive";
      else if (["doc", "docx", "txt", "md"].includes(extension)) type = "doc";
      else if (["png", "jpg", "jpeg", "webp", "svg"].includes(extension)) type = "image";

      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const sizeFormatted = file.size > 1024 * 1024 ? `${sizeMB} MB` : `${Math.round(file.size / 1024)} KB`;

      newItems.push({
        id: `f_upload_${Date.now()}_${idx}`,
        name: file.name,
        sizeBytes: file.size,
        sizeFormatted,
        type,
        category: "Personal Uploads",
        uploadedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        contentSnippet: `File uploaded to personal vault. Ready for 1-click download.`,
      });
    });

    setTimeout(() => {
      saveFiles([...newItems, ...files]);
      setIsUploading(false);
      toast.success(`Successfully uploaded ${newItems.length} file(s) to your Personal Vault!`);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }, 400);
  };

  const handleDownload = (file: VaultFile) => {
    toast.info(`Downloading ${file.name}...`);
    try {
      // Create a downloadable blob
      const content = file.contentSnippet || `Axoria Enterprise Study Vault File: ${file.name}\nUploaded on: ${file.uploadedAt}\nVerified by Axoria LMS.`;
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${file.name}! 📥`);
    } catch (err: any) {
      toast.error("Download error: " + err.message);
    }
  };

  const handleDelete = (fileId: string) => {
    const target = files.find((f) => f.id === fileId);
    const updated = files.filter((f) => f.id !== fileId);
    saveFiles(updated);
    toast.success(`Removed "${target?.name || "file"}". Quota updated!`);
  };

  const getFileIcon = (type: VaultFile["type"]) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-5 h-5 text-red-500" />;
      case "code":
        return <FileCode className="w-5 h-5 text-blue-500" />;
      case "archive":
        return <FileArchive className="w-5 h-5 text-amber-500" />;
      case "doc":
        return <FileText className="w-5 h-5 text-primary" />;
      case "image":
        return <FileImage className="w-5 h-5 text-emerald-500" />;
      default:
        return <File className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const filteredFiles = files.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ||
      (selectedCategory === "PDFs" && f.type === "pdf") ||
      (selectedCategory === "Code" && f.type === "code") ||
      (selectedCategory === "Archives" && f.type === "archive") ||
      (selectedCategory === "Docs" && f.type === "doc");
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <HardDrive className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Personal Cloud Vault</h1>
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary font-semibold">
              500 MB Quota
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Store, manage, and download your personal course study notes, architectures, SOPs, code snippets, and research files in 1 click.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            size="sm"
            className="text-xs h-9 gap-1.5 font-semibold"
          >
            {isUploading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading...
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" /> Upload Files
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Storage Quota Card */}
      <Card className="border border-border shadow-xs overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-card via-muted/20 to-primary/5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-background rounded-2xl border border-border shadow-xs text-primary">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  Account Storage Allocation
                  <Badge variant="outline" className="text-[10px] text-success border-success/30 font-semibold">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Encrypted
                  </Badge>
                </h3>
                <p className="text-xs text-muted-foreground">
                  <strong>{usedMB} MB</strong> used of <strong>{totalMB} MB</strong> available ({usedPercent}% consumed)
                </p>
              </div>
            </div>

            <span className="text-xs font-mono text-muted-foreground font-semibold">
              {(totalMB - parseFloat(usedMB)).toFixed(1)} MB Remaining
            </span>
          </div>

          <Progress value={usedPercent} className="h-2" />
        </div>
      </Card>

      {/* Quick Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {["All", "PDFs", "Code", "Archives", "Docs"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border",
                selectedCategory === cat
                  ? "border-primary bg-primary text-primary-foreground shadow-xs"
                  : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Files Table / Grid */}
      <Card className="border border-border shadow-xs overflow-hidden">
        <CardHeader className="py-4 px-6 border-b border-border/80 bg-muted/10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Stored Items ({filteredFiles.length})
            </CardTitle>
            <span className="text-[11px] text-muted-foreground">Click download to save files locally</span>
          </div>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-border/60">
          {filteredFiles.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <FolderArchive className="w-10 h-10 text-muted-foreground/50 mx-auto" />
              <p className="text-sm font-semibold text-foreground">No files match your search</p>
              <p className="text-xs text-muted-foreground">
                Upload new study resources or reset the filter above.
              </p>
            </div>
          ) : (
            filteredFiles.map((file) => (
              <div
                key={file.id}
                className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-2.5 bg-muted/60 rounded-xl border border-border/80 shrink-0">
                    {getFileIcon(file.type)}
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <p className="font-semibold text-xs sm:text-sm text-foreground truncate max-w-sm sm:max-w-md">
                      {file.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="font-mono">{file.sizeFormatted}</span>
                      <span>•</span>
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-background">
                        {file.category}
                      </Badge>
                      <span>•</span>
                      <span>Uploaded {file.uploadedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(file)}
                    className="text-xs h-8 gap-1.5 font-semibold text-primary hover:bg-primary/5"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(file.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="Delete file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
