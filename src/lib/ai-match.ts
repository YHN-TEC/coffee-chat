import { CommunicationPreference, Prisma, UserTopicPurpose } from "@prisma/client";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const candidateProfileInclude = {
  profile: {
    include: {
      topics: {
        include: {
          topic: true,
        },
      },
    },
  },
} satisfies Prisma.UserInclude;

type CandidateProfile = {
  avatarUrl: string | null;
  city: string;
  role: string;
  organization: string;
  bio: string;
  background: string;
  communicationPreference: CommunicationPreference;
  isOpenToCoffeeChat: boolean;
  topics: {
    purpose: UserTopicPurpose;
    topic: { name: string };
  }[];
};

type CandidateUser = {
  id: string;
  name: string;
  profile: CandidateProfile | null;
};

type Requester = {
  id: string;
  name: string;
  profile: {
    city: string;
    role: string;
    organization: string;
    bio: string;
    background: string;
    communicationPreference: CommunicationPreference;
    topics: {
      purpose: UserTopicPurpose;
      topic: { name: string };
    }[];
  };
};

type MatchInput = {
  background: string;
  goal: string;
  preferredDate: string;
  timeSlot: string;
  meetingStyle: CommunicationPreference;
};

type CandidateSummary = {
  id: string;
  name: string;
  avatarUrl: string | null;
  city: string;
  role: string;
  organization: string;
  bio: string;
  background: string;
  communicationPreference: CommunicationPreference;
  offerTopics: string[];
  interestTopics: string[];
  score: number;
};

const aiOutputSchema = z.object({
  recommendations: z
    .array(
      z.object({
        candidateId: z.string(),
        score: z.number().min(0).max(100),
        reason: z.string().min(4),
        invitation: z.object({
          subject: z.string().min(4),
          location: z.string().min(2),
          discussionTopics: z.string().min(8),
          notes: z.string().min(4),
        }),
      }),
    )
    .min(1)
    .max(3),
});

function topicNames(profile: CandidateUser["profile"]) {
  if (!profile) {
    return { offerTopics: [], interestTopics: [] };
  }

  return {
    offerTopics: profile.topics
      .filter((item) => item.purpose === UserTopicPurpose.OFFER)
      .map((item) => item.topic.name),
    interestTopics: profile.topics
      .filter((item) => item.purpose === UserTopicPurpose.INTEREST)
      .map((item) => item.topic.name),
  };
}

function scoreCandidate(requester: Requester, candidate: CandidateUser) {
  const requesterTopics = requester.profile.topics.map((item) => item.topic.name);
  const candidateTopics = topicNames(candidate.profile);
  const allCandidateTopics = [...candidateTopics.offerTopics, ...candidateTopics.interestTopics];
  const topicOverlap = requesterTopics.filter((topic) => allCandidateTopics.includes(topic)).length;

  let score = 50;
  score += Math.min(topicOverlap, 4) * 8;

  if (candidate.profile?.city === requester.profile.city) {
    score += 12;
  }

  if (
    candidate.profile?.communicationPreference === CommunicationPreference.BOTH ||
    candidate.profile?.communicationPreference === requester.profile.communicationPreference
  ) {
    score += 10;
  }

  if (candidate.profile?.isOpenToCoffeeChat) {
    score += 8;
  }

  return Math.min(score, 100);
}

function toSummary(requester: Requester, candidate: CandidateUser): CandidateSummary {
  const topics = topicNames(candidate.profile);
  return {
    id: candidate.id,
    name: candidate.name,
    avatarUrl: candidate.profile?.avatarUrl ?? null,
    city: candidate.profile?.city ?? "",
    role: candidate.profile?.role ?? "",
    organization: candidate.profile?.organization ?? "",
    bio: candidate.profile?.bio ?? "",
    background: candidate.profile?.background ?? "",
    communicationPreference: candidate.profile?.communicationPreference ?? CommunicationPreference.BOTH,
    offerTopics: topics.offerTopics,
    interestTopics: topics.interestTopics,
    score: scoreCandidate(requester, candidate),
  };
}

function buildFallbackRecommendations(input: MatchInput, candidates: CandidateSummary[]) {
  return candidates.slice(0, 3).map((candidate) => {
    const sharedTopics = candidate.offerTopics.length
      ? candidate.offerTopics.slice(0, 3).join("、")
      : candidate.interestTopics.slice(0, 3).join("、") || "职业发展";

    return {
      candidateId: candidate.id,
      score: candidate.score,
      reason: `你关注的方向和 ${candidate.name} 的 ${sharedTopics} 经验比较契合，适合围绕你的目标做一次轻量交流。`,
      invitation: {
        subject: `想和你聊聊：${input.goal.slice(0, 28)}`,
        location: input.meetingStyle === CommunicationPreference.ONLINE ? "腾讯会议或微信语音" : `${candidate.city} · 双方方便的咖啡馆`,
        discussionTopics: input.goal,
        notes: `我目前是 ${input.background.slice(0, 48)}。期待控制在 45 分钟左右，聊完再决定是否有后续合作空间。`,
      },
    };
  });
}

