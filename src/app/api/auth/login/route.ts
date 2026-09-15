import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0]?.message || "登录信息有误" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
      include: { profile: true },
    });

    if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
      return Response.json({ error: "邮箱或密码不正确" }, { status: 401 });
    }

    await createSession(user.id);
    return Response.json({ redirectTo: user.profile ? "/discover" : "/onboarding" });
  } catch {
    return Response.json({ error: "登录失败，请稍后再试" }, { status: 500 });
  }
}
