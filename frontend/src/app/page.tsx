import type { Metadata } from "next";
import { LoginScreen } from "@/screens/login";

export const metadata: Metadata = {
  title: "Вход в сезон",
  description:
    "Войдите по никнейму и начните проходить трассы в Зелёной лиге.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return <LoginScreen />;
}
