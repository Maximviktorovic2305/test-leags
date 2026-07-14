import { CircleUserRound } from "lucide-react";
import { Typography } from "@/shared/ui";
import type { User } from "../model/types";
import styles from "./styles.module.css";

type UserBadgeProps = {
  user: User;
};

export function UserBadge({ user }: UserBadgeProps) {
  return (
    <div className={styles.badge}>
      <span className={styles.avatar}>
        <CircleUserRound aria-hidden size={20} />
      </span>
      <span className={styles.info}>
        <Typography variant="label">{user.nickname}</Typography>
        <Typography variant="caption" tone="muted">
          {user.points} очков
        </Typography>
      </span>
    </div>
  );
}
