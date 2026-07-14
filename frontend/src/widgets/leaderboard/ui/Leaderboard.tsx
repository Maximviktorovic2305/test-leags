"use client";

import { ArrowUp, ShieldCheck, Trophy } from "lucide-react";
import { RecalculateLeaguesButton } from "@/features/recalculate-leagues";
import { getApiErrorMessage } from "@/shared/api";
import { Card, Feedback, PageContainer, Typography } from "@/shared/ui";
import { leagueDescriptions } from "../data/league-copy";
import { useCurrentRowVisibility } from "../model/use-current-row-visibility";
import { useLeaderboard } from "../model/use-leaderboard";
import { LeaderboardSkeleton } from "./LeaderboardSkeleton";
import { LeaderboardRow } from "./LeaderboardRow";
import styles from "./styles.module.css";

export function Leaderboard() {
  const { leaderboardQuery } = useLeaderboard();
  const entries = leaderboardQuery.data?.entries ?? [];
  const visibility = useCurrentRowVisibility(entries.length);

  if (leaderboardQuery.isLoading) return <LeaderboardSkeleton />;
  if (leaderboardQuery.isError || !leaderboardQuery.data) {
    return (
      <Feedback
        message={getApiErrorMessage(
          leaderboardQuery.error,
          "Не удалось загрузить рейтинг",
        )}
      />
    );
  }

  const leaderboard = leaderboardQuery.data;

  return (
    <PageContainer>
      <header className={styles.pageHeader}>
        <div className={styles.titleBlock}>
          <span
            className={`${styles.leagueIcon} ${
              leaderboard.league === "BLUE" ? styles.blue : ""
            }`}
          >
            <ShieldCheck aria-hidden size={25} />
          </span>
          <div>
            <Typography variant="caption" tone="primary">
              Текущий дивизион
            </Typography>
            <Typography variant="h1">{leaderboard.title}</Typography>
            <Typography tone="muted">
              {leagueDescriptions[leaderboard.league]}
            </Typography>
          </div>
        </div>
        <RecalculateLeaguesButton />
      </header>

      <div className={styles.layout}>
        <Card className={styles.board}>
          <div className={styles.boardHeader}>
            <div>
              <Trophy aria-hidden size={20} />
              <Typography variant="h3">Лидерборд</Typography>
            </div>
            <Typography variant="small" tone="muted">
              {entries.length} участников
            </Typography>
          </div>

          <div className={styles.tableHeader} role="row">
            <Typography as="span" variant="caption" tone="muted">
              Место
            </Typography>
            <Typography as="span" variant="caption" tone="muted">
              Участник
            </Typography>
            <Typography as="span" variant="caption" tone="muted">
              Результат
            </Typography>
          </div>

          <div className={styles.rows} id={visibility.containerId} role="rowgroup">
            {entries.map((entry) => (
              <LeaderboardRow
                entry={entry}
                key={entry.id}
              />
            ))}
          </div>

          {!visibility.isVisible ? (
            <div className={styles.pinned}>
              <Typography variant="caption" tone="muted">
                Ваша позиция
              </Typography>
              <LeaderboardRow entry={leaderboard.currentUser} sticky />
            </div>
          ) : null}
        </Card>

        <aside className={styles.sidebar}>
          <Card className={styles.userResult} padding="default">
            <span className={styles.arrowIcon}>
              <ArrowUp aria-hidden size={22} />
            </span>
            <Typography variant="caption" tone="muted">
              Ваша позиция
            </Typography>
            <Typography variant="h1">#{leaderboard.currentUser.rank}</Typography>
            <Typography tone="muted">
              {leaderboard.currentUser.points} очков в этом сезоне
            </Typography>
          </Card>

          <Card className={styles.ruleCard} padding="default">
            <Typography variant="h3">Как перейти выше</Typography>
            <Typography tone="muted">
              В момент пересчёта топ‑3 Зелёной лиги автоматически переходит в
              Синюю. Очки сохраняются.
            </Typography>
          </Card>
        </aside>
      </div>
    </PageContainer>
  );
}
