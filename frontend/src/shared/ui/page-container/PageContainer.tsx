import type { HTMLAttributes, ReactNode } from "react";
import styles from "./styles.module.css";

type PageContainerProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  width?: "standard" | "wide";
};

export function PageContainer({
  children,
  className = "",
  width = "standard",
  ...props
}: PageContainerProps) {
  return (
    <main className={`${styles.page} ${styles[width]} ${className}`} {...props}>
      {children}
    </main>
  );
}
