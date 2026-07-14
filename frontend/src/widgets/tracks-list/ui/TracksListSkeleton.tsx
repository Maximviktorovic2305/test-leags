import { Card, PageContainer, Skeleton } from "@/shared/ui";
import styles from "./styles.module.css";

const TRACK_PLACEHOLDERS = 6;

export function TracksListSkeleton() {
  return (
    <PageContainer
      aria-label="Загрузка трасс"
      aria-live="polite"
      className={styles.skeletonPage}
      role="status"
      width="wide"
    >
      <header className={styles.pageHeader}>
        <div className={styles.skeletonTitleBlock}>
          <Skeleton className={styles.skeletonCaption} shape="line" />
          <Skeleton className={styles.skeletonTitle} shape="line" />
          <Skeleton className={styles.skeletonDescription} shape="line" />
        </div>
        <Card className={styles.skeletonProgress} padding="compact">
          <Skeleton className={styles.skeletonProgressIcon} shape="circle" />
          <div>
            <Skeleton className={styles.skeletonProgressValue} shape="line" />
            <Skeleton className={styles.skeletonProgressLabel} shape="line" />
          </div>
        </Card>
      </header>

      <section aria-hidden className={styles.grid}>
        {Array.from({ length: TRACK_PLACEHOLDERS }, (_, index) => (
          <Card className={styles.skeletonTrackCard} key={index}>
            <div className={styles.skeletonTrackTop}>
              <Skeleton className={styles.skeletonTrackNumber} shape="line" />
              <Skeleton className={styles.skeletonTrackAction} shape="circle" />
            </div>
            <Skeleton className={styles.skeletonTrackName} shape="line" />
            <div className={styles.skeletonTrackMeta}>
              <Skeleton className={styles.skeletonPillWide} />
              <Skeleton className={styles.skeletonPill} />
            </div>
          </Card>
        ))}
      </section>
    </PageContainer>
  );
}
