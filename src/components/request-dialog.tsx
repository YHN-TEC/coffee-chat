"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CommunicationPreference } from "@prisma/client";
import { z } from "zod";
import { communicationPreferenceLabels } from "@/lib/utils";
import { coffeeRequestSchema } from "@/lib/validations";
import { Button, Card, CardContent, Field, Input, Select, Textarea } from "@/components/ui";
import { toast } from "sonner";

type RequestValues = z.infer<typeof coffeeRequestSchema>;

export function RequestDialog({
  receiverId,
  receiverName,
}: {
  receiverId: string;
  receiverName: string;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const form = useForm<RequestValues>({
    resolver: zodResolver(coffeeRequestSchema),
    defaultValues: {
      receiverId,
      subject: "",
      preferredDate: "",
      timeSlot: "",
      meetingStyle: CommunicationPreference.OFFLINE,
      location: "",
      discussionTopics: "",
      notes: "",
    },
  });

  const onSubmit = async (values: RequestValues) => {
    setSubmitting(true);
    const response = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const payload = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      toast.error(payload.error || "发起邀约失败");
      return;
    }

    toast.success(`已向 ${receiverName} 发出邀约`);
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>发起 Coffee Chat</Button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#29170d]/50 p-4">
          <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <CardContent className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-[#3d281d]">邀请 {receiverName} 喝一杯咖啡</h3>
                  <p className="mt-1 text-sm text-[#8b6b54]">把你想聊的内容和时间写清楚，更容易收到回应。</p>
                </div>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  关闭
                </Button>
              </div>

              <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <Field label="邀约主题" error={form.formState.errors.subject?.message}>
                  <Input placeholder="例如：想聊聊 AI 产品的早期验证" {...form.register("subject")} />
                </Field>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="期望日期" error={form.formState.errors.preferredDate?.message}>
                    <Input type="date" {...form.register("preferredDate")} />
                  </Field>
                  <Field label="期望时间段" error={form.formState.errors.timeSlot?.message}>
                    <Input placeholder="例如：周四晚上 19:30 - 20:30" {...form.register("timeSlot")} />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                  <Field label="交流方式" error={form.formState.errors.meetingStyle?.message}>
                    <Select {...form.register("meetingStyle")}>
                      {Object.values(CommunicationPreference).map((item) => (
                        <option key={item} value={item}>
                          {communicationPreferenceLabels[item]}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="线下城市和地点，或线上方式" error={form.formState.errors.location?.message}>
                    <Input placeholder="例如：上海 · 武康路附近咖啡馆 / 腾讯会议" {...form.register("location")} />
                  </Field>
                </div>

                <Field label="想聊的内容" error={form.formState.errors.discussionTopics?.message}>
                  <Textarea placeholder="告诉对方你希望这次 Coffee Chat 解决什么问题、交换什么经验。" {...form.register("discussionTopics")} />
                </Field>

                <Field label="对方需要提前了解的信息" error={form.formState.errors.notes?.message}>
                  <Textarea placeholder="例如：我会提前发一页背景介绍，控制在 45 分钟。" {...form.register("notes")} />
                </Field>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    取消
                  </Button>
                  <Button type="submit" loading={submitting}>
                    提交邀约
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  );
}
