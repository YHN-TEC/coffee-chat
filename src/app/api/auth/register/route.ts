import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0]?.message || "注册信息有误" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });
    if (existing) {
      return Response.json({ error: "该邮箱已注册，请直接登录" }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        passwordHash: await hashPassword(parsed.data.password),
      },
    });

    await createSession(user.id);
    return Response.json({ redirectTo: "/onboarding" });
  } catch {
    return Response.json({ error: "注册失败，请稍后再试" }, { status: 500 });
  }
}
