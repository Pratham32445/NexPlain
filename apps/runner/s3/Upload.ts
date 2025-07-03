import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import fs from "fs";

const client = new S3Client({
    region: "auto",
    endpoint: process.env.END_POINT!,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!
    }
})

export async function uploadToS3(videoId: string, videoPath: string) {
    try {
        if (!fs.existsSync(videoPath)) {
            throw new Error(`File not found: ${videoPath}`);
        }
        const fileStream = fs.createReadStream(videoPath);
        const stats = fs.statSync(videoPath);
        const uploadParams = {
            Bucket: process.env.BUCKET_NAME!,
            Key: `videos/${videoId}.mp4`,
            Body: fileStream,
            ContentType: "video/mp4",
            ContentLength: stats.size
        }
        const cmd = new PutObjectCommand(uploadParams);
        await client.send(cmd);
        console.log("upload successfuly");
    } catch (error) {
        console.log("error occured", error);
    }
}