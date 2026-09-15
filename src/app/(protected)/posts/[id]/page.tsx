import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CommentForm } from "@/components/comment-form";
import { PostEditor } from "@/components/post-editor";
import { DeletePostButton, PostFavoriteButton, PostLikeButton } from "@/components/toggle-actions";
import { Avatar, Badge, Card, CardContent } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import { getTopicNames } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PostDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  if (!user.profile) redirect("/onboarding");

  const { id } = await params;
  const query = await searchParams;
  const editMode = query.mode === "edit";

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { include: { profile: true } },
      topics: { include: { topic: true } },
      likes: true,
      favorites: true,
      comments: {
        include: {
          author: { include: { profile: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!post) notFound();

  const [liked, favorited, topicOptions] = await Promise.all([
    prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId: post.id,
          userId: user.id,
        },
      },
    }),
    prisma.postFavorite.findUnique({
      where: {
        postId_userId: {
          postId: post.id,
          userId: user.id,
        },
      },
    }),
    getTopicNames(),
  ]);

  const isAuthor = post.authorId === user.id;

  if (editMode && isAuthor) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#3d281d]">编辑帖子</h1>
            <p className="text-sm text-[#8b6b54]">修改标题、正文和标签，保存后会立即更新。</p>
          </div>
          <Link href={`/posts/${post.id}`} className="text-sm font-medium text-[#5b3620] underline underline-offset-2">
            返回详情
          </Link>
        </div>

        <PostEditor
          postId={post.id}
          topicOptions={topicOptions}
          initialValues={{
            title: post.title,
            content: post.content,
            coverImageUrl: post.coverImageUrl || "",
            topics: post.topics.map((item) => item.topic.name),
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-3">
            <Avatar name={post.author.name} src={post.author.profile?.avatarUrl} className="h-12 w-12" />
            <div>
              <p className="font-medium text-[#432c20]">{post.author.name}</p>
              <p className="text-xs text-[#8b6b54]">
                {post.author.profile?.role || "CupLink 用户"} · {formatDateTime(post.createdAt)}
              </p>
            </div>
          </div>

          {post.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.coverImageUrl} alt={post.title} className="h-72 w-full rounded-lg object-cover" />
          ) : null}

          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-[#3d281d]">{post.title}</h1>
            <div className="flex flex-wrap gap-2">
              {post.topics.map((item) => (
                <Badge key={item.topicId}>{item.topic.name}</Badge>
              ))}
            </div>
            <p className="text-base leading-8 text-[#5d4435]">{post.content}</p>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-[#f0e4d7] pt-4">
            <PostLikeButton postId={post.id} active={Boolean(liked)} count={post.likes.length} />
            <PostFavoriteButton postId={post.id} active={Boolean(favorited)} count={post.favorites.length} />
            {isAuthor ? (
              <>
                <Link
                  href={`/posts/${post.id}?mode=edit`}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-[#ead7c1] bg-white px-4 text-sm font-medium text-[#6b4a36] hover:bg-[#f8f1e8]"
                >
                  编辑帖子
                </Link>
                <DeletePostButton postId={post.id} />
              </>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5">
          <h2 className="text-xl font-semibold text-[#3d281d]">评论区</h2>
          <CommentForm postId={post.id} />
          <div className="space-y-4 border-t border-[#f0e4d7] pt-5">
            {post.comments.length ? (
              post.comments.map((comment) => (
                <div key={comment.id} className="rounded-lg bg-[#fff8f0] p-4">
                  <div className="mb-2 flex items-center gap-3">
                    <Avatar name={comment.author.name} src={comment.author.profile?.avatarUrl} className="h-9 w-9" />
                    <div>
                      <p className="text-sm font-medium text-[#432c20]">{comment.author.name}</p>
                      <p className="text-xs text-[#8b6b54]">{formatDateTime(comment.createdAt)}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-7 text-[#694f3f]">{comment.content}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#8b6b54]">还没有评论，来写下第一条回复吧。</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
