import { AlertCircle } from "lucide-react";
import { Typography } from "../typography/Typography";
import styles from "./styles.module.css";

type FeedbackProps = {
  message?: string;
};

export function Feedback({ message }: FeedbackProps) {
  return (
    <div className={styles.feedback} role="alert">
      <AlertCircle aria-hidden size={24} />
      <Typography tone="danger">
        {message ?? "Что-то пошло не так"}
      </Typography>
    </div>
  );
}
