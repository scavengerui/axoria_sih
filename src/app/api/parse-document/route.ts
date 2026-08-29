import { NextRequest, NextResponse } from "next/server";
import { createWorker } from "tesseract.js";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = "";
    let isOcrUsed = false;

    // 1. IMAGE OCR (.png, .jpg, .jpeg, .webp, .bmp, .tiff)
    if (
      fileName.endsWith(".png") ||
      fileName.endsWith(".jpg") ||
      fileName.endsWith(".jpeg") ||
      fileName.endsWith(".webp") ||
      fileName.endsWith(".bmp") ||
      fileName.endsWith(".tiff")
    ) {
      try {
        isOcrUsed = true;
        const worker = await createWorker("eng");
        const ret = await worker.recognize(buffer);
        extractedText = ret.data.text || "";
        await worker.terminate();
      } catch (ocrErr: any) {
        console.error("OCR Image error:", ocrErr);
      }
    }
    // 2. TEXT-BASED FILES (.txt, .md, .json, .csv)
    else if (
      fileName.endsWith(".txt") ||
      fileName.endsWith(".md") ||
      fileName.endsWith(".json") ||
      fileName.endsWith(".csv")
    ) {
      extractedText = buffer.toString("utf-8");
    }
    // 3. PDF FILES (.pdf)
    else if (fileName.endsWith(".pdf")) {
      try {
        const pdfParse = require("pdf-parse");
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text || "";
      } catch (pdfErr) {
        console.warn("pdf-parse notice, attempting fallback string extraction:", pdfErr);
      }

      // If PDF has no digital text layer (scanned PDF), run OCR on buffer!
      if (!extractedText || extractedText.trim().length < 30) {
        try {
          isOcrUsed = true;
          const worker = await createWorker("eng");
          const ret = await worker.recognize(buffer);
          if (ret.data.text && ret.data.text.trim().length > 20) {
            extractedText = ret.data.text;
          }
          await worker.terminate();
        } catch (scannedErr) {
          console.warn("Scanned PDF OCR notice:", scannedErr);
        }
      }

      // Final string stream fallback
      if (!extractedText || extractedText.trim().length < 30) {
        const raw = buffer.toString("binary");
        const matches = raw.match(/\(([^()]+)\)/g);
        if (matches && matches.length > 5) {
          extractedText = matches.map((m) => m.slice(1, -1)).join(" ");
        }
      }
    }
    // 4. DOCX, PPTX
    else {
      const raw = buffer.toString("utf-8");
      const xmlMatches =
        raw.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || raw.match(/<a:t[^>]*>([^<]+)<\/a:t>/g);
      if (xmlMatches && xmlMatches.length > 0) {
        extractedText = xmlMatches.map((m) => m.replace(/<[^>]+>/g, "")).join(" ");
      } else {
        extractedText = buffer
          .toString("utf-8")
          .replace(/[^\x20-\x7E\n\r\t]/g, " ")
          .replace(/\s+/g, " ");
      }
    }

    // Clean up excessive whitespace
    extractedText = extractedText.replace(/\s+/g, " ").trim();

    if (!extractedText || extractedText.length < 15) {
      return NextResponse.json({
        success: false,
        error:
          "Could not extract readable text from document/image. Please ensure the image is clear or paste text directly.",
      });
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      textLength: extractedText.length,
      isOcrUsed,
      text: extractedText.slice(0, 50000),
    });
  } catch (err: any) {
    console.error("Document parsing error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to parse document: " + err.message },
      { status: 500 }
    );
  }
}
