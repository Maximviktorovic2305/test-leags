"use client";

import { Route, Sparkles } from "lucide-react";
import { getApiErrorMessage } from "@/shared/api";
import { Card, Feedback, PageContainer, Typography } from "@/shared/ui";
import { useTracksList } from "../model/use-tracks-list";
import { TrackCard } from "./TrackCard";
import { TrackDetailsDrawer } from "./TrackDetailsDrawer";
import { TracksListSkeleton } from "./TracksListSkeleton";
import styles from "./styles.module.css";

export function TracksList() {
  const state = useTracksList();

  if (state.tracksQuery.isLoading) return <TracksListSkeleton />;
  if (state.tracksQuery.isError) {
    return (
      <Feedback
        message={getApiErrorMessage(
          state.tracksQuery.error,
          "Не удалось загрузить трассы",
        )}
      />
    );
  }

  const completedCount =
    state.tracksQuery.data?.filter((track) => Boolean(track.completion)).length ?? 0;

  return (
    <PageContainer width="wide">
      <header className={styles.pageHeader}>
        <div className={styles.titleBlock}>
          <Typography variant="caption" tone="primary">
            <Route aria-hidden size={15} /> Сезон 01
          </Typography>
          <Typography variant="h1">Выберите следующую трассу</Typography>
          <Typography tone="muted">
            Результат сохранится, а очки сразу изменят вашу позицию в лиге.
          </Typography>
        </div>
        <Card className={styles.progress} padding="compact">
          <Sparkles aria-hidden size={20} />
          <div>
            <Typography variant="h3">
              {completedCount} / {state.tracksQuery.data?.length ?? 0}
            </Typography>
            <Typography variant="small" tone="muted">
              трасс пройдено
            </Typography>
          </div>
        </Card>
      </header>

      <section aria-label="Список трасс" className={styles.grid}>
        {state.tracksQuery.data?.map((track) => (
          <TrackCard key={track.id} onClick={() => state.openTrack(track.id)} track={track} />
        ))}
      </section>

      <TrackDetailsDrawer
        onClose={state.closeTrack}
        track={state.selectedTrack}
      />
    </PageContainer>
  );
}
