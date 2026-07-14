import type { Gender } from "@/entities/user";

export const genderOptions: Array<{
  value: Gender;
  label: string;
  description: string;
}> = [
  { value: "MALE", label: "Мужчина", description: "Он / его" },
  { value: "FEMALE", label: "Женщина", description: "Она / её" },
];
