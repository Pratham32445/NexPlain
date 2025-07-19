import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

const client = new S3Client({
    region: "auto",
    endpoint: "https://5ee470cf7f9f22ff352a4f05d3cfb264.r2.cloudflarestorage.com",
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!
    }
})

export async function storeVideoToS3(videoId: string) {
    const videoPath = path.join("/generated", videoId, "final_output.mp4");

    // Check if file exists and has non-zero size
    if (!fs.existsSync(videoPath)) {
        console.error("❌ Video file not found:", videoPath);
        return;
    }

    const stats = fs.statSync(videoPath);
    if (stats.size === 0) {
        console.error("❌ Video file is empty (0 bytes):", videoPath);
        return;
    }

    const fileStream = fs.createReadStream(videoPath);

    const cmd = new PutObjectCommand({
        Bucket: "prompt2video",       // Replace with your R2 bucket name
        Key: "final_output.mp4",      // Destination key inside R2
        Body: fileStream,
        ContentType: "video/mp4",
    });

    try {
        await client.send(cmd);
        console.log("✅ Video uploaded successfully to R2.");
    } catch (error) {
        console.error("❌ Upload failed:", error);
    }
}