"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellRing, BookHeart, Coffee, Compass, LogOut, Newspaper, Sparkles, UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/discover", label: "发现", icon: Compass },
  { href: "/match", label: "AI 邀约", icon: Sparkles },
  { href: "/posts", label: "社区", icon: Newspaper },
  { href: "/requests", label: "邀约", icon: BellRing },
  { href: "/favorites", label: "我的收藏", icon: BookHeart },
  { href: "/my-posts", label: "我的帖子", icon: Coffee },
  { href: "/profile", label: "个人资料", icon: UserCircle2 },
];

export function AppShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName: string;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#fcf7f1]">
      <header className="sticky top-0 z-20 border-b border-[#ecd9c7] bg-[#fffaf5]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <Link href="/discover" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5b3620] text-white">
                <Coffee className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-semibold text-[#3d281d]">CupLink</p>
                <p className="text-xs text-[#8b6b54]">慢煮咖啡，快连知己</p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-[#4d3123]">{userName}</p>
                <p className="text-xs text-[#8b6b54]">欢迎回来，找个舒服的人聊聊</p>
              </div>
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#d9c1ad] bg-white px-3 text-sm font-medium text-[#5b3620] hover:bg-[#faf6f0]"
                  title="退出登录"
                >
                  <LogOut className="h-4 w-4" />
                  退出
                </button>
              </form>
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto pb-1">
            {items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex min-w-fit items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition border",
                    active
                      ? "border-[#b7ddd3] bg-[#e6f5f0] text-[#21574d]"
                      : "border-[#ead7c1] bg-white text-[#6b4a36] hover:bg-[#f6ede1]",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">{children}</main>
    </div>
  );
}
