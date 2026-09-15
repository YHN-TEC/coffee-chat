import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  const { id } = await context.params;

  if (user.id === id) {
    return Response.json({ error: "不能收藏自己" }, { status: 400 });
  }

  const existing = await prisma.favoriteUser.findUnique({
    where: {
      userId_favoriteUserId: {
        userId: user.id,
        favoriteUserId: id,
      },
    },
  });

  if (existing) {
    await prisma.favoriteUser.delete({ where: { id: existing.id } });
    return Response.json({ message: "已取消收藏" });
  }

  await prisma.favoriteUser.create({
    data: {
      userId: user.id,
      favoriteUserId: id,
    },
  });

  return Response.json({ message: "已加入我的收藏" });
}
