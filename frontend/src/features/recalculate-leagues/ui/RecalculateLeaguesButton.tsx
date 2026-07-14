"use client";

import { RefreshCw } from "lucide-react";
import { getApiErrorMessage } from "@/shared/api";
import { Button, Typography } from "@/shared/ui";
import { useRecalculateLeagues } from "../model/use-recalculate-leagues";
import styles from "./styles.module.css";

export function RecalculateLeaguesButton() {
  const mutation = useRecalculateLeagues();

  return (
    <div className={styles.action}>
      <Button
        isLoading={mutation.isPending}
        onClick={() => mutation.mutate()}
        size="small"
        variant="secondary"
      >
        <RefreshCw aria-hidden size={16} />
        Пересчитать лиги
      </Button>
      {mutation.isSuccess ? (
        <Typography variant="small" tone="primary">
          Переведено: {mutation.data.promoted.length}
        </Typography>
      ) : null}
      {mutation.error ? (
        <Typography role="alert" variant="small" tone="danger">
          {getApiErrorMessage(mutation.error, "Не удалось пересчитать лиги")}
        </Typography>
      ) : null}
    </div>
  );
}
