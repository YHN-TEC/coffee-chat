"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { postSchema } from "@/lib/validations";
import { TagSelector } from "@/components/tag-selector";
import { Button, Card, CardContent, Field, Input, Textarea } from "@/components/ui";
import { toast } from "sonner";

type PostValues = z.infer<typeof postSchema>;

export function PostEditor({
  topicOptions,
  initialValues,
  postId,
}: {
  topicOptions: string[];
  initialValues: PostValues;
  postId?: string;
}) {
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const form = useForm<PostValues>({
    resolver: zodResolver(postSchema),
    defaultValues: initialValues,
  });
  const topics = useWatch({ control: form.control, name: "topics" }) || [];

  const onSubmit = async (values: PostValues) => {
    setSubmitting(true);
    const response = await fetch(postId ? `/api/posts/${postId}` : "/api/posts", {
      method: postId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const payload = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      toast.error(payload.error || "保存失败");
      return;
    }

    toast.success(postId ? "帖子已更新" : "帖子已发布");
    router.push(payload.redirectTo);
    router.refresh();
  };

  return (
    <Card>
      <CardContent className="space-y-6">
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <Field label="标题" error={form.formState.errors.title?.message}>
            <Input placeholder="写一个让人愿意点开的标题" {...form.register("title")} />
          </Field>

          <Field label="正文" error={form.formState.errors.content?.message}>
            <Textarea placeholder="分享你最近的思考、经验或想发起的话题" className="min-h-[220px]" {...form.register("content")} />
          </Field>

          <Field label="封面图片 URL（可选）" error={form.formState.errors.coverImageUrl?.message}>
            <Input placeholder="https://..." {...form.register("coverImageUrl")} />
          </Field>

          <div className="rounded-lg bg-[#fcf5eb] p-4">
            <TagSelector
              label="帖子标签"
              options={topicOptions}
              value={topics}
              onChange={(nextValue) => form.setValue("topics", nextValue, { shouldValidate: true })}
            />
            {form.formState.errors.topics?.message ? (
              <p className="mt-2 text-sm text-[#b74835]">{form.formState.errors.topics.message}</p>
            ) : null}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              取消
            </Button>
            <Button type="submit" loading={submitting}>
              {postId ? "保存修改" : "发布帖子"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
