import { AlertCircle, LoaderCircle } from "lucide-react";
import { Typography } from "../typography/Typography";
import styles from "./styles.module.css";

type FeedbackProps = {
  message?: string;
  type: "loading" | "error";
};

export function Feedback({ message, type }: FeedbackProps) {
  return (
    <div className={styles.feedback} role={type === "error" ? "alert" : "status"}>
      {type === "loading" ? (
        <LoaderCircle className={styles.spinner} aria-hidden size={24} />
      ) : (
        <AlertCircle aria-hidden size={24} />
      )}
      <Typography tone={type === "error" ? "danger" : "muted"}>
        {message ?? (type === "loading" ? "Загружаем данные…" : "Что-то пошло не так")}
      </Typography>
    </div>
  );
}
