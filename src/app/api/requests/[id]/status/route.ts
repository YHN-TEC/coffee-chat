import { CoffeeRequestStatus } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  const { id } = await context.params;
  const body = (await request.json()) as { status?: CoffeeRequestStatus };

  if (
    body.status !== CoffeeRequestStatus.ACCEPTED &&
    body.status !== CoffeeRequestStatus.REJECTED
  ) {
    return Response.json({ error: "状态不合法" }, { status: 400 });
  }

  const item = await prisma.coffeeRequest.findUnique({ where: { id } });
  if (!item || item.receiverId !== user.id) {
    return Response.json({ error: "没有权限更新这条邀约" }, { status: 403 });
  }

  await prisma.coffeeRequest.update({
    where: { id },
    data: { status: body.status },
  });

  return Response.json({ ok: true });
}
