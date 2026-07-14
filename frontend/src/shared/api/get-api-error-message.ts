import { ApiError } from "./api-client";

const englishMessageTranslations: Array<[RegExp, string]> = [
  [/failed to fetch|fetch failed|networkerror/i, "Сервер недоступен или нет подключения к сети"],
  [/unauthorized|invalid.*token|jwt expired/i, "Сессия истекла или требуется повторный вход"],
  [/forbidden/i, "Недостаточно прав для выполнения действия"],
  [/not found|does not exist/i, "Запрошенные данные не найдены"],
  [/internal server error/i, "Внутренняя ошибка сервера"],
];

const statusReasons: Record<number, string> = {
  400: "Сервер отклонил переданные данные",
  401: "Сессия истекла или требуется повторный вход",
  403: "Недостаточно прав для выполнения действия",
  404: "Запрошенные данные не найдены",
  409: "Данные конфликтуют с уже сохранённой записью",
  429: "Слишком много запросов, попробуйте немного позже",
  500: "Внутренняя ошибка сервера",
  502: "Сервер временно недоступен",
  503: "Сервис временно недоступен",
  504: "Сервер не ответил вовремя",
};

function trimPeriod(value: string): string {
  return value.trim().replace(/[.!?]+$/u, "");
}

function translateReason(message: string, status?: number): string {
  const normalizedMessage = trimPeriod(message);
  if (/[А-яЁё]/u.test(normalizedMessage)) return normalizedMessage;

  const translation = englishMessageTranslations.find(([pattern]) =>
    pattern.test(normalizedMessage),
  );
  return translation?.[1] ?? statusReasons[status ?? 0] ?? "Неизвестная ошибка сервера";
}

export function getApiErrorMessage(error: unknown, action: string): string {
  let reason = "Неизвестная ошибка сервера";

  if (error instanceof ApiError) {
    reason = translateReason(error.message, error.status);
  } else if (error instanceof Error) {
    reason = translateReason(error.message);
  }

  return `${trimPeriod(action)}. Причина: ${trimPeriod(reason)}.`;
}
