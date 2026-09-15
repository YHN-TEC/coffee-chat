import Link from "next/link";
import { Prisma, UserTopicPurpose } from "@prisma/client";
import { redirect } from "next/navigation";
import { UserCard } from "@/components/user-card";
import { Badge, Button, Card, CardContent, EmptyState, Input, SectionHeading, Select } from "@/components/ui";
import { cityOptions, communicationOptions, experienceOptions, roleTypeOptions } from "@/lib/constants";
import { parseFilters } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { communicationPreferenceLabels, experienceLevelLabels, roleTypeLabels } from "@/lib/utils";

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  if (!user.profile) redirect("/onboarding");

  const filters = parseFilters(await searchParams);
  const topics = await prisma.topic.findMany({ orderBy: { name: "asc" } });
  const favoriteIds = (
    await prisma.favoriteUser.findMany({
      where: { userId: user.id },
      select: { favoriteUserId: true },
    })
  ).map((item) => item.favoriteUserId);

  const andConditions: Prisma.UserWhereInput[] = [
    { id: { not: user.id } },
    { profile: { isNot: null } },
  ];

  if (filters.q) {
    andConditions.push({
      OR: [
        { name: { contains: filters.q } },
        { profile: { city: { contains: filters.q } } },
        { profile: { organization: { contains: filters.q } } },
        { profile: { role: { contains: filters.q } } },
        { profile: { bio: { contains: filters.q } } },
        { profile: { background: { contains: filters.q } } },
        {
          profile: {
            topics: {
              some: {
                topic: {
                  name: { contains: filters.q },
                },
              },
            },
          },
        },
      ],
    });
  }

  if (filters.city) andConditions.push({ profile: { city: filters.city } });
  if (filters.roleType) andConditions.push({ profile: { roleType: filters.roleType as never } });
  if (filters.experience) andConditions.push({ profile: { yearsOfExperience: filters.experience as never } });
  if (filters.communication) andConditions.push({ profile: { communicationPreference: filters.communication as never } });
  if (filters.openOnly) andConditions.push({ profile: { isOpenToCoffeeChat: true } });
  if (filters.favoritesOnly) andConditions.push({ id: { in: favoriteIds.length ? favoriteIds : ["__none__"] } });
  if (filters.topic) {
    andConditions.push({
      profile: {
        topics: {
          some: {
            purpose: UserTopicPurpose.OFFER,
            topic: { name: filters.topic },
          },
        },
      },
    });
  }
  if (filters.interest) {
    andConditions.push({
      profile: {
        topics: {
          some: {
            purpose: UserTopicPurpose.INTEREST,
            topic: { name: filters.interest },
          },
        },
      },
    });
  }

  const people = await prisma.user.findMany({
    where: { AND: andConditions },
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
    orderBy: [{ createdAt: "desc" }],
  });

  const activeChips = [
    filters.q ? `搜索：${filters.q}` : null,
    filters.city ? `城市：${filters.city}` : null,
    filters.topic ? `可聊话题：${filters.topic}` : null,
    filters.interest ? `兴趣领域：${filters.interest}` : null,
    filters.roleType ? `职位类型：${roleTypeLabels[filters.roleType as keyof typeof roleTypeLabels]}` : null,
    filters.experience ? `工作年限：${experienceLevelLabels[filters.experience as keyof typeof experienceLevelLabels]}` : null,
    filters.communication ? `交流方式：${communicationPreferenceLabels[filters.communication as keyof typeof communicationPreferenceLabels]}` : null,
    filters.openOnly ? "仅看开放 Coffee Chat" : null,
    filters.favoritesOnly ? "仅看已收藏" : null,
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      <SectionHeading
        title="发现用户"
        description="搜索、筛选并找到值得约一杯咖啡的人。"
        action={
          <div className="rounded-lg bg-[#fff4e8] px-4 py-2 text-sm text-[#7a5338]">
            当前找到 <span className="font-semibold text-[#5b3620]">{people.length}</span> 位可交流用户
          </div>
        }
      />

      <Card>
        <CardContent className="space-y-4">
          <form className="space-y-4" method="get">
            <div className="grid gap-3 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
              <Input name="q" placeholder="搜索昵称、城市、公司、职位、简介、背景、标签" defaultValue={filters.q} />
              <Select name="city" defaultValue={filters.city}>
                <option value="">全部城市</option>
                {cityOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
              <Select name="topic" defaultValue={filters.topic}>
                <option value="">全部可聊话题</option>
                {topics.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </Select>
              <Select name="interest" defaultValue={filters.interest}>
                <option value="">全部兴趣领域</option>
                {topics.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid gap-3 lg:grid-cols-[repeat(3,1fr)_1.2fr_1.2fr_auto]">
              <Select name="roleType" defaultValue={filters.roleType}>
                <option value="">全部职位类型</option>
                {roleTypeOptions.map((item) => (
                  <option key={item} value={item}>
                    {roleTypeLabels[item]}
                  </option>
                ))}
              </Select>
              <Select name="experience" defaultValue={filters.experience}>
                <option value="">全部工作年限</option>
                {experienceOptions.map((item) => (
                  <option key={item} value={item}>
                    {experienceLevelLabels[item]}
                  </option>
                ))}
              </Select>
              <Select name="communication" defaultValue={filters.communication}>
                <option value="">全部交流方式</option>
                {communicationOptions.map((item) => (
                  <option key={item} value={item}>
                    {communicationPreferenceLabels[item]}
                  </option>
                ))}
              </Select>
              <label className="flex h-11 items-center gap-2 rounded-lg border border-[#d9c1ad] bg-white px-3 text-sm text-[#6b4a36]">
                <input type="checkbox" name="openOnly" value="true" defaultChecked={filters.openOnly} />
                仅看开放 Coffee Chat
              </label>
              <label className="flex h-11 items-center gap-2 rounded-lg border border-[#d9c1ad] bg-white px-3 text-sm text-[#6b4a36]">
                <input type="checkbox" name="favoritesOnly" value="true" defaultChecked={filters.favoritesOnly} />
                仅看已收藏
              </label>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">筛选</Button>
                <Link
                  href="/discover"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-[#d9c1ad] bg-white px-4 text-sm font-medium text-[#5b3620] hover:bg-[#faf6f0]"
                >
                  清空
                </Link>
              </div>
            </div>
          </form>

          {activeChips.length ? (
            <div className="flex flex-wrap gap-2 border-t border-[#f0e4d7] pt-4">
              {activeChips.map((chip) => (
                <Badge key={chip}>{chip}</Badge>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {people.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {people.map((person) => {
            const offerTopics = person.profile?.topics
              .filter((item) => item.purpose === UserTopicPurpose.OFFER)
              .map((item) => item.topic.name) || [];

            return (
              <UserCard
                key={person.id}
                person={{
                  id: person.id,
                  name: person.name,
                  profile: {
                    avatarUrl: person.profile?.avatarUrl,
                    city: person.profile?.city || "",
                    role: person.profile?.role || "",
                    organization: person.profile?.organization || "",
                    bio: person.profile?.bio || "",
                    isOpenToCoffeeChat: person.profile?.isOpenToCoffeeChat || false,
                    communicationPreference: person.profile?.communicationPreference || "BOTH",
                    offerTopics,
                  },
                  isFavorited: favoriteIds.includes(person.id),
                }}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="没有找到匹配的人"
          description="换一个关键词，或减少一些筛选条件，会更容易发现合适的 Coffee Chat 对象。"
          action={
            <Link
              href="/discover"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[#5b3620] px-4 text-sm font-medium text-white hover:bg-[#472a19]"
            >
              清空条件，重新看看
            </Link>
          }
        />
      )}
    </div>
  );
}
