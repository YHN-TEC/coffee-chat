import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import { SectionHeading } from "@/components/ui";
import { getTopicNames } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { CommunicationPreference, ExperienceLevel, RoleType } from "@prisma/client";

export default async function OnboardingPage() {
  const user = await requireUser();
  if (user.profile) {
    redirect("/discover");
  }

  const topics = await getTopicNames();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <SectionHeading
        title="完善你的个人资料"
        description="CupLink 最重要的是让别人快速理解你适合聊什么，所以先把资料写完整。"
      />
      <ProfileForm
        mode="create"
        topicOptions={topics}
        initialValues={{
          avatarUrl: "",
          name: user.name,
          city: "",
          organization: "",
          role: "",
          roleType: RoleType.PRODUCT,
          yearsOfExperience: ExperienceLevel.MID,
          bio: "",
          background: "",
          peopleToMeet: "",
          communicationPreference: CommunicationPreference.BOTH,
          languages: "中文",
          isOpenToCoffeeChat: true,
          offerTopics: [],
          interestTopics: [],
        }}
      />
    </div>
  );
}
