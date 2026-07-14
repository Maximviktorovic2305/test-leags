"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "../button/Button";
import { Typography } from "../typography/Typography";
import styles from "./styles.module.css";

type DrawerProps = {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
};

export function Drawer({ children, isOpen, onClose, title }: DrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} role="presentation" onMouseDown={onClose}>
      <section
        aria-modal="true"
        aria-labelledby={titleId}
        className={styles.drawer}
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <Typography id={titleId} variant="h2">
            {title}
          </Typography>
          <Button
            aria-label="Закрыть"
            onClick={onClose}
            ref={closeButtonRef}
            size="small"
            variant="ghost"
          >
            <X aria-hidden size={20} />
          </Button>
        </header>
        <div className={styles.content}>{children}</div>
      </section>
    </div>
  );
}
