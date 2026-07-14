import { Medal } from "lucide-react";
import type { LeaderboardEntry } from "@/entities/league";
import { Typography } from "@/shared/ui";
import styles from "./styles.module.css";

type LeaderboardRowProps = {
  entry: LeaderboardEntry;
  sticky?: boolean;
};

export function LeaderboardRow({ entry, sticky = false }: LeaderboardRowProps) {
  return (
    <div
      className={`${styles.row} ${entry.isCurrent ? styles.current : ""} ${
        entry.isTopThree ? styles[`place${entry.rank}`] : ""
      } ${sticky ? styles.stickyRow : ""}`}
      data-current-user={entry.isCurrent && !sticky}
      role="row"
    >
      <div className={styles.rank} role="cell">
        {entry.isTopThree ? (
          <Medal aria-label={`Место ${entry.rank}`} size={20} />
        ) : (
          <Typography as="span" variant="label" tone="muted">
            {entry.rank}
          </Typography>
        )}
      </div>
      <div className={styles.name} role="cell">
        <Typography as="span" variant="label">
          {entry.nickname}
        </Typography>
        {entry.isCurrent ? (
          <Typography as="span" variant="caption" tone="primary">
            Вы
          </Typography>
        ) : null}
      </div>
      <Typography as="span" className={styles.score} role="cell" variant="label">
        {entry.points} очков
      </Typography>
    </div>
  );
}
