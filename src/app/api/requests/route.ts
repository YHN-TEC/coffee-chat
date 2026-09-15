import { coffeeRequestSchema } from "@/lib/validations";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await requireUser();
  const parsed = coffeeRequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message || "邀约信息有误" }, { status: 400 });
  }

  if (parsed.data.receiverId === user.id) {
    return Response.json({ error: "不能邀请自己" }, { status: 400 });
  }

  await prisma.coffeeRequest.create({
    data: {
      senderId: user.id,
      receiverId: parsed.data.receiverId,
      subject: parsed.data.subject,
      preferredDate: parsed.data.preferredDate,
      timeSlot: parsed.data.timeSlot,
      meetingStyle: parsed.data.meetingStyle,
      location: parsed.data.location,
      discussionTopics: parsed.data.discussionTopics,
      notes: parsed.data.notes,
    },
  });

  return Response.json({ ok: true });
}
