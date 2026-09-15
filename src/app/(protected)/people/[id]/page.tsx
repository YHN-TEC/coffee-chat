import { notFound, redirect } from "next/navigation";
import { UserTopicPurpose } from "@prisma/client";
import { FavoriteUserButton } from "@/components/toggle-actions";
import { RequestDialog } from "@/components/request-dialog";
import { Avatar, Badge, Card, CardContent } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { communicationPreferenceLabels, experienceLevelLabels, roleTypeLabels } from "@/lib/utils";

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  if (!user.profile) redirect("/onboarding");

  const { id } = await params;
  const person = await prisma.user.findUnique({
    where: { id },
    include: {
      profile: {
        include: {
          topics: {
            include: {
              topic: true,
            },
          },
        },
      },
    },
  });

  if (!person?.profile) notFound();

  const favorite = await prisma.favoriteUser.findUnique({
    where: {
      userId_favoriteUserId: {
        userId: user.id,
        favoriteUserId: person.id,
      },
    },
  });

  const offerTopics = person.profile.topics.filter((item) => item.purpose === UserTopicPurpose.OFFER).map((item) => item.topic.name);
  const interestTopics = person.profile.topics.filter((item) => item.purpose === UserTopicPurpose.INTEREST).map((item) => item.topic.name);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <Avatar name={person.name} src={person.profile.avatarUrl} className="h-20 w-20 text-lg" />
              <div className="space-y-3">
                <div>
                  <h1 className="text-3xl font-semibold text-[#3d281d]">{person.name}</h1>
                  <p className="mt-1 text-base text-[#6f5443]">
                    {person.profile.role} · {person.profile.organization}
                  </p>
                  <p className="text-sm text-[#8b6b54]">{person.profile.city}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>{roleTypeLabels[person.profile.roleType]}</Badge>
                  <Badge>{experienceLevelLabels[person.profile.yearsOfExperience]}</Badge>
                  <Badge>{communicationPreferenceLabels[person.profile.communicationPreference]}</Badge>
                  <Badge className={person.profile.isOpenToCoffeeChat ? "bg-[#ebf7f0] text-[#2f7a61]" : "bg-[#f4efe9] text-[#8a7567]"}>
                    {person.profile.isOpenToCoffeeChat ? "开放 Coffee Chat" : "暂不开放"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <FavoriteUserButton personId={person.id} isFavorited={Boolean(favorite)} />
              <RequestDialog receiverId={person.id} receiverName={person.name} />
            </div>
          </div>

          <p className="rounded-lg bg-[#fff8f0] p-4 text-base leading-7 text-[#5f4333]">{person.profile.bio}</p>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-[#f0e4d7] shadow-none">
              <CardContent className="space-y-3">
                <h2 className="text-lg font-semibold text-[#3d281d]">背景经历</h2>
                <p className="text-sm leading-7 text-[#6b4f3f]">{person.profile.background}</p>
              </CardContent>
            </Card>

            <Card className="border-[#f0e4d7] shadow-none">
              <CardContent className="space-y-3">
                <h2 className="text-lg font-semibold text-[#3d281d]">想认识的人</h2>
                <p className="text-sm leading-7 text-[#6b4f3f]">{person.profile.peopleToMeet}</p>
                <p className="text-sm text-[#7a5d49]">
                  <span className="font-medium text-[#4b3023]">常用语言：</span>{person.profile.languages}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-[#f0e4d7] shadow-none">
              <CardContent className="space-y-3">
                <h2 className="text-lg font-semibold text-[#3d281d]">我可以聊的话题</h2>
                <div className="flex flex-wrap gap-2">
                  {offerTopics.map((topic) => (
                    <Badge key={topic}>{topic}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#f0e4d7] shadow-none">
              <CardContent className="space-y-3">
                <h2 className="text-lg font-semibold text-[#3d281d]">我感兴趣的领域</h2>
                <div className="flex flex-wrap gap-2">
                  {interestTopics.map((topic) => (
                    <Badge key={topic}>{topic}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
