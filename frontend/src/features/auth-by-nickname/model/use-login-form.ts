"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useSession, userKeys, type Gender } from "@/entities/user";
import { login } from "../api/login-api";

export function useLoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { startSession } = useSession();
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState<Gender>("MALE");
  const [validationError, setValidationError] = useState("");

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: ({ accessToken, user }) => {
      queryClient.clear();
      startSession(accessToken);
      queryClient.setQueryData(userKeys.current, user);
      router.push("/tracks");
    },
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedNickname = nickname.trim();
    if (trimmedNickname.length < 2) {
      setValidationError("Введите минимум 2 символа");
      return;
    }

    setValidationError("");
    mutation.mutate({ nickname: trimmedNickname, gender });
  };

  return {
    error: validationError || mutation.error?.message,
    gender,
    isPending: mutation.isPending,
    nickname,
    setGender,
    setNickname,
    submit,
  };
}
