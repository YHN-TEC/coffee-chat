import { ensureTopics } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { postSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const user = await requireUser();
  const parsed = postSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message || "帖子内容有误" }, { status: 400 });
  }

  const topics = await ensureTopics(parsed.data.topics);
  const post = await prisma.post.create({
    data: {
      authorId: user.id,
      title: parsed.data.title,
      content: parsed.data.content,
      coverImageUrl: parsed.data.coverImageUrl || null,
      topics: {
        create: topics.map((topic) => ({
          topicId: topic.id,
        })),
      },
    },
  });

  return Response.json({ redirectTo: `/posts/${post.id}` });
}
