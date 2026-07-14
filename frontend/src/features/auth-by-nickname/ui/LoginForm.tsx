"use client";

import { ArrowRight, UserRound } from "lucide-react";
import { Button, Input, Typography } from "@/shared/ui";
import { genderOptions } from "../data/gender-options";
import { useLoginForm } from "../model/use-login-form";
import styles from "./styles.module.css";

export function LoginForm() {
  const form = useLoginForm();

  return (
    <form className={styles.form} onSubmit={form.submit}>
      <div className={styles.heading}>
        <span className={styles.icon}>
          <UserRound aria-hidden size={22} />
        </span>
        <div>
          <Typography variant="h2">Войти в сезон</Typography>
          <Typography tone="muted">Без пароля — только ваш никнейм</Typography>
        </div>
      </div>

      <Input
        autoComplete="nickname"
        error={form.error}
        id="nickname"
        label="Никнейм"
        maxLength={24}
        onChange={(event) => form.setNickname(event.target.value)}
        placeholder="Например, Скала"
        value={form.nickname}
      />

      <fieldset className={styles.fieldset}>
        <Typography as="legend" variant="label">
          Пол
        </Typography>
        <div className={styles.genderGrid}>
          {genderOptions.map((option) => (
            <label className={styles.genderOption} key={option.value}>
              <input
                checked={form.gender === option.value}
                className={styles.radio}
                name="gender"
                onChange={() => form.setGender(option.value)}
                type="radio"
                value={option.value}
              />
              <span className={styles.genderContent}>
                <Typography variant="label">{option.label}</Typography>
                <Typography variant="small" tone="muted">
                  {option.description}
                </Typography>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <Button isLoading={form.isPending} size="large" type="submit">
        Войти в Зелёную лигу
        <ArrowRight aria-hidden size={18} />
      </Button>
      <Typography variant="small" tone="muted" className={styles.note}>
        Если никнейм уже существует, откроется сохранённый профиль.
      </Typography>
    </form>
  );
}
