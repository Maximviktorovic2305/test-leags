"use client";

import { Check, RotateCcw } from "lucide-react";
import { completionResultLabels, type Track } from "@/entities/track";
import { getApiErrorMessage } from "@/shared/api";
import { Button, Typography } from "@/shared/ui";
import { completionOptions } from "../data/completion-options";
import { useCompleteTrack } from "../model/use-complete-track";
import styles from "./styles.module.css";

type CompleteTrackFormProps = {
  track: Track;
};

export function CompleteTrackForm({ track }: CompleteTrackFormProps) {
  const mutation = useCompleteTrack(track.id);

  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <Typography variant="h3">Как прошла попытка?</Typography>
        <Typography variant="small" tone="muted">
          Результат можно сохранить один раз — выберите внимательно.
        </Typography>
      </div>
      <div className={styles.options}>
        {completionOptions.map((option) => {
          const Icon = option.result === "FIRST_TRY" ? Check : RotateCcw;
          return (
            <Button
              className={styles.option}
              disabled={mutation.isPending}
              key={option.result}
              onClick={() => mutation.mutate(option.result)}
              variant="secondary"
            >
              <span className={styles.optionIcon}>
                <Icon aria-hidden size={20} />
              </span>
              <span className={styles.optionText}>
                <Typography as="span" variant="label">
                  {completionResultLabels[option.result]}
                </Typography>
                <Typography as="span" variant="small" tone="muted">
                  {option.description}
                </Typography>
              </span>
            </Button>
          );
        })}
      </div>
      {mutation.error ? (
        <Typography role="alert" variant="small" tone="danger">
          {getApiErrorMessage(
            mutation.error,
            "Не удалось сохранить прохождение",
          )}
        </Typography>
      ) : null}
    </section>
  );
}
