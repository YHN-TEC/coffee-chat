import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { PostFavoriteButton, PostLikeButton } from "@/components/toggle-actions";
import { Avatar, Badge, Card, CardContent } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

export function PostCard({
  post,
}: {
  post: {
    id: string;
    title: string;
    content: string;
    coverImageUrl?: string | null;
    createdAt: Date;
    author: {
      name: string;
      profile?: {
        avatarUrl?: string | null;
        city?: string;
      } | null;
    };
    topicNames: string[];
    likeCount: number;
    favoriteCount: number;
    commentCount: number;
    isLiked: boolean;
    isFavorited: boolean;
  };
}) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar name={post.author.name} src={post.author.profile?.avatarUrl} className="h-10 w-10" />
          <div>
            <p className="font-medium text-[#432c20]">{post.author.name}</p>
            <p className="text-xs text-[#8b6b54]">
              {post.author.profile?.city || "线上"} · {formatDateTime(post.createdAt)}
            </p>
          </div>
        </div>

        <Link href={`/posts/${post.id}`} className="block space-y-3">
          {post.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.coverImageUrl} alt={post.title} className="h-56 w-full rounded-lg object-cover" />
          ) : null}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-[#3d281d]">{post.title}</h3>
            <p className="line-clamp-4 text-sm leading-7 text-[#694f3f]">{post.content}</p>
          </div>
        </Link>

        <div className="flex flex-wrap gap-2">
          {post.topicNames.map((topic) => (
            <Badge key={topic}>{topic}</Badge>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-[#f0e4d7] pt-4">
          <PostLikeButton postId={post.id} active={post.isLiked} count={post.likeCount} />
          <PostFavoriteButton postId={post.id} active={post.isFavorited} count={post.favoriteCount} />
          <Link
            href={`/posts/${post.id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-[#ead7c1] bg-white px-3 py-2 text-sm font-medium text-[#6b4a36] hover:bg-[#f8f1e8]"
          >
            <MessageCircle className="h-4 w-4" />
            {post.commentCount > 0 ? `${post.commentCount}` : "评论"}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
