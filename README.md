# save-bot

## Возможности:

- Оповещение в лс об удалении сообщения вместе с отправкой оригинала
- Оповещение в лс об изменении сообщения вместе с отправкой оригинала
- Скачивание одноразовых медиа (просто ответь на сообщение с медиа)

## Использование

Использование бота как сервис в docker compose:

```yaml
services:
  tgsavebot:
    container_name: tg-save-bot
    image: ghcr.io/ncesova/save-bot:latest
    restart: unless-stopped
    environment:
      - TELEGRAM_API_KEY=${TELEGRAM_API_KEY}

```

Запуск локально:

```bash
bun install # установка зависимостей

bun run start
```
