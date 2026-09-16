"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CommunicationPreference } from "@prisma/client";
import { ArrowLeft, RefreshCw, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Avatar, Badge, Button, Card, CardContent, Field, Input, Select, Textarea } from "@/components/ui";
import { communicationPreferenceLabels } from "@/lib/utils";

type MatchInput = {
  background: string;
  goal: string;
  preferredDate: string;
  timeSlot: string;
  meetingStyle: CommunicationPreference;
};

type Invitation = {
  receiverId: string;
  subject: string;
  preferredDate: string;
  timeSlot: string;
  meetingStyle: CommunicationPreference;
  location: string;
  discussionTopics: string;
  notes: string;
};

type Recommendation = {
  candidateId: string;
  candidateName: string;
  avatarUrl: string | null;
  city: string;
  role: string;
  organization: string;
  bio: string;
  offerTopics: string[];
  score: number;
  reason: string;
  invitation: Omit<Invitation, "receiverId">;
};

type MatchResult = {
  sessionId: string;
  fallbackUsed: boolean;
  model: string;
  recommendations: Recommendation[];
};

const emptyInput: MatchInput = {
  background: "",
  goal: "",
  preferredDate: "",
  timeSlot: "",
  meetingStyle: CommunicationPreference.BOTH,
};

function toInvitation(recommendation: Recommendation): Invitation {
  return {
    receiverId: recommendation.candidateId,
    subject: recommendation.invitation.subject,
    preferredDate: recommendation.invitation.preferredDate,
    timeSlot: recommendation.invitation.timeSlot,
    meetingStyle: recommendation.invitation.meetingStyle,
    location: recommendation.invitation.location,
    discussionTopics: recommendation.invitation.discussionTopics,
    notes: recommendation.invitation.notes,
  };
}

