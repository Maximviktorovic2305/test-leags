"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/shared/ui";
import styles from "./styles.module.css";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      aria-label="Сменить цветовую тему"
      className={styles.toggle}
      onClick={toggleTheme}
      size="small"
      title="Сменить тему"
      variant="ghost"
    >
      <span aria-hidden className={styles.icon}>
        <Sun className={styles.sun} size={18} />
        <Moon className={styles.moon} size={18} />
      </span>
    </Button>
  );
}
