import Link from "next/link";
import { redirect } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { EmptyState, SectionHeading } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MyPostsPage() {
  const user = await requireUser();
  if (!user.profile) redirect("/onboarding");

  const posts = await prisma.post.findMany({
    where: { authorId: user.id },
    include: {
      author: { include: { profile: true } },
      topics: { include: { topic: true } },
      likes: true,
      favorites: true,
      comments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const likedIds = new Set(
    (await prisma.postLike.findMany({ where: { userId: user.id }, select: { postId: true } })).map((item) => item.postId),
  );
  const favoriteIds = new Set(
    (await prisma.postFavorite.findMany({ where: { userId: user.id }, select: { postId: true } })).map((item) => item.postId),
  );

  return (
    <div className="space-y-6">
      <SectionHeading
        title="我的帖子"
        description="查看你发布的内容，也可以进入详情页编辑或删除。"
        action={
          <Link
            href="/posts/new"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#5b3620] px-4 text-sm font-medium text-white hover:bg-[#472a19]"
          >
            新建帖子
          </Link>
        }
      />

      {posts.length ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={{
                id: post.id,
                title: post.title,
                content: post.content,
                coverImageUrl: post.coverImageUrl,
                createdAt: post.createdAt,
                author: post.author,
                topicNames: post.topics.map((item) => item.topic.name),
                likeCount: post.likes.length,
                favoriteCount: post.favorites.length,
                commentCount: post.comments.length,
                isLiked: likedIds.has(post.id),
                isFavorited: favoriteIds.has(post.id),
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="你还没有发布过帖子"
          description="写一篇关于职业发展、产品、创业或最近思考的内容，让别人更快认识你。"
        />
      )}
    </div>
  );
}
