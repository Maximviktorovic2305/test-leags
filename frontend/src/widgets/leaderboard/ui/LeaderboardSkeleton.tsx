import { Card, PageContainer, Skeleton } from "@/shared/ui";
import styles from "./styles.module.css";

const ROW_PLACEHOLDERS = 7;

export function LeaderboardSkeleton() {
  return (
    <PageContainer
      aria-label="Загрузка рейтинга"
      aria-live="polite"
      className={styles.skeletonPage}
      role="status"
    >
      <header className={styles.pageHeader}>
        <div className={styles.titleBlock}>
          <Skeleton className={styles.skeletonLeagueIcon} shape="circle" />
          <div className={styles.skeletonHeading}>
            <Skeleton className={styles.skeletonCaption} shape="line" />
            <Skeleton className={styles.skeletonTitle} shape="line" />
            <Skeleton className={styles.skeletonDescription} shape="line" />
          </div>
        </div>
        <Skeleton className={styles.skeletonButton} />
      </header>

      <div aria-hidden className={styles.layout}>
        <Card className={styles.board}>
          <div className={styles.boardHeader}>
            <Skeleton className={styles.skeletonBoardTitle} shape="line" />
            <Skeleton className={styles.skeletonCount} shape="line" />
          </div>
          <div className={styles.tableHeader}>
            <Skeleton className={styles.skeletonColumn} shape="line" />
            <Skeleton className={styles.skeletonColumnWide} shape="line" />
            <Skeleton className={styles.skeletonColumn} shape="line" />
          </div>
          <div>
            {Array.from({ length: ROW_PLACEHOLDERS }, (_, index) => (
              <div className={styles.skeletonRow} key={index}>
                <Skeleton className={styles.skeletonRank} shape="circle" />
                <Skeleton className={styles.skeletonName} shape="line" />
                <Skeleton className={styles.skeletonScore} shape="line" />
              </div>
            ))}
          </div>
        </Card>

        <aside className={styles.sidebar}>
          <Card className={styles.skeletonUserResult} padding="default">
            <Skeleton className={styles.skeletonResultIcon} shape="circle" />
            <Skeleton className={styles.skeletonResultLabel} shape="line" />
            <Skeleton className={styles.skeletonResultValue} shape="line" />
            <Skeleton className={styles.skeletonResultDescription} shape="line" />
          </Card>
          <Card className={styles.skeletonRuleCard} padding="default">
            <Skeleton className={styles.skeletonRuleTitle} shape="line" />
            <Skeleton className={styles.skeletonRuleLine} shape="line" />
            <Skeleton className={styles.skeletonRuleLineShort} shape="line" />
          </Card>
        </aside>
      </div>
    </PageContainer>
  );
}
