import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const fileName = file.name;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = "";

    if (fileName.endsWith(".txt") || fileName.endsWith(".md") || fileName.endsWith(".json") || fileName.endsWith(".csv")) {
      extractedText = buffer.toString("utf-8");
    } else if (fileName.endsWith(".pdf")) {
      try {
        // Attempt pdf-parse
        const pdfParse = require("pdf-parse");
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text || "";
      } catch (pdfErr) {
        console.warn("pdf-parse fallback, extracting string streams:", pdfErr);
        // Clean ASCII/UTF-8 extraction fallback
        const raw = buffer.toString("binary");
        // Extract text blocks between stream markers or parenthesis
        const matches = raw.match(/\(([^()]+)\)/g);
        if (matches && matches.length > 10) {
          extractedText = matches.map((m) => m.slice(1, -1)).join(" ");
        } else {
          extractedText = raw.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ");
        }
      }
    } else {
      // DOCX, PPTX (Zipped XML stream text extraction)
      const raw = buffer.toString("utf-8");
      const xmlMatches = raw.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || raw.match(/<a:t[^>]*>([^<]+)<\/a:t>/g);
      if (xmlMatches && xmlMatches.length > 0) {
        extractedText = xmlMatches.map((m) => m.replace(/<[^>]+>/g, "")).join(" ");
      } else {
        extractedText = buffer.toString("utf-8").replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ");
      }
    }

    // Clean up excessive whitespace
    extractedText = extractedText.replace(/\s+/g, " ").trim();

    if (!extractedText || extractedText.length < 20) {
      return NextResponse.json({
        success: false,
        error: "Could not extract readable text from document. Please copy & paste the content.",
      });
    }

    return NextResponse.json({
      success: true,
      fileName,
      textLength: extractedText.length,
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
