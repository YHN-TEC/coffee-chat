"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Coffee } from "lucide-react";
import { demoAccounts } from "@/lib/constants";
import { loginSchema, registerSchema } from "@/lib/validations";
import { Button, Card, CardContent, Field, Input } from "@/components/ui";
import { toast } from "sonner";

type AuthValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const schema = mode === "login" ? loginSchema : registerSchema;
  const form = useForm<AuthValues>({
    resolver: zodResolver(schema as never) as never,
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: AuthValues) => {
    setSubmitting(true);
    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const payload = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      toast.error(payload.error || "提交失败");
      return;
    }

    toast.success(mode === "login" ? "登录成功，欢迎回来" : "注册成功，先完善一下资料吧");
    router.push(payload.redirectTo);
    router.refresh();
  };

  return (
    <div className="grid min-h-screen bg-[#fcf7f1] lg:grid-cols-[1.05fr_0.95fr]">
      <div className="hidden bg-[linear-gradient(180deg,#fff7ee,transparent)] p-10 lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#5b3620] text-white">
            <Coffee className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-semibold text-[#3d281d]">CupLink</p>
            <p className="text-sm text-[#8b6b54]">慢煮咖啡，快连知己</p>
          </div>
        </div>

        <div className="max-w-xl space-y-6">
          <div className="space-y-3">
            <p className="inline-flex rounded-full bg-[#f2dfc7] px-3 py-1 text-xs font-medium text-[#7d5032]">
              两小时内可演示的完整社区 Demo
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-[#3d281d]">
              找到对的人，约一杯咖啡，把线上认识延伸到线下交流。
            </h1>
            <p className="text-base leading-7 text-[#735844]">
              注册、发现、收藏、发起邀约、接受邀约，再到社区发帖和评论，所有核心数据都会真实写入数据库。
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {demoAccounts.map((account) => (
              <Card key={account.email} className="bg-white/80">
                <CardContent className="space-y-2">
                  <p className="text-sm font-semibold text-[#4a3023]">{account.label}</p>
                  <p className="text-sm text-[#7b5f4a]">{account.name}</p>
                  <p className="text-xs text-[#8b6b54]">{account.email}</p>
                  <p className="text-xs text-[#8b6b54]">密码：{account.password}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <p className="text-sm text-[#8b6b54]">温暖的咖啡色系 + 真实中文内容，直接适合演示。</p>
      </div>

      <div className="flex items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold text-[#3d281d]">
                {mode === "login" ? "登录 CupLink" : "创建你的 CupLink 账号"}
              </h2>
              <p className="text-sm text-[#8b6b54]">
                {mode === "login" ? "用邮箱密码直接登录，也可以复制演示账号体验。" : "注册成功后会进入资料完善页面。"}
              </p>
            </div>

            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              {mode === "register" ? (
                <Field label="昵称" error={form.formState.errors.name?.message as string | undefined}>
                  <Input placeholder="例如：林知夏" {...form.register("name")} />
                </Field>
              ) : null}

              <Field label="邮箱" error={form.formState.errors.email?.message}>
                <Input type="email" placeholder="name@example.com" {...form.register("email")} />
              </Field>

              <Field label="密码" error={form.formState.errors.password?.message}>
                <Input type="password" placeholder="至少 6 位" {...form.register("password")} />
              </Field>

              {mode === "register" ? (
                <Field label="确认密码" error={form.formState.errors.confirmPassword?.message as string | undefined}>
                  <Input type="password" placeholder="再次输入密码" {...form.register("confirmPassword")} />
                </Field>
              ) : null}

              <Button type="submit" className="w-full" loading={submitting}>
                {mode === "login" ? "登录" : "注册并继续"}
              </Button>
            </form>

            {mode === "login" ? (
              <div className="space-y-3 rounded-lg bg-[#fcf5eb] p-4">
                <p className="text-sm font-medium text-[#5b3620]">演示账号</p>
                <div className="space-y-2 text-sm text-[#7b5f4a]">
                  {demoAccounts.map((account) => (
                    <button
                      type="button"
                      key={account.email}
                      onClick={() => {
                        form.setValue("email", account.email);
                        form.setValue("password", account.password);
                      }}
                      className="flex w-full items-center justify-between rounded-lg border border-[#ead7c1] bg-white px-3 py-2 text-left hover:bg-[#fffaf5]"
                    >
                      <span>{account.name}</span>
                      <span className="text-xs text-[#9a7f69]">一键填充</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <p className="text-center text-sm text-[#8b6b54]">
              {mode === "login" ? "还没有账号？" : "已经有账号了？"}{" "}
              <Link
                href={mode === "login" ? "/register" : "/login"}
                className="font-medium text-[#5b3620] underline underline-offset-2"
              >
                {mode === "login" ? "去注册" : "去登录"}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
