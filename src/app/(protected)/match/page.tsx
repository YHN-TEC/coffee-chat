import { redirect } from "next/navigation";
import { MatchAgent } from "@/components/match-agent";
import { requireUser } from "@/lib/auth";

export default async function MatchPage() {
  const user = await requireUser();
  if (!user.profile) redirect("/onboarding");

  return <MatchAgent />;
}
