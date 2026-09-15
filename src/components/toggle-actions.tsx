"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Heart, Star, X } from "lucide-react";
import { Button } from "@/components/ui";
import { toast } from "sonner";

async function postJson(url: string, body?: Record<string, unknown>) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "操作失败");
  }
  return payload;
}

export function FavoriteUserButton({
  personId,
  isFavorited,
}: {
  personId: string;
  isFavorited: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <Button
      type="button"
      variant={isFavorited ? "secondary" : "outline"}
      loading={loading}
      onClick={async () => {
        try {
          setLoading(true);
          const payload = await postJson(`/api/users/${personId}/favorite`);
          toast.success(payload.message);
          router.refresh();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "收藏失败");
        } finally {
          setLoading(false);
        }
      }}
      title={isFavorited ? "取消收藏" : "收藏此人"}
    >
      <Star className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
      {isFavorited ? "已收藏" : "收藏"}
    </Button>
  );
}

export function PostLikeButton({
  postId,
  active,
  count,
}: {
  postId: string;
  active: boolean;
  count: number;
}) {
  return (
    <ActionButton
      url={`/api/posts/${postId}/like`}
      title={active ? "取消点赞" : "点赞"}
      label={count > 0 ? `${count}` : "点赞"}
      icon={<Heart className={`h-4 w-4 ${active ? "fill-current" : ""}`} />}
      active={active}
    />
  );
}

export function PostFavoriteButton({
  postId,
  active,
  count,
}: {
  postId: string;
  active: boolean;
  count: number;
}) {
  return (
    <ActionButton
      url={`/api/posts/${postId}/favorite`}
      title={active ? "取消收藏帖子" : "收藏帖子"}
      label={count > 0 ? `${count}` : "收藏"}
      icon={<Star className={`h-4 w-4 ${active ? "fill-current" : ""}`} />}
      active={active}
    />
  );
}

function ActionButton({
  url,
  title,
  label,
  icon,
  active,
}: {
  url: string;
  title: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <button
      type="button"
      title={title}
      onClick={async () => {
        try {
          setLoading(true);
          await postJson(url);
          router.refresh();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "操作失败");
        } finally {
          setLoading(false);
        }
      }}
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
        active
          ? "border-[#f0c9a4] bg-[#fff2e5] text-[#8e4e1f]"
          : "border-[#ead7c1] bg-white text-[#6b4a36] hover:bg-[#f8f1e8]"
      }`}
      disabled={loading}
    >
      {icon}
      {label}
    </button>
  );
}

export function RequestStatusButtons({
  requestId,
}: {
  requestId: string;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const updateStatus = async (status: "ACCEPTED" | "REJECTED") => {
    try {
      setLoading(status);
      await postJson(`/api/requests/${requestId}/status`, { status });
      toast.success(status === "ACCEPTED" ? "已接受邀约" : "已拒绝邀约");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "更新状态失败");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex gap-2">
      <Button type="button" variant="secondary" loading={loading === "ACCEPTED"} onClick={() => updateStatus("ACCEPTED")}>
        <Check className="h-4 w-4" />
        接受
      </Button>
      <Button type="button" variant="outline" loading={loading === "REJECTED"} onClick={() => updateStatus("REJECTED")}>
        <X className="h-4 w-4" />
        拒绝
      </Button>
    </div>
  );
}

export function DeletePostButton({ postId }: { postId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="outline"
      loading={loading}
      onClick={async () => {
        if (!window.confirm("确定删除这篇帖子吗？删除后无法恢复。")) return;
        try {
          setLoading(true);
          const response = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
          const payload = await response.json();
          if (!response.ok) throw new Error(payload.error || "删除失败");
          toast.success("帖子已删除");
          router.push(payload.redirectTo || "/my-posts");
          router.refresh();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "删除失败");
        } finally {
          setLoading(false);
        }
      }}
    >
      删除帖子
    </Button>
  );
}
