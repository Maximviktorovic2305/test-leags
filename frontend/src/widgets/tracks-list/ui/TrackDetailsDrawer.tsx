import { Award, CalendarCheck, Gauge, Sparkles } from "lucide-react";
import {
  calculateRetryPoints,
  completionResultLabels,
  trackDifficultyLabels,
  type Track,
} from "@/entities/track";
import { CompleteTrackForm } from "@/features/complete-track";
import { TrackRating } from "@/features/rate-track";
import { formatDate } from "@/shared/lib/format-date";
import { Drawer, Typography } from "@/shared/ui";
import styles from "./details.module.css";

type TrackDetailsDrawerProps = {
  onClose: () => void;
  track: Track | null;
};

export function TrackDetailsDrawer({ onClose, track }: TrackDetailsDrawerProps) {
  return (
    <Drawer isOpen={Boolean(track)} onClose={onClose} title={track?.name ?? "Трасса"}>
      {track ? (
        <div className={styles.content}>
          <div className={styles.meta}>
            <span>
              <Gauge aria-hidden size={17} />
              <Typography as="span" variant="label">
                {trackDifficultyLabels[track.difficulty]}
              </Typography>
            </span>
            <span>
              <Sparkles aria-hidden size={17} />
              <Typography as="span" variant="label">
                {track.points} очков
              </Typography>
            </span>
          </div>

          <Typography tone="muted">{track.description}</Typography>

          <div className={styles.formula}>
            <Award aria-hidden size={23} />
            <div>
              <Typography variant="label">Начисление очков</Typography>
              <Typography variant="small" tone="muted">
                Первая попытка — {track.points}, повторная — {calculateRetryPoints(track.points)}.
              </Typography>
            </div>
          </div>

          {track.completion ? (
            <div className={styles.completion}>
              <CalendarCheck aria-hidden size={24} />
              <div>
                <Typography variant="label">
                  {completionResultLabels[track.completion.result]}
                </Typography>
                <Typography variant="small" tone="muted">
                  +{track.completion.awardedPoints} очков · {formatDate(track.completion.completedAt)}
                </Typography>
              </div>
            </div>
          ) : (
            <CompleteTrackForm track={track} />
          )}

          {track.completion ? (
            <TrackRating
              initialRating={track.userRating}
              trackId={track.id}
            />
          ) : null}
        </div>
      ) : null}
    </Drawer>
  );
}
