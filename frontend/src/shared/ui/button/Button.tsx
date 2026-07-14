import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import styles from "./styles.module.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  isLoading?: boolean;
  size?: "small" | "medium" | "large";
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    className = "",
    disabled,
    isLoading = false,
    size = "medium",
    type = "button",
    variant = "primary",
    ...props
  },
  ref,
) {
  return (
    <button
      aria-busy={isLoading || undefined}
      className={`${styles.button} ${styles[size]} ${styles[variant]} ${className}`}
      disabled={disabled || isLoading}
      ref={ref}
      type={type}
      {...props}
    >
      {isLoading ? <span className={styles.spinner} aria-hidden /> : null}
      {children}
    </button>
  );
});
