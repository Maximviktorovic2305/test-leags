import type { HTMLAttributes, ReactNode } from "react";
import styles from "./styles.module.css";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padding?: "none" | "compact" | "default" | "comfortable";
};

export function Card({
  children,
  className = "",
  padding = "none",
  ...props
}: CardProps) {
  return (
    <div className={`${styles.card} ${styles[padding]} ${className}`} {...props}>
      {children}
    </div>
  );
}
