import type { HTMLAttributes } from "react";
import styles from "./styles.module.css";

type SkeletonProps = HTMLAttributes<HTMLSpanElement> & {
  shape?: "block" | "circle" | "line";
};

export function Skeleton({
  className = "",
  shape = "block",
  ...props
}: SkeletonProps) {
  return (
    <span
      aria-hidden
      className={`${styles.skeleton} ${styles[shape]} ${className}`}
      {...props}
    />
  );
}
