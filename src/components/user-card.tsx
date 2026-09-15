import Link from "next/link";
import { MapPin, MessageSquareHeart } from "lucide-react";
import { FavoriteUserButton } from "@/components/toggle-actions";
import { Avatar, Badge, Card, CardContent } from "@/components/ui";
import { communicationPreferenceLabels } from "@/lib/utils";

export function UserCard({
  person,
}: {
  person: {
    id: string;
    name: string;
    profile: {
      avatarUrl?: string | null;
      city: string;
      role: string;
      organization: string;
      bio: string;
      isOpenToCoffeeChat: boolean;
      communicationPreference: keyof typeof communicationPreferenceLabels;
      offerTopics: string[];
    };
    isFavorited: boolean;
  };
}) {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <Link href={`/people/${person.id}`} className="flex items-start gap-3">
            <Avatar name={person.name} src={person.profile.avatarUrl} />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-[#3d281d]">{person.name}</p>
                <Badge className={person.profile.isOpenToCoffeeChat ? "bg-[#ebf7f0] text-[#2f7a61]" : "bg-[#f4efe9] text-[#8a7567]"}>
                  {person.profile.isOpenToCoffeeChat ? "开放 Coffee Chat" : "暂不开放"}
                </Badge>
              </div>
              <p className="text-sm text-[#6e503e]">
                {person.profile.role} · {person.profile.organization}
              </p>
              <p className="flex items-center gap-1 text-sm text-[#8b6b54]">
                <MapPin className="h-4 w-4" />
                {person.profile.city}
              </p>
            </div>
          </Link>
          <FavoriteUserButton personId={person.id} isFavorited={person.isFavorited} />
        </div>

        <p className="line-clamp-2 text-sm leading-6 text-[#6c5544]">{person.profile.bio}</p>

        <div className="flex flex-wrap gap-2">
          {person.profile.offerTopics.slice(0, 5).map((topic) => (
            <Badge key={topic}>{topic}</Badge>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#f0e4d7] pt-4">
          <p className="flex items-center gap-2 text-sm text-[#7a5c49]">
            <MessageSquareHeart className="h-4 w-4" />
            {communicationPreferenceLabels[person.profile.communicationPreference]}
          </p>
          <Link href={`/people/${person.id}`} className="text-sm font-medium text-[#5b3620] underline underline-offset-2">
            查看详情
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
