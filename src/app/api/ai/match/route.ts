import { generateAiMatch } from "@/lib/ai-match";
import { requireUser } from "@/lib/auth";
import { aiMatchSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const user = await requireUser();
  const parsed = aiMatchSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message || "输入信息不完整" }, { status: 400 });
  }

  try {
    const result = await generateAiMatch(user.id, parsed.data);
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI 邀约助手暂时不可用";
    return Response.json({ error: message }, { status: 400 });
  }
}
