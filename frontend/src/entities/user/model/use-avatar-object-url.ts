"use client";

import { useEffect, useMemo } from "react";
import { useUserAvatar } from "./user-queries";

export function useAvatarObjectUrl(
  version: string | null,
  enabled: boolean,
) {
  const avatarQuery = useUserAvatar(version, enabled);
  const objectUrl = useMemo(
    () => (avatarQuery.data ? URL.createObjectURL(avatarQuery.data) : null),
    [avatarQuery.data],
  );

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  return { objectUrl, isLoading: avatarQuery.isLoading };
}
