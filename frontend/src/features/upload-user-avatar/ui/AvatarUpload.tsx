"use client";

import { Camera, LoaderCircle } from "lucide-react";
import { Typography } from "@/shared/ui";
import {
  AVATAR_ACCEPT,
  AVATAR_MAX_SIZE_LABEL,
} from "../data/avatar-upload-rules";
import { useAvatarUpload } from "../model/use-avatar-upload";
import styles from "./styles.module.css";

export function AvatarUpload() {
  const { error, isPending, upload } = useAvatarUpload();

  return (
    <div className={styles.root}>
      <label className={styles.uploadButton}>
        <input
          accept={AVATAR_ACCEPT}
          className={styles.input}
          disabled={isPending}
          onChange={(event) => {
            upload(event.target.files?.[0]);
            event.target.value = "";
          }}
          type="file"
        />
        {isPending ? (
          <LoaderCircle aria-hidden className={styles.spinner} size={16} />
        ) : (
          <Camera aria-hidden size={16} />
        )}
        <Typography as="span" variant="label">
          {isPending ? "Загрузка…" : "Загрузить фото"}
        </Typography>
      </label>
      <Typography variant="micro" tone={error ? "danger" : "muted"}>
        {error ?? `PNG/JPEG/WebP · до ${AVATAR_MAX_SIZE_LABEL}`}
      </Typography>
    </div>
  );
}
