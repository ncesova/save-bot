import { Composer } from "grammy";
import type { MyContext } from "../types";

const startCommand = new Composer<MyContext>();

startCommand.command("start", async (ctx) => {
  const message = `Привет!
Этот бот умеет сохранять одноразовые медиа и уведомлять об изменении/удалении сообщений.

Для того, чтобы сохранить одноразовое медиа просто ответь на него каким-нибудь сообщением. 
  
Для начала работы добавь бота в бизнес-боты
(Настройки -> Telegram для бизнеса -> Чат-боты -> @${ctx.me.username}).`;
  await ctx.reply(message);
});

export default startCommand;
