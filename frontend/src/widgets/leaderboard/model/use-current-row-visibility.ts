"use client";

import { useEffect, useState } from "react";

const SCROLL_CONTAINER_ID = "leaderboard-scroll-container";

export function useCurrentRowVisibility(entryCount: number) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const container = document.getElementById(SCROLL_CONTAINER_ID);
    const row = container?.querySelector<HTMLElement>("[data-current-user='true']");
    if (!container || !row) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { root: container, threshold: 0.7 },
    );
    observer.observe(row);
    return () => observer.disconnect();
  }, [entryCount]);

  return { containerId: SCROLL_CONTAINER_ID, isVisible };
}
