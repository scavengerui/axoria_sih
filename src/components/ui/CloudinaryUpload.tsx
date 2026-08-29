"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle2, Loader2, FileText, Image as ImageIcon, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface CloudinaryUploadProps {
  onUploadSuccess: (url: string, publicId?: string) => void;
  folder?: string;
  resourceType?: "image" | "video" | "raw" | "auto";
  accept?: string;
  label?: string;
  currentUrl?: string;
}

export function CloudinaryUpload({
  onUploadSuccess,
  folder = "axoria",
  resourceType = "auto",
  accept,
  label = "Upload File",
  currentUrl,
}: CloudinaryUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(currentUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dwkaudbjt";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "axoria_preset";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setProgress(10);
    toast.info(`Uploading ${file.name} to Cloudinary...`);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      if (folder) {
        formData.append("folder", folder);
      }

      // Upload directly to Cloudinary Unsigned Endpoint
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      setProgress(85);

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error?.message || "Upload failed");
      }

      const result = await response.json();
      setProgress(100);
      setUploadedUrl(result.secure_url);
      onUploadSuccess(result.secure_url, result.public_id);
      toast.success("Upload complete! ☁️");
    } catch (err: any) {
      console.error("Cloudinary upload error:", err);
      toast.error(`Upload error: ${err.message || "Failed to upload to Cloudinary"}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedUrl(null);
    onUploadSuccess("");
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {uploadedUrl ? (
        <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30">
          <div className="flex items-center gap-2.5 truncate">
            <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
            <span className="text-xs text-foreground truncate max-w-[240px]">
              {uploadedUrl}
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
            onClick={handleRemove}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className="border-2 border-dashed border-border hover:border-primary/40 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors hover:bg-muted/30"
        >
          {isUploading ? (
            <div className="w-full space-y-2 py-2">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
              <p className="text-xs text-muted-foreground">Uploading to Cloudinary...</p>
              <Progress value={progress} className="h-1.5 w-48 mx-auto" />
            </div>
          ) : (
            <>
              <Upload className="h-6 w-6 text-muted-foreground/60 mb-2" />
              <p className="text-xs font-medium text-foreground">{label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Click to browse files (images, PDFs, videos)
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
