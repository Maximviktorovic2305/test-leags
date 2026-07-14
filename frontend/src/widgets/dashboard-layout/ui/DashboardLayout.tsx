"use client";

import { FlagTriangleRight, Mountain, Trophy } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { UserBadge } from "@/entities/user";
import { AuthGuard } from "@/features/auth-session";
import { LogoutButton } from "@/features/logout";
import { Feedback, Typography } from "@/shared/ui";
import { navigationItems } from "../data/navigation-items";
import { useDashboardLayout } from "../model/use-dashboard-layout";
import styles from "./styles.module.css";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { pathname, userQuery } = useDashboardLayout();

  return (
    <AuthGuard>
      <div className={styles.shell}>
        <header className={styles.header}>
          <Link className={styles.brand} href="/tracks">
            <span className={styles.logo}>
              <Mountain aria-hidden size={21} />
            </span>
            <Typography variant="label">Climb League</Typography>
          </Link>

          <nav aria-label="Основная навигация" className={styles.navigation}>
            {navigationItems.map((item) => {
              const Icon = item.icon === "tracks" ? FlagTriangleRight : Trophy;
              return (
                <Link
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={`${styles.navItem} ${pathname === item.href ? styles.active : ""}`}
                  href={item.href}
                  key={item.href}
                >
                  <Icon aria-hidden size={18} />
                  <Typography as="span" variant="label">
                    {item.label}
                  </Typography>
                </Link>
              );
            })}
          </nav>

          <div className={styles.profile}>
            {userQuery.data ? <UserBadge user={userQuery.data} /> : null}
            <LogoutButton />
          </div>
        </header>
        {userQuery.isError ? (
          <Feedback type="error" message="Профиль не найден. Войдите снова." />
        ) : (
          children
        )}
      </div>
    </AuthGuard>
  );
}
