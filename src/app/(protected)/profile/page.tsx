import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import { Avatar, Badge, Card, CardContent, SectionHeading } from "@/components/ui";
import { getTopicNames, splitTopicsByPurpose } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { communicationPreferenceLabels, experienceLevelLabels, roleTypeLabels } from "@/lib/utils";

export default async function ProfilePage() {
  const user = await requireUser();
  if (!user.profile) redirect("/onboarding");

  const topics = await getTopicNames();
  const topicGroups = splitTopicsByPurpose(user.profile.topics);

  return (
    <div className="space-y-6">
      <SectionHeading title="个人资料" description="你可以随时更新资料、补充话题和调整是否开放 Coffee Chat。" />

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <Card className="h-fit">
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name={user.name} src={user.profile.avatarUrl} className="h-16 w-16 text-lg" />
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-[#3d281d]">{user.name}</h2>
                <p className="text-sm text-[#7b5f4a]">
                  {user.profile.role} · {user.profile.organization}
                </p>
                <p className="text-sm text-[#8b6b54]">{user.profile.city}</p>
              </div>
            </div>

            <p className="text-sm leading-6 text-[#6b4f3f]">{user.profile.bio}</p>

            <div className="flex flex-wrap gap-2">
              <Badge>{roleTypeLabels[user.profile.roleType]}</Badge>
              <Badge>{experienceLevelLabels[user.profile.yearsOfExperience]}</Badge>
              <Badge>{communicationPreferenceLabels[user.profile.communicationPreference]}</Badge>
              <Badge className={user.profile.isOpenToCoffeeChat ? "bg-[#ebf7f0] text-[#2f7a61]" : "bg-[#f4efe9] text-[#8a7567]"}>
                {user.profile.isOpenToCoffeeChat ? "开放 Coffee Chat" : "暂不开放"}
              </Badge>
            </div>

            <div className="space-y-2 text-sm text-[#7a5d49]">
              <p><span className="font-medium text-[#4b3023]">背景经历：</span>{user.profile.background}</p>
              <p><span className="font-medium text-[#4b3023]">想认识的人：</span>{user.profile.peopleToMeet}</p>
              <p><span className="font-medium text-[#4b3023]">交流语言：</span>{user.profile.languages}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-[#4b3023]">我可以聊的话题</p>
              <div className="flex flex-wrap gap-2">
                {topicGroups.offerTopics.map((topic) => (
                  <Badge key={topic}>{topic}</Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-[#4b3023]">我感兴趣的领域</p>
              <div className="flex flex-wrap gap-2">
                {topicGroups.interestTopics.map((topic) => (
                  <Badge key={topic}>{topic}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <ProfileForm
          mode="edit"
          topicOptions={topics}
          initialValues={{
            avatarUrl: user.profile.avatarUrl || "",
            name: user.name,
            city: user.profile.city,
            organization: user.profile.organization,
            role: user.profile.role,
            roleType: user.profile.roleType,
            yearsOfExperience: user.profile.yearsOfExperience,
            bio: user.profile.bio,
            background: user.profile.background,
            peopleToMeet: user.profile.peopleToMeet,
            communicationPreference: user.profile.communicationPreference,
            languages: user.profile.languages,
            isOpenToCoffeeChat: user.profile.isOpenToCoffeeChat,
            offerTopics: topicGroups.offerTopics,
            interestTopics: topicGroups.interestTopics,
          }}
        />
      </div>
    </div>
  );
}
