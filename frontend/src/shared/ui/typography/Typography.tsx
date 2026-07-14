import type { ElementType, HTMLAttributes, ReactNode } from "react";
import styles from "./styles.module.css";

export type TypographyVariant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "body"
  | "small"
  | "label"
  | "caption"
  | "micro";

type TypographyProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  children: ReactNode;
  variant?: TypographyVariant;
  tone?: "default" | "muted" | "primary" | "danger" | "contrast";
};

const defaultElements: Record<TypographyVariant, ElementType> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  body: "p",
  small: "p",
  label: "span",
  caption: "span",
  micro: "span",
};

export function Typography({
  as,
  children,
  className = "",
  variant = "body",
  tone = "default",
  ...props
}: TypographyProps) {
  const Component = as ?? defaultElements[variant];

  return (
    <Component
      className={`${styles.base} ${styles[variant]} ${styles[tone]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
