import { Prisma, UserTopicPurpose } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseCommaSeparated } from "@/lib/utils";

export const profileInclude = {
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

export const postInclude = {
  author: {
    include: {
      profile: true,
    },
  },
  topics: {
    include: {
      topic: true,
    },
  },
  likes: true,
  favorites: true,
  comments: {
    include: {
      author: {
        include: {
          profile: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  },
} satisfies Prisma.PostInclude;

export async function getTopicNames() {
  const topics = await prisma.topic.findMany({ orderBy: { name: "asc" } });
  return topics.map((topic) => topic.name);
}

export async function ensureTopics(names: string[]) {
  const uniqueNames = Array.from(new Set(names.map((name) => name.trim()).filter(Boolean)));
  for (const name of uniqueNames) {
    await prisma.topic.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  return prisma.topic.findMany({
    where: {
      name: {
        in: uniqueNames,
      },
    },
  });
}

export function splitTopicsByPurpose<
  T extends {
    purpose: UserTopicPurpose;
    topic: { name: string };
  },
>(topics: T[]) {
  return {
    offerTopics: topics.filter((item) => item.purpose === UserTopicPurpose.OFFER).map((item) => item.topic.name),
    interestTopics: topics.filter((item) => item.purpose === UserTopicPurpose.INTEREST).map((item) => item.topic.name),
  };
}

export function parseFilters(searchParams: Record<string, string | string[] | undefined>) {
  const read = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  return {
    q: read("q")?.trim() || "",
    city: read("city") || "",
    topic: read("topic") || "",
    interest: read("interest") || "",
    roleType: read("roleType") || "",
    experience: read("experience") || "",
    communication: read("communication") || "",
    openOnly: read("openOnly") === "true",
    favoritesOnly: read("favoritesOnly") === "true",
  };
}

export function toStringArray(value: string | string[] | undefined) {
  if (!value) return [];
  return Array.isArray(value) ? value.flatMap((item) => parseCommaSeparated(item)) : parseCommaSeparated(value);
}
