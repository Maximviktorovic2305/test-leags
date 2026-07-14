"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useSession, type Gender } from "@/entities/user";
import { getApiErrorMessage } from "@/shared/api";
import { useDebounce } from "@/shared/model";
import { login } from "../api/login-api";

const NICKNAME_TOO_SHORT_ERROR = "Введите минимум 2 символа";

export function useLoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { startSession } = useSession();
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState<Gender>("MALE");
  const [validationError, setValidationError] = useState("");
  const debouncedNickname = useDebounce(nickname);
  const debouncedValidationError =
    debouncedNickname.trim().length === 1 ? NICKNAME_TOO_SHORT_ERROR : "";

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: ({ accessToken }) => {
      queryClient.clear();
      startSession(accessToken);
      router.push("/tracks");
    },
  });

  const changeNickname = (value: string) => {
    setNickname(value);
    setValidationError("");
    mutation.reset();
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedNickname = nickname.trim();
    if (trimmedNickname.length < 2) {
      setValidationError(NICKNAME_TOO_SHORT_ERROR);
      return;
    }

    setValidationError("");
    mutation.mutate({ nickname: trimmedNickname, gender });
  };

  return {
    error:
      validationError ||
      debouncedValidationError ||
      (mutation.error
        ? getApiErrorMessage(mutation.error, "Не удалось войти")
        : undefined),
    gender,
    isPending: mutation.isPending,
    nickname,
    setGender,
    setNickname: changeNickname,
    submit,
  };
}
