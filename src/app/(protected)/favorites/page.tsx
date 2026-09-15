import { UserTopicPurpose } from "@prisma/client";
import { redirect } from "next/navigation";
import { UserCard } from "@/components/user-card";
import { EmptyState, SectionHeading } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function FavoritesPage() {
  const user = await requireUser();
  if (!user.profile) redirect("/onboarding");

  const favorites = await prisma.favoriteUser.findMany({
    where: { userId: user.id },
    include: {
      favoriteUser: {
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
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <SectionHeading title="我的收藏" description="把你感兴趣的人先放进收藏夹，方便后续发起邀约。" />

      {favorites.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {favorites.map((item) => (
            <UserCard
              key={item.id}
              person={{
                id: item.favoriteUser.id,
                name: item.favoriteUser.name,
                profile: {
                  avatarUrl: item.favoriteUser.profile?.avatarUrl,
                  city: item.favoriteUser.profile?.city || "",
                  role: item.favoriteUser.profile?.role || "",
                  organization: item.favoriteUser.profile?.organization || "",
                  bio: item.favoriteUser.profile?.bio || "",
                  isOpenToCoffeeChat: item.favoriteUser.profile?.isOpenToCoffeeChat || false,
                  communicationPreference: item.favoriteUser.profile?.communicationPreference || "BOTH",
                  offerTopics:
                    item.favoriteUser.profile?.topics
                      .filter((topic) => topic.purpose === UserTopicPurpose.OFFER)
                      .map((topic) => topic.topic.name) || [],
                },
                isFavorited: true,
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="你还没有收藏任何人"
          description="去发现页逛逛，把想进一步了解的人先收进来。"
        />
      )}
    </div>
  );
}
