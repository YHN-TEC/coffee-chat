"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { commentSchema } from "@/lib/validations";
import { Button, Textarea } from "@/components/ui";
import { toast } from "sonner";

type CommentValues = z.infer<typeof commentSchema>;

export function CommentForm({ postId }: { postId: string }) {
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const form = useForm<CommentValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: "" },
  });

  const onSubmit = async (values: CommentValues) => {
    setSubmitting(true);
    const response = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const payload = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      toast.error(payload.error || "评论失败");
      return;
    }

    toast.success("评论已发布");
    form.reset();
    router.refresh();
  };

  return (
    <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
      <Textarea placeholder="写下你的想法，让这场对话更完整" {...form.register("content")} />
      {form.formState.errors.content?.message ? (
        <p className="text-sm text-[#b74835]">{form.formState.errors.content.message}</p>
      ) : null}
      <div className="flex justify-end">
        <Button type="submit" loading={submitting}>
          发布评论
        </Button>
      </div>
    </form>
  );
}
