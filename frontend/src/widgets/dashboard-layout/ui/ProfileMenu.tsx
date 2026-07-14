"use client";

import { FlagTriangleRight, Sparkles } from "lucide-react";
import { ProfileAvatar, type User } from "@/entities/user";
import { AvatarUpload } from "@/features/upload-user-avatar";
import { Button, Typography } from "@/shared/ui";
import { useProfileMenu } from "../model/use-profile-menu";
import styles from "./profile-menu.module.css";

type ProfileMenuProps = {
  user: User;
};

export function ProfileMenu({ user }: ProfileMenuProps) {
  const { isOpen, menuId, rootRef, toggle, triggerRef } = useProfileMenu();

  return (
    <div className={styles.root} ref={rootRef}>
      <Button
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="Открыть профиль"
        className={styles.trigger}
        onClick={toggle}
        ref={triggerRef}
        size="small"
        title="Профиль"
        variant="ghost"
      >
        <ProfileAvatar user={user} />
      </Button>

      <div
        aria-hidden={!isOpen}
        aria-label="Профиль пользователя"
        className={`${styles.menu} ${isOpen ? styles.open : ""}`}
        id={menuId}
        inert={!isOpen}
        role="dialog"
      >
        <div className={styles.identity}>
          <ProfileAvatar size="large" user={user} />
          <div className={styles.identityText}>
            <Typography as="h2" variant="h3">
              {user.nickname}
            </Typography>
            <Typography variant="caption" tone="muted">
              Участник Climb League
            </Typography>
          </div>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <Sparkles aria-hidden size={18} />
            <div>
              <Typography as="strong" variant="h3">
                {user.points}
              </Typography>
              <Typography variant="caption" tone="muted">
                очков
              </Typography>
            </div>
          </div>
          <div className={styles.stat}>
            <FlagTriangleRight aria-hidden size={18} />
            <div>
              <Typography as="strong" variant="h3">
                {user.completedTracks}
              </Typography>
              <Typography variant="caption" tone="muted">
                трасс пройдено
              </Typography>
            </div>
          </div>
        </div>

        <AvatarUpload />
      </div>
    </div>
  );
}
