import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { commentSchema } from "@/lib/validations";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  const { id } = await context.params;
  const parsed = commentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message || "评论内容有误" }, { status: 400 });
  }

  await prisma.comment.create({
    data: {
      postId: id,
      authorId: user.id,
      content: parsed.data.content,
    },
  });

  return Response.json({ ok: true });
}
