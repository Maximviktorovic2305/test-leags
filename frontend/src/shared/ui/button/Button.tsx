import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./styles.module.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  isLoading?: boolean;
  size?: "small" | "medium" | "large";
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({
  children,
  className = "",
  disabled,
  isLoading = false,
  size = "medium",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[size]} ${styles[variant]} ${className}`}
      disabled={disabled || isLoading}
      type={type}
      {...props}
    >
      {isLoading ? <span className={styles.spinner} aria-hidden /> : null}
      {children}
    </button>
  );
}
