import type { Metadata } from "next";
import { LeaguesScreen } from "@/screens/leagues";

export const metadata: Metadata = {
  title: "Лига и рейтинг",
  description:
    "Актуальный лидерборд лиги, место участника и переход топ-3 в следующую лигу.",
  alternates: { canonical: "/leagues" },
};

export default function LeaguesPage() {
  return <LeaguesScreen />;
}
