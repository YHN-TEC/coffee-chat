"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { communicationOptions, experienceOptions, roleTypeOptions } from "@/lib/constants";
import { communicationPreferenceLabels, experienceLevelLabels, roleTypeLabels } from "@/lib/utils";
import { profileSchema } from "@/lib/validations";
import { TagSelector } from "@/components/tag-selector";
import { Badge, Button, Card, CardContent, Checkbox, Field, Input, Select, Textarea } from "@/components/ui";
import { toast } from "sonner";

type ProfileValues = z.infer<typeof profileSchema>;

export function ProfileForm({
  mode,
  topicOptions,
  initialValues,
}: {
  mode: "create" | "edit";
  topicOptions: string[];
  initialValues: ProfileValues;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialValues,
  });
  const offerTopics = useWatch({ control: form.control, name: "offerTopics" }) || [];
  const interestTopics = useWatch({ control: form.control, name: "interestTopics" }) || [];
  const isOpenToCoffeeChat = useWatch({ control: form.control, name: "isOpenToCoffeeChat" });

  const onSubmit = async (values: ProfileValues) => {
    setSubmitting(true);
    const response = await fetch("/api/profile", {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const payload = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      toast.error(payload.error || "保存失败");
      return;
    }

    toast.success(mode === "create" ? "资料已完成，开始发现有趣的人吧" : "资料已更新");
    router.push(payload.redirectTo || "/profile");
    router.refresh();
  };

  return (
    <Card>
      <CardContent className="space-y-6">
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="头像 URL" hint="可留空，系统会使用姓名首字头像" error={form.formState.errors.avatarUrl?.message}>
              <Input placeholder="https://example.com/avatar.jpg" {...form.register("avatarUrl")} />
            </Field>
            <Field label="昵称" error={form.formState.errors.name?.message}>
              <Input placeholder="例如：林知夏" {...form.register("name")} />
            </Field>
            <Field label="所在城市" error={form.formState.errors.city?.message}>
              <Input placeholder="例如：上海" {...form.register("city")} />
            </Field>
            <Field label="当前公司或学校" error={form.formState.errors.organization?.message}>
              <Input placeholder="例如：沐光科技 / 复旦大学" {...form.register("organization")} />
            </Field>
            <Field label="当前职位或身份" error={form.formState.errors.role?.message}>
              <Input placeholder="例如：AI 产品经理" {...form.register("role")} />
            </Field>
            <Field label="职位类型" error={form.formState.errors.roleType?.message}>
              <Select {...form.register("roleType")}>
                {roleTypeOptions.map((item) => (
                  <option key={item} value={item}>
                    {roleTypeLabels[item]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="工作年限" error={form.formState.errors.yearsOfExperience?.message}>
              <Select {...form.register("yearsOfExperience")}>
                {experienceOptions.map((item) => (
                  <option key={item} value={item}>
                    {experienceLevelLabels[item]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="可交流方式" error={form.formState.errors.communicationPreference?.message}>
              <Select {...form.register("communicationPreference")}>
                {communicationOptions.map((item) => (
                  <option key={item} value={item}>
                    {communicationPreferenceLabels[item]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="一句个人简介" error={form.formState.errors.bio?.message}>
            <Input placeholder="写一句别人看到你时最想记住的话" {...form.register("bio")} />
          </Field>

          <Field label="背景经历" error={form.formState.errors.background?.message}>
            <Textarea placeholder="介绍你的经历、现在在做的事情，以及想聊的方向" {...form.register("background")} />
          </Field>

          <Field label="我想认识的人" error={form.formState.errors.peopleToMeet?.message}>
            <Textarea placeholder="例如：做 AI 应用、出海增长、内容产品的人" {...form.register("peopleToMeet")} />
          </Field>

          <Field label="常用交流语言" error={form.formState.errors.languages?.message}>
            <Input placeholder="例如：中文, English" {...form.register("languages")} />
          </Field>

          <div className="rounded-lg bg-[#fcf5eb] p-4">
            <TagSelector
              label="我可以聊的话题"
              options={topicOptions}
              value={offerTopics}
              onChange={(nextValue) => form.setValue("offerTopics", nextValue, { shouldValidate: true })}
            />
            {form.formState.errors.offerTopics?.message ? (
              <p className="mt-2 text-sm text-[#b74835]">{form.formState.errors.offerTopics.message}</p>
            ) : null}
          </div>

          <div className="rounded-lg bg-[#fcf5eb] p-4">
            <TagSelector
              label="我感兴趣的领域"
              options={topicOptions}
              value={interestTopics}
              onChange={(nextValue) => form.setValue("interestTopics", nextValue, { shouldValidate: true })}
            />
            {form.formState.errors.interestTopics?.message ? (
              <p className="mt-2 text-sm text-[#b74835]">{form.formState.errors.interestTopics.message}</p>
            ) : null}
          </div>

          <label className="flex items-center gap-3 rounded-lg border border-[#ead7c1] bg-[#fffaf5] p-4">
            <Checkbox
              checked={Boolean(isOpenToCoffeeChat)}
              onChange={(event) => form.setValue("isOpenToCoffeeChat", event.target.checked)}
            />
            <div className="space-y-1">
              <p className="text-sm font-medium text-[#5b3620]">当前开放 Coffee Chat 邀约</p>
              <p className="text-sm text-[#8b6b54]">关闭后，别人仍可查看资料，但不会把你显示为开放状态。</p>
            </div>
            <Badge className="ml-auto bg-[#ecf7f2] text-[#2d7a61]">{isOpenToCoffeeChat ? "开放中" : "暂不开放"}</Badge>
          </label>

          <div className="flex justify-end">
            <Button type="submit" size="lg" loading={submitting}>
              {mode === "create" ? "保存资料并进入发现页" : "保存个人资料"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