export function MatchAgent() {
  const router = useRouter();
  const [input, setInput] = useState<MatchInput>(emptyInput);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Invitation>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);

  const updateInput = <Key extends keyof MatchInput>(key: Key, value: MatchInput[Key]) => {
    setInput((current) => ({ ...current, [key]: value }));
  };

  const hydrateDrafts = (nextResult: MatchResult) => {
    setDrafts(
      Object.fromEntries(
        nextResult.recommendations.map((item) => [
          item.candidateId,
          toInvitation(item),
        ]),
      ),
    );
  };

  const submit = async () => {
    setLoading(true);
    const response = await fetch("/api/ai/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      toast.error(payload.error || "AI 邀约助手暂时不可用");
      return;
    }

    setResult(payload);
    hydrateDrafts(payload);
  };

  const updateDraft = <Key extends keyof Invitation>(
    candidateId: string,
    key: Key,
    value: Invitation[Key],
  ) => {
    setDrafts((current) => ({
      ...current,
      [candidateId]: {
        ...current[candidateId],
        [key]: value,
      },
    }));
  };

  const sendDraft = async (recommendation: Recommendation) => {
    const draft = drafts[recommendation.candidateId];
    if (!draft) return;

    setSendingId(recommendation.candidateId);
    const response = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...draft,
        source: "AI",
        aiSessionId: result?.sessionId,
      }),
    });
    const payload = await response.json();
    setSendingId(null);

    if (!response.ok) {
      toast.error(payload.error || "发送邀约失败");
      return;
    }

    toast.success(`已向 ${recommendation.candidateName} 发出邀约`);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#5b3620] text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#3d281d]">AI 邀约助手</h2>
              <p className="mt-1 text-sm text-[#8b6b54]">描述你的背景和目标，让系统帮你找到合适的人，并生成一条邀约草稿。</p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="你的背景">
              <Textarea
                value={input.background}
                onChange={(event) => updateInput("background", event.target.value)}
                placeholder="例如：我在做 AI 产品，过去两年负责从 0 到 1 的验证和增长。"
              />
            </Field>
            <Field label="交流目标">
              <Textarea
                value={input.goal}
                onChange={(event) => updateInput("goal", event.target.value)}
                placeholder="例如：想了解早期项目如何验证用户价值，并听听对方踩过的坑。"
              />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-[180px_1fr_1fr]">
            <Field label="期望日期">
              <Input
                type="date"
                value={input.preferredDate}
                onChange={(event) => updateInput("preferredDate", event.target.value)}
              />
            </Field>
            <Field label="期望时间段">
              <Input
                value={input.timeSlot}
                onChange={(event) => updateInput("timeSlot", event.target.value)}
                placeholder="例如：周四晚上 19:30 - 20:30"
              />
            </Field>
            <Field label="交流方式">
              <Select
                value={input.meetingStyle}
                onChange={(event) =>
                  updateInput("meetingStyle", event.target.value as CommunicationPreference)
                }
              >
                {Object.values(CommunicationPreference).map((item) => (
                  <option key={item} value={item}>
                    {communicationPreferenceLabels[item]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#8b6b54]">
              推荐结果会生成可编辑草稿，确认后才发送。
            </p>
            <div className="flex gap-2">
              {result ? (
                <Button type="button" variant="outline" onClick={submit} loading={loading}>
                  <RefreshCw className="h-4 w-4" />
                  换一批
                </Button>
              ) : null}
              <Button type="button" onClick={submit} loading={loading}>
                <Sparkles className="h-4 w-4" />
                生成推荐
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {result ? (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-[#3d281d]">推荐结果</h2>
              <p className="mt-1 text-sm text-[#8b6b54]">
                共 {result.recommendations.length} 位候选人
                {result.fallbackUsed ? " · 当前使用演示推荐逻辑" : " · AI 已生成邀约草稿"}
              </p>
            </div>
            <Link
              href="/discover"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#d9c1ad] bg-white px-4 text-sm font-medium text-[#5b3620] hover:bg-[#faf6f0]"
            >
              <ArrowLeft className="h-4 w-4" />
              返回手动搜索
            </Link>
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            {result.recommendations.map((recommendation) => {
              const draft = drafts[recommendation.candidateId];
              return (
                <Card key={recommendation.candidateId} className="h-full">
                  <CardContent className="space-y-5">
                    <div className="flex items-start gap-3">
                      <Avatar name={recommendation.candidateName} src={recommendation.avatarUrl} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <Link
                            href={`/people/${recommendation.candidateId}`}
                            className="font-semibold text-[#3d281d] hover:underline"
                          >
                            {recommendation.candidateName}
                          </Link>
                          <Badge className="bg-[#fff1df] text-[#9a5d27]">
                            {recommendation.score} 分
                          </Badge>
                        </div>
                        <p className="truncate text-sm text-[#6e503e]">
                          {recommendation.role} · {recommendation.organization}
                        </p>
                        <p className="text-sm text-[#8b6b54]">{recommendation.city}</p>
                      </div>
                    </div>

                    <div className="rounded-lg bg-[#fff8f0] p-3 text-sm leading-6 text-[#6b4f3f]">
                      {recommendation.reason}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {recommendation.offerTopics.slice(0, 5).map((topic) => (
                        <Badge key={topic}>{topic}</Badge>
                      ))}
                    </div>

                    <div className="space-y-4 border-t border-[#f0e4d7] pt-4">
                      <Field label="邀约主题">
                        <Input
                          value={draft?.subject || ""}
                          onChange={(event) => updateDraft(recommendation.candidateId, "subject", event.target.value)}
                        />
                      </Field>
                      <Field label="地点或线上方式">
                        <Input
                          value={draft?.location || ""}
                          onChange={(event) => updateDraft(recommendation.candidateId, "location", event.target.value)}
                        />
                      </Field>
                      <Field label="想聊内容">
                        <Textarea
                          value={draft?.discussionTopics || ""}
                          onChange={(event) =>
                            updateDraft(recommendation.candidateId, "discussionTopics", event.target.value)
                          }
                        />
                      </Field>
                      <Field label="提前了解">
                        <Textarea
                          value={draft?.notes || ""}
                          onChange={(event) => updateDraft(recommendation.candidateId, "notes", event.target.value)}
                        />
                      </Field>
                      <Button
                        className="w-full"
                        type="button"
                        loading={sendingId === recommendation.candidateId}
                        onClick={() => sendDraft(recommendation)}
                      >
                        <Send className="h-4 w-4" />
                        发送邀约
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
