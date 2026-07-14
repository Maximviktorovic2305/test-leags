import type { InputHTMLAttributes } from "react";
import { Typography } from "../typography/Typography";
import styles from "./styles.module.css";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label: string;
};

export function Input({ error, id, label, className = "", ...props }: InputProps) {
  return (
    <label className={`${styles.field} ${className}`} htmlFor={id}>
      <Typography variant="label">{label}</Typography>
      <input
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={styles.input}
        id={id}
        {...props}
      />
      {error ? (
        <Typography id={`${id}-error`} variant="small" tone="danger">
          {error}
        </Typography>
      ) : null}
    </label>
  );
}
