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

## Модели данных Prisma

Схема находится в [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma). В ней разделены основные сущности (`User`, `Track`), факты взаимодействия пользователя с трассой (`TrackCompletion`, `TrackRating`) и история изменения лиги (`LeagueChange`). Такое разделение не дублирует данные трасс и пользователей и позволяет хранить атрибуты самих связей: результат прохождения, начисленные очки, оценку и место при переходе в другую лигу.

### `User`

Пользователь и его текущее состояние в соревновании:

- `nickname` уникален, потому что в приложении он используется для входа без пароля;
- `gender` ограничен enum `Gender` (`MALE`, `FEMALE`);
- `league` хранит текущую лигу из enum `League` (`GREEN`, `BLUE`) и по умолчанию равна `GREEN`;
- `points` хранит уже рассчитанную сумму очков. Это намеренная денормализация: лидерборду не нужно при каждом запросе суммировать все прохождения;
- `avatarData`, `avatarMimeType` и `avatarUpdatedAt` образуют один необязательный набор данных аватара. Сам файл хранится в PostgreSQL, поэтому профиль не зависит от отдельного файлового хранилища;
- `completions`, `ratings` и `leagueChanges` — обратные стороны связей один-ко-многим.

Составной индекс `@@index([league, points])` нужен для частого запроса лидерборда: сначала пользователи отбираются по лиге, затем сортируются по очкам. `createdAt` и `id` используются сервисом как стабильные дополнительные критерии при равенстве очков.

### `Track`


Справочник трасс:

- `slug` — уникальный стабильный текстовый идентификатор;
- `order` — уникальная позиция трассы в интерфейсе;
- `difficulty` принимает только значения enum `TrackDifficulty` (`EASY`, `MEDIUM`, `HARD`);
- `points` — базовое количество очков до применения правила первой или повторной попытки;
- `completions` и `ratings` дают доступ ко всем прохождениям и оценкам трассы.

Трасса вынесена в отдельную модель, потому что её описание, сложность и базовые очки общие для всех пользователей и не должны копироваться в каждое прохождение.

### `TrackCompletion`

Связующая модель между `User` и `Track`: у пользователя может быть много пройденных трасс, а одну трассу могут пройти многие пользователи. Обычной неявной many-to-many связи здесь недостаточно, потому что у прохождения есть собственные данные:

- `result` (`FIRST_TRY` или `RETRY`) фиксирует тип результата;
- `awardedPoints` хранит фактически начисленное значение с учётом коэффициента. Это снимок на момент прохождения: последующее изменение базовых `Track.points` не переписывает историю;
- `completedAt` хранит время прохождения.

Ограничение `@@unique([userId, trackId])` гарантирует на уровне базы правило «одну трассу можно пройти один раз» и защищает от параллельных повторных запросов. Индекс `@@index([userId, completedAt])` ускоряет получение истории конкретного пользователя по времени.

### `TrackRating`

Вторая связующая модель между `User` и `Track`, отделённая от прохождения. Оценку можно менять независимо через `upsert`, поэтому у неё есть собственные `createdAt` и `updatedAt`. Ограничение `@@unique([userId, trackId])` допускает только одну актуальную оценку пользователя для одной трассы.

Диапазон `value` от 1 до 5 и требование сначала пройти трассу проверяются backend-сервисом. Связь с `TrackCompletion` намеренно не создаётся: принадлежность оценки определяется той же парой `userId + trackId`, а жизненный цикл оценки остаётся независимым от записи прохождения.

### `LeagueChange`

Журнал переходов пользователя между лигами. `User.league` отвечает на вопрос «где пользователь сейчас», а `LeagueChange` сохраняет, откуда (`fromLeague`) и куда (`toLeague`) он перешёл, какое место (`rank`) занял и когда (`changedAt`) произошёл пересчёт. История вынесена отдельно, потому что у одного пользователя со временем может быть несколько переходов, а перезапись только `User.league` потеряла бы эти события.

Индекс `@@index([userId, changedAt])` предназначен для выборки хронологии переходов одного пользователя.

### Целостность связей

Все дочерние модели содержат явные внешние ключи `userId` и, где требуется, `trackId`. Для них указан `onDelete: Cascade`: удаление пользователя очищает его прохождения, оценки и историю лиг, а удаление трассы — связанные с ней прохождения и оценки. Это не оставляет записей, ссылающихся на несуществующие сущности.

Идентификаторы создаются через `cuid()`, даты создания — через `now()`, а поля `updatedAt` Prisma обновляет автоматически. `@@map(...)` сохраняет удобные имена моделей в TypeScript и одновременно задаёт таблицам PostgreSQL имена в `snake_case` (`users`, `tracks`, `track_completions`, `track_ratings`, `league_changes`).

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
