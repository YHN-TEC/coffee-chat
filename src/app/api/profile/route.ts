import { UserTopicPurpose } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { ensureTopics } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validations";

async function saveProfile(input: unknown, userId: string) {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message || "资料填写有误" };
  }

  const values = parsed.data;
  const allTopics = await ensureTopics([...values.offerTopics, ...values.interestTopics]);
  const offerTopicIds = new Set(values.offerTopics.map((name) => allTopics.find((item) => item.name === name)?.id).filter(Boolean));
  const interestTopicIds = new Set(values.interestTopics.map((name) => allTopics.find((item) => item.name === name)?.id).filter(Boolean));

  const profile = await prisma.profile.upsert({
    where: { userId },
    create: {
      userId,
      avatarUrl: values.avatarUrl || null,
      city: values.city,
      organization: values.organization,
      role: values.role,
      roleType: values.roleType,
      yearsOfExperience: values.yearsOfExperience,
      bio: values.bio,
      background: values.background,
      peopleToMeet: values.peopleToMeet,
      communicationPreference: values.communicationPreference,
      languages: values.languages,
      isOpenToCoffeeChat: values.isOpenToCoffeeChat,
    },
    update: {
      avatarUrl: values.avatarUrl || null,
      city: values.city,
      organization: values.organization,
      role: values.role,
      roleType: values.roleType,
      yearsOfExperience: values.yearsOfExperience,
      bio: values.bio,
      background: values.background,
      peopleToMeet: values.peopleToMeet,
      communicationPreference: values.communicationPreference,
      languages: values.languages,
      isOpenToCoffeeChat: values.isOpenToCoffeeChat,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { name: values.name },
  });

  await prisma.userTopic.deleteMany({ where: { profileId: profile.id } });
  await prisma.userTopic.createMany({
    data: [
      ...Array.from(offerTopicIds).map((topicId) => ({
        profileId: profile.id,
        topicId: topicId!,
        purpose: UserTopicPurpose.OFFER,
      })),
      ...Array.from(interestTopicIds).map((topicId) => ({
        profileId: profile.id,
        topicId: topicId!,
        purpose: UserTopicPurpose.INTEREST,
      })),
    ],
  });

  return { ok: true as const };
}

export async function POST(request: Request) {
  const user = await requireUser();
  const result = await saveProfile(await request.json(), user.id);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 400 });
  }
  return Response.json({ redirectTo: "/discover" });
}

export async function PUT(request: Request) {
  const user = await requireUser();
  const result = await saveProfile(await request.json(), user.id);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 400 });
  }
  return Response.json({ redirectTo: "/profile" });
}
