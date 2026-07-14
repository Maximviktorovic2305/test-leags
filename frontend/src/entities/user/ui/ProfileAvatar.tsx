"use client";

import { CircleUserRound } from "lucide-react";
import Image from "next/image";
import { Skeleton } from "@/shared/ui";
import { useAvatarObjectUrl } from "../model/use-avatar-object-url";
import type { User } from "../model/types";
import styles from "./styles.module.css";

type ProfileAvatarProps = {
  size?: "medium" | "large";
  user: User;
};

export function ProfileAvatar({ size = "medium", user }: ProfileAvatarProps) {
  const { isLoading, objectUrl } = useAvatarObjectUrl(
    user.avatarUpdatedAt,
    user.hasAvatar,
  );

  return (
    <span className={`${styles.profileAvatar} ${styles[size]}`}>
      {isLoading ? (
        <Skeleton className={styles.avatarSkeleton} shape="circle" />
      ) : objectUrl ? (
        <Image
          alt=""
          className={styles.avatarImage}
          height={size === "large" ? 56 : 40}
          src={objectUrl}
          unoptimized
          width={size === "large" ? 56 : 40}
        />
      ) : (
        <CircleUserRound aria-hidden size={size === "large" ? 28 : 20} />
      )}
    </span>
  );
}
