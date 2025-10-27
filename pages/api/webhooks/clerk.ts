import { Webhook } from "svix";
import { buffer } from "micro";
import prisma from "../../../lib/prisma";
import type { Role } from "@prisma/client"; // ✅ import enum type

export const config = {
  api: {
    bodyParser: false, // Required by Clerk webhooks
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  const payload = (await buffer(req)).toString();
  const svix_id = req.headers["svix-id"];
  const svix_timestamp = req.headers["svix-timestamp"];
  const svix_signature = req.headers["svix-signature"];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: "Missing svix headers" });
  }

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");

  let evt;
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return res.status(400).json({ error: "Invalid signature" });
  }

  const { type, data } = evt;
  
  if (type === "user.created" || type === "user.updated") {
    console.log("received something")
    const email = data.email_addresses?.[0]?.email_address;
    const firstName = data.first_name ?? "";
    const lastName = data.last_name ?? "";

    // Safely map Clerk metadata role → Prisma enum Role
    const clerkRole = (data.public_metadata?.role as string) || "ATTENDEE";
    const role: Role = ["ADMIN", "ATTENDEE", "ARTIST"].includes(clerkRole)
      ? (clerkRole as Role)
      : "ATTENDEE";

    await prisma.user.upsert({
      where: { clerkId: data.id },
      update: { email, firstName, lastName, role },
      create: { clerkId: data.id, email, firstName, lastName, role },
    });

    console.log(`✅ Synced user ${email} (${data.id})`);
  }

  if (type === "user.deleted") {
    await prisma.user.deleteMany({
      where: { clerkId: data.id },
    });
    console.log(`🗑️ Deleted user ${data.id}`);
  }

  return res.status(200).json({ success: true });
}
