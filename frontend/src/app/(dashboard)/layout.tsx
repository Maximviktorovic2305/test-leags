import type { ReactNode } from "react";
import { DashboardLayout } from "@/widgets/dashboard-layout";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
