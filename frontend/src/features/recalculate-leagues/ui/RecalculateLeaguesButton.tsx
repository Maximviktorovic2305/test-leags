"use client";

import { RefreshCw } from "lucide-react";
import { Button, Typography } from "@/shared/ui";
import { useRecalculateLeagues } from "../model/use-recalculate-leagues";
import styles from "./styles.module.css";

export function RecalculateLeaguesButton() {
  const mutation = useRecalculateLeagues();

  return (
    <div className={styles.action}>
      <Button isLoading={mutation.isPending} onClick={() => mutation.mutate()} variant="secondary">
        <RefreshCw aria-hidden size={16} />
        Пересчитать лиги
      </Button>
      {mutation.isSuccess ? (
        <Typography variant="small" tone="primary">
          Переведено: {mutation.data.promoted.length}
        </Typography>
      ) : null}
      {mutation.error ? (
        <Typography variant="small" tone="danger">
          {mutation.error.message}
        </Typography>
      ) : null}
    </div>
  );
}
