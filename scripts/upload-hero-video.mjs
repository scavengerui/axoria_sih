import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dwkaudbjt",
  api_key: process.env.CLOUDINARY_API_KEY || "464699764226562",
  api_secret: process.env.CLOUDINARY_API_SECRET || "r7s1l3OlEtCicmF1PLHScs0ubQU",
});

async function uploadVideo() {
  console.log("Uploading HD Cybersecurity & Threat Defense video to Cloudinary...");

  // Open-access direct cloud video streams
  const candidateUrls = [
    "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  ];

  for (const url of candidateUrls) {
    try {
      console.log("Trying URL:", url);
      const res = await cloudinary.uploader.upload(url, {
        resource_type: "video",
        folder: "axoria_courses",
        public_id: "zero_trust_defense_lecture_hd",
        overwrite: true,
      });

      console.log("SUCCESS! Cloudinary Secure Video URL:", res.secure_url);
      return res.secure_url;
    } catch (err) {
      console.error("Failed on URL:", url, err.message);
    }
  }
}

uploadVideo();
