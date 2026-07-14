"use client";

import { Star } from "lucide-react";
import { getApiErrorMessage } from "@/shared/api";
import { Button, Typography } from "@/shared/ui";
import { ratingValues } from "../data/rating-values";
import { useRateTrack } from "../model/use-rate-track";
import styles from "./styles.module.css";

type TrackRatingProps = {
  initialRating: number | null;
  trackId: string;
};

export function TrackRating({ initialRating, trackId }: TrackRatingProps) {
  const { mutation, rating, setRating } = useRateTrack(trackId, initialRating);

  return (
    <section className={styles.rating}>
      <div className={styles.heading}>
        <Typography variant="h3">Оцените трассу</Typography>
        <Typography variant="small" tone="muted">
          Оценку можно изменить в любое время.
        </Typography>
      </div>
      <div aria-label="Оценка трассы" className={styles.stars} role="group">
        {ratingValues.map((value) => (
          <button
            aria-label={`${value} из 5`}
            className={`${styles.star} ${value <= rating ? styles.active : ""}`}
            key={value}
            onClick={() => setRating(value)}
            type="button"
          >
            <Star aria-hidden fill="currentColor" size={28} />
          </button>
        ))}
      </div>
      <Button
        disabled={rating === 0}
        isLoading={mutation.isPending}
        onClick={() => mutation.mutate(rating)}
        variant="secondary"
      >
        {initialRating ? "Обновить оценку" : "Сохранить оценку"}
      </Button>
      {mutation.isSuccess ? (
        <Typography variant="small" tone="primary">
          Оценка сохранена
        </Typography>
      ) : null}
      {mutation.error ? (
        <Typography role="alert" variant="small" tone="danger">
          {getApiErrorMessage(mutation.error, "Не удалось сохранить оценку")}
        </Typography>
      ) : null}
    </section>
  );
}
