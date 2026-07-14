"use client";

import { useState } from "react";
import { useTracks } from "@/entities/track";
import { useSession } from "@/entities/user";

export function useTracksList() {
  const { accessToken } = useSession();
  const tracksQuery = useTracks(Boolean(accessToken));
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const selectedTrack =
    tracksQuery.data?.find((track) => track.id === selectedTrackId) ?? null;

  return {
    closeTrack: () => setSelectedTrackId(null),
    openTrack: setSelectedTrackId,
    selectedTrack,
    tracksQuery,
  };
}
