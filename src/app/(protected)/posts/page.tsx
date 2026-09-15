import Link from "next/link";
import { redirect } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { Badge, Card, CardContent, EmptyState, SectionHeading } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PostsPage() {
  const user = await requireUser();
  if (!user.profile) redirect("/onboarding");

  const [posts, likes, favorites, topicCounts] = await Promise.all([
    prisma.post.findMany({
      include: {
        author: { include: { profile: true } },
        topics: { include: { topic: true } },
        likes: true,
        favorites: true,
        comments: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.postLike.findMany({ where: { userId: user.id }, select: { postId: true } }),
    prisma.postFavorite.findMany({ where: { userId: user.id }, select: { postId: true } }),
    prisma.postTopic.groupBy({
      by: ["topicId"],
      _count: true,
      orderBy: { _count: { topicId: "desc" } },
      take: 5,
    }),
  ]);

  const topicMap = new Map(
    (
      await prisma.topic.findMany({
        where: { id: { in: topicCounts.map((item) => item.topicId) } },
      })
    ).map((topic) => [topic.id, topic.name]),
  );

  const likedIds = new Set(likes.map((item) => item.postId));
  const favoriteIds = new Set(favorites.map((item) => item.postId));

  return (
    <div className="space-y-6">
      <SectionHeading
        title="社区"
        description="像小红书一样浏览大家最近的思考、经验和想发起的话题。"
        action={
          <Link
            href="/posts/new"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#5b3620] px-4 text-sm font-medium text-white hover:bg-[#472a19]"
          >
            发布帖子
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          {posts.length ? (
            posts.map((post) => (
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
            ))
          ) : (
            <EmptyState title="社区里还没有帖子" description="发第一篇帖子，让大家看到你的观点和故事。" />
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold text-[#3d281d]">热门话题</h3>
              <div className="flex flex-wrap gap-2">
                {topicCounts.length ? (
                  topicCounts.map((item) => (
                    <Badge key={item.topicId}>
                      {topicMap.get(item.topicId)} · {item._count}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-[#8b6b54]">暂时还没有统计数据</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2 text-sm leading-7 text-[#6b4f3f]">
              <h3 className="text-lg font-semibold text-[#3d281d]">社区提示</h3>
              <p>1. 标题写得更具体，更容易让别人点开。</p>
              <p>2. 真实的经验、失败和反思，往往比结论更有讨论价值。</p>
              <p>3. 看到想聊的人，可以直接去用户详情页发起 Coffee Chat。</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
