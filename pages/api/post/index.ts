import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import formidable from "formidable";
import path from "path";
import { promises as fs } from "fs";

// Disable body parser for this API route to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check if user is authenticated
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method === "POST") {
    try {
      // Define upload directory
      const uploadDir = path.join(process.cwd(), "public", "uploads", "voice-notes");

      // Ensure upload directory exists
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }

      // Configure formidable for file upload
      const form = formidable({
        uploadDir,
        keepExtensions: true,
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

      // Handle voice note file if present
      let voiceNoteUrl: string | null = null;
      if (files.voiceNote) {
        const voiceFile = Array.isArray(files.voiceNote) ? files.voiceNote[0] : files.voiceNote;
        if (voiceFile && voiceFile.filepath) {
          const timestamp = Date.now();
          const fileExtension = path.extname(voiceFile.originalFilename || ".webm");
          const newFilename = `voice-note-${timestamp}${fileExtension}`;
          const newFilepath = path.join(uploadDir, newFilename);

          // Move file to final location
          await fs.rename(voiceFile.filepath, newFilepath);

          // Store relative URL for database
          voiceNoteUrl = `/uploads/voice-notes/${newFilename}`;
        }
      }

      // Handle prompt answers 
      let promptAnswers: Record<string, string> = {};
try {
  promptAnswers = promptAnswersRaw ? JSON.parse(promptAnswersRaw) : {};
} catch (e) {
  console.error("Failed to parse promptAnswers", e);
}

   
    
    const result = await prisma.post.create({
      data: {
        title: title || "",
        content: content || "",
        voiceNoteUrl: voiceNoteUrl || "",
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
          connect: { email: session.user.email },
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
