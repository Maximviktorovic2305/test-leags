"use client";

import { FlagTriangleRight, Mountain, Trophy } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { AuthGuard } from "@/features/auth-session";
import { LogoutButton } from "@/features/logout";
import { ThemeToggle } from "@/features/toggle-theme";
import { getApiErrorMessage } from "@/shared/api";
import { Feedback, Skeleton, Typography } from "@/shared/ui";
import { navigationItems } from "../data/navigation-items";
import { useDashboardLayout } from "../model/use-dashboard-layout";
import { ProfileMenu } from "./ProfileMenu";
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
            <div className={styles.profileActions}>
              <ThemeToggle />
              <LogoutButton />
              {userQuery.data ? <ProfileMenu user={userQuery.data} /> : null}
              {userQuery.isLoading ? (
                <Skeleton
                  className={styles.profileSkeleton}
                  shape="circle"
                />
              ) : null}
            </div>
          </div>
        </header>
        {userQuery.isError ? (
          <Feedback
            message={getApiErrorMessage(
              userQuery.error,
              "Не удалось загрузить профиль",
            )}
          />
        ) : (
          children
        )}
      </div>
    </AuthGuard>
  );
}
