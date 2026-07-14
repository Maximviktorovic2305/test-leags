# Climb League

Fullstack-приложение для прохождения трасс, рейтинга и перехода между лигами. Репозиторий: [Maximviktorovic2305/test-leags](https://github.com/Maximviktorovic2305/test-leags).

> Все `.env.development` и `.env.production` намеренно добавлены в репозиторий, чтобы тестовое задание запускалось без ручной настройки. В них находятся только публичные тестовые значения (`postgres/admin` и тестовые JWT-секреты). Для реального production их обязательно нужно заменить и исключить из Git.

## Первый запуск на новом компьютере

Склонируйте репозиторий и перейдите в его корень:

```powershell
git clone https://github.com/Maximviktorovic2305/test-leags.git
cd test-leags
```

### В Docker

Нужен установленный и запущенный Docker Desktop. Выполните:

```powershell
docker compose --env-file .env.development -f compose.dev.yml up --build
```

PostgreSQL и Redis будут созданы автоматически. Перед запуском backend автоматически применятся миграции Prisma и начальные данные из seed.

### Без Docker

Нужны Node.js 24+, pnpm 11+, PostgreSQL на `localhost:5432` с базой `leags` и Redis на `localhost:6379`.

Установите зависимости, примените миграции и добавьте начальные данные:

```powershell
pnpm --dir backend install
pnpm --dir frontend install
pnpm --dir backend prisma:migrate:deploy
pnpm --dir backend prisma:seed
```

После этого запустите backend и frontend в двух отдельных терминалах из корня репозитория:

```powershell
pnpm --dir backend dev
```

```powershell
pnpm --dir frontend dev
```

Frontend: `http://localhost:3079`. Backend: `http://localhost:3078/api`. Health-check: `http://localhost:3078/api/health`.

## Стек и архитектура

- Frontend: Next.js 16, React 19, TypeScript, TanStack Query 5, CSS Modules, FSD (`app → screens → widgets → features → entities → shared`).
- Backend: NestJS 11, Prisma 7, PostgreSQL 18, Redis, предметные модули `auth`, `tracks`, `league`.
- Infrastructure: отдельные multi-stage Docker-сборки и Compose-профили development/production.

Prisma — единственная точка доступа к бизнес-данным. Backend не кэширует лидерборд: он всегда читается из PostgreSQL. Клиентский кэш находится в TanStack Query; после прохождения трассы инвалидируются `tracks`, `league`, `user`, после оценки — `tracks`, после пересчёта — `league`, `user`. При login старый Query Cache очищается, при logout Query Cache и Mutation Cache полностью очищаются до и после запроса выхода.

Все backend-ошибки проходят через глобальный exception filter: клиент получает безопасное русское сообщение, стабильный `code`, HTTP-статус, путь и время ошибки. Глобальный rate limiter использует Redis как распределённое хранилище счётчиков и настраивается через `RATE_LIMIT_TTL_MS`, `RATE_LIMIT_MAX`, `RATE_LIMIT_BLOCK_MS`; бизнес-данные в Redis не кэшируются.

Авторизация без пароля принимает никнейм и пол. Access JWT передаётся в Bearer-заголовке, refresh JWT хранится в `httpOnly` cookie. Refresh ротируется атомарно, текущая сессия и окно идемпотентного повтора хранятся в Redis — по схеме проекта Banya.

## Бизнес-логика

- Новый пользователь создаётся в `GREEN` с 0 очков; данные сохраняются в PostgreSQL.
- Трассу можно пройти один раз. Первая попытка даёт 100% очков, повторная — `round(points × 0.7)`.
- Seed содержит 6 трасс и пользователей обеих лиг. Трасса на 160 очков поднимает нового пользователя в топ‑3.
- Оценка 1–5 доступна после прохождения и связана с пользователем и трассой.
- `POST /api/leagues/recalculate` в serializable-транзакции переводит топ‑3 `GREEN` в `BLUE` и записывает историю в `league_changes`.

## API

| Метод | Путь | Назначение |
|---|---|---|
| `POST` | `/api/auth/login` | Login, access JWT и refresh cookie |
| `POST` | `/api/auth/refresh` | Ротация refresh и новый access JWT |
| `POST` | `/api/auth/logout` | Отзыв refresh-сессии |
| `GET` | `/api/auth/me` | Текущий пользователь |
| `GET` | `/api/tracks` | Список трасс с результатом и оценкой |
| `POST` | `/api/tracks/:id/completions` | Прохождение и начисление очков |
| `PUT` | `/api/tracks/:id/rating` | Оценка трассы |
| `GET` | `/api/leagues/current` | Актуальный лидерборд |
| `POST` | `/api/leagues/recalculate` | Ручной пересчёт лиг |

## Проверки

```powershell
pnpm --dir frontend typecheck
pnpm --dir frontend lint
pnpm --dir frontend lint:fsd
pnpm --dir frontend build
pnpm --dir backend typecheck
pnpm --dir backend lint
pnpm --dir backend test -- --runInBand
pnpm --dir backend test:e2e -- --runInBand
pnpm --dir backend build
```

## Автоматический деплой

Push в ветку `main` запускает `.github/workflows/deploy.yml`: GitHub Actions
проверяет frontend и backend, после чего передаёт исходники на сервер и атомарно
переключает текущий release. Приложение запускается от системного пользователя
`max` через PM2; миграции и идемпотентный seed выполняются перед перезапуском.

Workflow использует repository secrets `SSH_HOST`, `SSH_USERNAME`,
`SSH_PRIVATE_KEY` и `SSH_KNOWN_HOSTS`. Production-переменные приложения хранятся
только на сервере в `/home/max/leags/shared/.env.production` с правами `0600` и
не передаются в GitHub Actions.
