import type { Metadata } from "next";
import { TracksScreen } from "@/screens/tracks";

export const metadata: Metadata = {
  title: "Трассы",
  description:
    "Шесть скалолазных трасс: сложность, очки, результаты прохождения и оценки.",
  alternates: { canonical: "/tracks" },
};

export default function TracksPage() {
  return <TracksScreen />;
}
