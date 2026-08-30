import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { pipeline } from "stream/promises";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dwkaudbjt",
  api_key: process.env.CLOUDINARY_API_KEY || "464699764226562",
  api_secret: process.env.CLOUDINARY_API_SECRET || "r7s1l3OlEtCicmF1PLHScs0ubQU",
});

async function main() {
  const videoUrl = "https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/person-bicycle-car-detection.mp4";
  const localFile = "temp_tech_video.mp4";

  console.log("1. Fetching tech video from open source repository...");
  const response = await fetch(videoUrl);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  await pipeline(response.body, fs.createWriteStream(localFile));
  console.log("2. Video downloaded locally:", (fs.statSync(localFile).size / (1024 * 1024)).toFixed(2), "MB");

  console.log("3. Uploading to Cloudinary...");
  const result = await cloudinary.uploader.upload(localFile, {
    resource_type: "video",
    folder: "axoria_courses",
    public_id: "zero_trust_threat_defense_lecture",
    overwrite: true,
  });

  console.log("4. SUCCESS! Cloudinary Secure URL:", result.secure_url);

  // Clean up
  try {
    fs.unlinkSync(localFile);
  } catch {}
}

main().catch(console.error);
