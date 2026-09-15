import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  const { id } = await context.params;

  const existing = await prisma.postFavorite.findUnique({
    where: {
      postId_userId: {
        postId: id,
        userId: user.id,
      },
    },
  });

  if (existing) {
    await prisma.postFavorite.delete({ where: { id: existing.id } });
    return Response.json({ ok: true });
  }

  await prisma.postFavorite.create({
    data: {
      postId: id,
      userId: user.id,
    },
  });
  return Response.json({ ok: true });
}