async function getCandidatePool(userId: string, currentUser: Requester) {
  const users = await prisma.user.findMany({
    where: {
      id: { not: userId },
      profile: {
        is: {
          isOpenToCoffeeChat: true,
        },
      },
    },
    include: candidateProfileInclude,
    take: 30,
  });

  return users
    .map((candidate) => toSummary(currentUser, candidate))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

async function runModel(input: MatchInput, currentUser: Requester, candidates: CandidateSummary[]) {
  const model = process.env.OPENAI_MODEL || "gpt-5.6-luna";
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await client.responses.parse({
    model,
    instructions:
      "你是 CupLink 的 Coffee Chat 邀约助手。只根据候选人的公开资料和用户的交流目标推荐最多 3 位，生成自然、具体、适合首次交流的中文邀约草稿。不要编造资料中没有的信息，不要给出恋爱、医疗、法律或求职内推建议。",
    input: JSON.stringify({
      requester: {
        name: currentUser.name,
        city: currentUser.profile.city,
        role: currentUser.profile.role,
        organization: currentUser.profile.organization,
        bio: currentUser.profile.bio,
        background: input.background,
        goal: input.goal,
        preferredDate: input.preferredDate,
        timeSlot: input.timeSlot,
        meetingStyle: input.meetingStyle,
      },
      candidates,
    }),
    text: {
      format: zodTextFormat(aiOutputSchema, "coffee_chat_match"),
    },
  });

  if (!response.output_parsed) {
    throw new Error("AI did not return structured recommendations");
  }

  return response.output_parsed.recommendations.map((item, index) => {
    const candidate = candidates.find((candidate) => candidate.id === item.candidateId);
    if (!candidate) {
      throw new Error("AI returned an unknown candidate");
    }

    return {
      rank: index + 1,
      candidate,
      score: item.score,
      reason: item.reason,
      invitation: {
        subject: item.invitation.subject,
        preferredDate: input.preferredDate,
        timeSlot: input.timeSlot,
        meetingStyle: input.meetingStyle,
        location: item.invitation.location,
        discussionTopics: item.invitation.discussionTopics,
        notes: item.invitation.notes,
      },
    };
  });
}

export async function generateAiMatch(userId: string, input: MatchInput) {
  const requester = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: {
        include: {
          topics: {
            include: {
              topic: true,
            },
          },
        },
      },
    },
  });

  const requesterProfile = requester?.profile;
  if (!requester || !requesterProfile) {
    throw new Error("请先完善个人资料");
  }

  const currentUser: Requester = {
    id: requester.id,
    name: requester.name,
    profile: requesterProfile,
  };

  const candidates = await getCandidatePool(userId, currentUser);
  if (!candidates.length) {
    throw new Error("暂时没有可推荐的 Coffee Chat 对象");
  }

  const startedAt = Date.now();
  let fallbackUsed = false;
  let model = process.env.OPENAI_MODEL || "gpt-5.6-luna";
  let recommendations;

  try {
    recommendations = await runModel(input, currentUser, candidates);
  } catch (error) {
    console.error("[AI_MATCH_ERROR]", error);
    fallbackUsed = true;
    model = "demo-fallback";
    recommendations = buildFallbackRecommendations(input, candidates).map((item, index) => ({
      rank: index + 1,
      candidate: candidates[index],
      score: item.score,
      reason: item.reason,
      invitation: {
        ...item.invitation,
        preferredDate: input.preferredDate,
        timeSlot: input.timeSlot,
        meetingStyle: input.meetingStyle,
      },
    }));
  }

  const session = await prisma.aiMatchSession.create({
    data: {
      requesterId: userId,
      background: input.background,
      goal: input.goal,
      preferredDate: input.preferredDate,
      timeSlot: input.timeSlot,
      meetingStyle: input.meetingStyle,
      model,
      fallbackUsed,
      latencyMs: Date.now() - startedAt,
    },
  });

  await prisma.aiMatchRecommendation.createMany({
    data: recommendations.map((item) => ({
      sessionId: session.id,
      candidateId: item.candidate.id,
      rank: item.rank,
      score: item.score,
      reason: item.reason,
      subject: item.invitation.subject,
      preferredDate: item.invitation.preferredDate,
      timeSlot: item.invitation.timeSlot,
      meetingStyle: item.invitation.meetingStyle,
      location: item.invitation.location,
      discussionTopics: item.invitation.discussionTopics,
      notes: item.invitation.notes,
    })),
  });

  return {
    sessionId: session.id,
    fallbackUsed,
    model,
    recommendations: recommendations.map((item) => ({
      candidateId: item.candidate.id,
      candidateName: item.candidate.name,
      avatarUrl: item.candidate.avatarUrl,
      city: item.candidate.city,
      role: item.candidate.role,
      organization: item.candidate.organization,
      bio: item.candidate.bio,
      offerTopics: item.candidate.offerTopics,
      score: item.score,
      reason: item.reason,
      invitation: item.invitation,
    })),
  };
}
