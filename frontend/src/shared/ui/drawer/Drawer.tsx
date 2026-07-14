"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
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
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} role="presentation" onMouseDown={onClose}>
      <section
        aria-modal="true"
        aria-labelledby="drawer-title"
        className={styles.drawer}
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <Typography id="drawer-title" variant="h2">
            {title}
          </Typography>
          <Button aria-label="Закрыть" onClick={onClose} size="small" variant="ghost">
            <X aria-hidden size={20} />
          </Button>
        </header>
        <div className={styles.content}>{children}</div>
      </section>
    </div>
  );
}
