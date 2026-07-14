import { apiFetch } from "@/shared/api";

type AvatarUploadResult = {
  avatarUpdatedAt: string;
  hasAvatar: true;
};

export async function uploadUserAvatar(
  avatar: File,
): Promise<AvatarUploadResult> {
  const formData = new FormData();
  formData.set("avatar", avatar);
  const response = await apiFetch("/profile/avatar", {
    method: "PUT",
    body: formData,
  });
  return response.json() as Promise<AvatarUploadResult>;
}
