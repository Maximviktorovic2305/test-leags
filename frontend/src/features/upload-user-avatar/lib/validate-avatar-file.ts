import {
  allowedAvatarTypes,
  AVATAR_MAX_SIZE_BYTES,
  AVATAR_MAX_SIZE_LABEL,
} from "../data/avatar-upload-rules";

export function validateAvatarFile(file: File): string | null {
  if (!allowedAvatarTypes.has(file.type)) {
    return "Выберите изображение PNG, JPEG или WebP";
  }
  if (file.size > AVATAR_MAX_SIZE_BYTES) {
    return `Размер изображения не должен превышать ${AVATAR_MAX_SIZE_LABEL}`;
  }
  return null;
}
