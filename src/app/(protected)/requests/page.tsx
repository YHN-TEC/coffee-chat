import { CoffeeRequestStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { RequestStatusButtons } from "@/components/toggle-actions";
import { Badge, Card, CardContent, EmptyState, SectionHeading } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { communicationPreferenceLabels } from "@/lib/utils";

const statusLabels: Record<CoffeeRequestStatus, string> = {
  PENDING: "待处理",
  ACCEPTED: "已接受",
  REJECTED: "已拒绝",
};

const statusClasses: Record<CoffeeRequestStatus, string> = {
  PENDING: "bg-[#fff1df] text-[#9a5d27]",
  ACCEPTED: "bg-[#ebf7f0] text-[#2f7a61]",
  REJECTED: "bg-[#f7ebe8] text-[#b74835]",
};

export default async function RequestsPage() {
  const user = await requireUser();
  if (!user.profile) redirect("/onboarding");

  const [received, sent] = await Promise.all([
    prisma.coffeeRequest.findMany({
      where: { receiverId: user.id },
      include: {
        sender: { include: { profile: true } },
        receiver: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.coffeeRequest.findMany({
      where: { senderId: user.id },
      include: {
        sender: true,
        receiver: { include: { profile: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <SectionHeading title="邀约" description="这是 CupLink 的主路径，查看你收到的和发出的邀约。" />

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-[#3d281d]">我收到的邀约</h2>
            <p className="text-sm text-[#8b6b54]">接受或拒绝邀约后，状态会立即持久化保存。</p>
          </div>
          {received.length ? (
            <div className="space-y-4">
              {received.map((item) => (
                <Card key={item.id}>
                  <CardContent className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-[#3d281d]">{item.subject}</h3>
                        <p className="text-sm text-[#7b5f4a]">
                          来自 {item.sender.name} · {item.sender.profile?.role || "CupLink 用户"}
                        </p>
                      </div>
                      <Badge className={statusClasses[item.status]}>{statusLabels[item.status]}</Badge>
                    </div>

                    <div className="space-y-2 text-sm leading-6 text-[#6b4f3f]">
                      <p><span className="font-medium text-[#4b3023]">期望日期：</span>{item.preferredDate}</p>
                      <p><span className="font-medium text-[#4b3023]">时间段：</span>{item.timeSlot}</p>
                      <p><span className="font-medium text-[#4b3023]">交流方式：</span>{communicationPreferenceLabels[item.meetingStyle]}</p>
                      <p><span className="font-medium text-[#4b3023]">地点 / 方式：</span>{item.location}</p>
                      <p><span className="font-medium text-[#4b3023]">想聊内容：</span>{item.discussionTopics}</p>
                      <p><span className="font-medium text-[#4b3023]">提前了解：</span>{item.notes}</p>
                    </div>

                    {item.status === CoffeeRequestStatus.PENDING ? <RequestStatusButtons requestId={item.id} /> : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState title="还没有收到新的邀约" description="当有人向你发出 Coffee Chat 邀约时，会出现在这里。" />
          )}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-[#3d281d]">我发出的邀约</h2>
            <p className="text-sm text-[#8b6b54]">你发出的每一条邀约都会保存在数据库里，刷新后仍然可见。</p>
          </div>
          {sent.length ? (
            <div className="space-y-4">
              {sent.map((item) => (
                <Card key={item.id}>
                  <CardContent className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-[#3d281d]">{item.subject}</h3>
                        <p className="text-sm text-[#7b5f4a]">
                          发给 {item.receiver.name} · {item.receiver.profile?.role || "CupLink 用户"}
                        </p>
                      </div>
                      <Badge className={statusClasses[item.status]}>{statusLabels[item.status]}</Badge>
                    </div>

                    <div className="space-y-2 text-sm leading-6 text-[#6b4f3f]">
                      <p><span className="font-medium text-[#4b3023]">期望日期：</span>{item.preferredDate}</p>
                      <p><span className="font-medium text-[#4b3023]">时间段：</span>{item.timeSlot}</p>
                      <p><span className="font-medium text-[#4b3023]">交流方式：</span>{communicationPreferenceLabels[item.meetingStyle]}</p>
                      <p><span className="font-medium text-[#4b3023]">地点 / 方式：</span>{item.location}</p>
                      <p><span className="font-medium text-[#4b3023]">想聊内容：</span>{item.discussionTopics}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState title="你还没有发出邀约" description="去用户详情页挑一个想认识的人，直接发起 Coffee Chat 吧。" />
          )}
        </section>
      </div>
    </div>
  );
}
