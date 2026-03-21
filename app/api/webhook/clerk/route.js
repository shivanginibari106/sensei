import { Webhook } from "svix";
import { headers } from "next/headers";
import { db } from "@/lib/prisma";

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return new Response("No webhook secret", { status: 400 });
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    return new Response("Invalid signature", { status: 400 });
  }

  const { type, data } = evt;

  if (type === "user.created") {
    const email = data.email_addresses[0]?.email_address;
    if (!email) {
      return new Response("No email provided", { status: 400 });
    }
    await db.user.create({
      data: {
        clerkUserId: data.id,
        email,
        name: `${data.first_name || ""} ${data.last_name || ""}`.trim() || null,
        imageUrl: data.image_url,
      },
    });
  }

  if (type === "user.updated") {
    await db.user.update({
      where: { clerkUserId: data.id },
      data: {
        email: data.email_addresses[0]?.email_address || "",
        name: `${data.first_name || ""} ${data.last_name || ""}`.trim() || null,
        imageUrl: data.image_url,
      },
    });
  }

  if (type === "user.deleted") {
    await db.user.delete({
      where: { clerkUserId: data.id },
    });
  }

  return new Response("OK", { status: 200 });
}
