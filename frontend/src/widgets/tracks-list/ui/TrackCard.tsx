import { ArrowUpRight, CheckCircle2, Gauge, Sparkles } from "lucide-react";
import { trackDifficultyLabels, type Track } from "@/entities/track";
import { Card, Typography } from "@/shared/ui";
import styles from "./styles.module.css";

type TrackCardProps = {
  onClick: () => void;
  track: Track;
};

export function TrackCard({ onClick, track }: TrackCardProps) {
  return (
    <button className={styles.trackButton} onClick={onClick} type="button">
      <Card className={styles.trackCard}>
        <div className={styles.trackTop}>
          <Typography variant="caption" tone="muted">
            Трасса {String(track.order).padStart(2, "0")}
          </Typography>
          <ArrowUpRight aria-hidden size={19} />
        </div>

        <div className={styles.trackName}>
          <Typography variant="h3">{track.name}</Typography>
          {track.completion ? (
            <span className={styles.completed} title="Пройдена">
              <CheckCircle2 aria-hidden size={19} />
            </span>
          ) : null}
        </div>

        <div className={styles.trackMeta}>
          <span
            className={`${styles.difficulty} ${styles[track.difficulty.toLowerCase()]}`}
          >
            <Gauge aria-hidden size={15} />
            <Typography as="span" variant="label">
              {trackDifficultyLabels[track.difficulty]}
            </Typography>
          </span>
          <span className={styles.points}>
            <Sparkles aria-hidden size={15} />
            <Typography as="span" variant="label">
              {track.points} очков
            </Typography>
          </span>
        </div>
      </Card>
    </button>
  );
}
