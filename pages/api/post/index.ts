import { getAuth } from '@clerk/nextjs/server'
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import formidable from "formidable";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Disable body parser for this API route to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check if user is authenticated
  const { userId } = getAuth(req);
  console.log(userId)
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method === "POST") {
    try {
      // Configure formidable for file upload
      const form = formidable({
        maxFileSize: 10 * 1024 * 1024, // 10MB
        filter: ({ name, mimetype }) => name === "voiceNote" && (mimetype?.startsWith("audio/") || false),
      });

      // Parse the incoming form data
      const [fields, files] = await form.parse(req);

      // Extract form fields
      const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
      const content = Array.isArray(fields.content) ? fields.content[0] : fields.content;
      const performanceDateId = Array.isArray(fields.performanceDateId)
        ? fields.performanceDateId[0]
        : fields.performanceDateId;
      const performanceId = Array.isArray(fields.performanceId)
        ? fields.performanceId[0]
        : fields.performanceId;
      const promptAnswersRaw = Array.isArray(fields.promptAnswers)
        ? fields.promptAnswers[0]
        : fields.promptAnswers;
      const customName = Array.isArray(fields.customName) ? fields.customName[0] : fields.customName;
      const customLocation = Array.isArray(fields.customLocation) ? fields.customLocation[0] : fields.customLocation;
      const customDate = Array.isArray(fields.customDate) ? fields.customDate[0] : fields.customDate;

      // Handle voice note file upload to Cloudinary
      let voiceNoteUrl: string | null = null;
      if (files.voiceNote) {
        const voiceFile = Array.isArray(files.voiceNote) ? files.voiceNote[0] : files.voiceNote;
       
        if (voiceFile && voiceFile.filepath) {
          try {
            // Upload to Cloudinary
            const uploadResult = await cloudinary.uploader.upload(voiceFile.filepath, {
              resource_type: 'video', // Cloudinary uses 'video' for audio files
              folder: `voice-notes/${userId}`,
              public_id: `voice-note-${Date.now()}`,
              // Optional: convert to MP3 for better compatibility
              // format: 'mp3',
            });

            voiceNoteUrl = uploadResult.secure_url;
            console.log('File uploaded to Cloudinary:', voiceNoteUrl);
          } catch (uploadError) {
            console.error('Cloudinary upload error:', uploadError);
            throw new Error('Failed to upload voice note to Cloudinary');
          }
        }
      }

      // Handle prompt answers 
      let promptAnswers: Record<string, string> = {};
      try {
        promptAnswers = promptAnswersRaw ? JSON.parse(promptAnswersRaw) : {};
      } catch (e) {
        console.error("Failed to parse promptAnswers", e);
      }

      // Create post in database
      const result = await prisma.post.create({
        data: {
          title: title || "",
          content: content || "",
          voiceNoteUrl: voiceNoteUrl || null,
          performance: performanceId
            ? { connect: { id: performanceId } }
            : undefined,
          performanceDate: performanceDateId
            ? { connect: { id: performanceDateId } }
            : undefined,
          customName: customName || null,
          customLocation: customLocation || null,
          customDate: customDate ? new Date(customDate) : null,
          author: {
            connect: { clerkId: userId },
          },
          promptAnswers: {
            create: Object.entries(promptAnswers)
              .filter(([_, text]) => text.trim() !== "")
              .map(([promptId, text]) => ({
                text,
                prompt: { connect: { id: promptId } },
              })),
          },
        },
        include: { promptAnswers: true },
      });

      res.status(200).json(result);
    } catch (err) {
      console.error("Error processing form:", err);
      res.status(500).json({ message: "Something went wrong" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}