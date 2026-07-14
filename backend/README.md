# Climb League API

NestJS API с Prisma/PostgreSQL и JWT access/refresh-сессиями в Redis. Бизнес-данные не кэшируются на backend. Полная архитектура, бизнес-логика, env и команды запуска описаны в [общей инструкции](../README.md).

Быстрый development-запуск:

```powershell
Copy-Item .env.example .env.development
pnpm install
pnpm prisma:migrate:deploy
pnpm prisma:seed
pnpm start:dev
```

API запускается на `http://localhost:3078/api`.
