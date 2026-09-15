import { redirect } from "next/navigation";
import { PostEditor } from "@/components/post-editor";
import { SectionHeading } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getTopicNames } from "@/lib/data";

export default async function NewPostPage() {
  const user = await requireUser();
  if (!user.profile) redirect("/onboarding");

  const topics = await getTopicNames();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <SectionHeading title="发布帖子" description="写点值得讨论的内容，让大家在 CupLink 先认识你。" />
      <PostEditor
        topicOptions={topics}
        initialValues={{
          title: "",
          content: "",
          coverImageUrl: "",
          topics: [],
        }}
      />
    </div>
  );
}
