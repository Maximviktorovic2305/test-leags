import { Skeleton } from "@/shared/ui";
import styles from "./auth-guard-skeleton.module.css";

const CARD_PLACEHOLDERS = 6;

export function AuthGuardSkeleton() {
  return (
    <div
      aria-label="Восстановление сессии"
      aria-live="polite"
      className={styles.shell}
      role="status"
    >
      <header className={styles.header}>
        <div className={styles.brand}>
          <Skeleton className={styles.logo} />
          <Skeleton className={styles.brandName} shape="line" />
        </div>
        <div className={styles.navigation}>
          <Skeleton className={styles.navItem} />
          <Skeleton className={styles.navItem} />
        </div>
        <div className={styles.actions}>
          <Skeleton className={styles.action} shape="circle" />
          <Skeleton className={styles.action} shape="circle" />
          <Skeleton className={styles.avatar} shape="circle" />
        </div>
      </header>

      <main aria-hidden className={styles.content}>
        <div className={styles.heading}>
          <Skeleton className={styles.caption} shape="line" />
          <Skeleton className={styles.title} shape="line" />
          <Skeleton className={styles.description} shape="line" />
        </div>
        <div className={styles.grid}>
          {Array.from({ length: CARD_PLACEHOLDERS }, (_, index) => (
            <div className={styles.card} key={index}>
              <div className={styles.cardTop}>
                <Skeleton className={styles.cardCaption} shape="line" />
                <Skeleton className={styles.cardAction} shape="circle" />
              </div>
              <Skeleton className={styles.cardTitle} shape="line" />
              <div className={styles.cardMeta}>
                <Skeleton className={styles.pillWide} />
                <Skeleton className={styles.pill} />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
