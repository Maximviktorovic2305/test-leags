"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { userKeys } from "@/entities/user";
import { getApiErrorMessage } from "@/shared/api";
import { uploadUserAvatar } from "../api/upload-user-avatar";
import { validateAvatarFile } from "../lib/validate-avatar-file";

export function useAvatarUpload() {
  const queryClient = useQueryClient();
  const [validationError, setValidationError] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: uploadUserAvatar,
    onSuccess: async () => {
      setValidationError(null);
      await queryClient.invalidateQueries({ queryKey: userKeys.current });
    },
  });

  const upload = (file?: File) => {
    if (!file) return;
    const error = validateAvatarFile(file);
    setValidationError(error);
    if (!error) mutation.mutate(file);
  };

  return {
    error:
      validationError ??
      (mutation.isError
        ? getApiErrorMessage(mutation.error, "Не удалось загрузить фото")
        : null),
    isPending: mutation.isPending,
    upload,
  };
}
