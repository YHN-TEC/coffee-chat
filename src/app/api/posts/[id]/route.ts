import { ensureTopics } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { postSchema } from "@/lib/validations";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  const { id } = await context.params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post || post.authorId !== user.id) {
    return Response.json({ error: "没有权限编辑这篇帖子" }, { status: 403 });
  }

  const parsed = postSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message || "帖子内容有误" }, { status: 400 });
  }

  const topics = await ensureTopics(parsed.data.topics);
  await prisma.post.update({
    where: { id },
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      coverImageUrl: parsed.data.coverImageUrl || null,
    },
  });

  await prisma.postTopic.deleteMany({ where: { postId: id } });
  await prisma.postTopic.createMany({
    data: topics.map((topic) => ({
      postId: id,
      topicId: topic.id,
    })),
  });

  return Response.json({ redirectTo: `/posts/${id}` });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  const { id } = await context.params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post || post.authorId !== user.id) {
    return Response.json({ error: "没有权限删除这篇帖子" }, { status: 403 });
  }

  await prisma.post.delete({ where: { id } });
  return Response.json({ redirectTo: "/my-posts" });
}
