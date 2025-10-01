import type { MyContext, Settings } from "../types";
import { Composer } from "grammy";

const settingsCommand = new Composer<MyContext>();

settingsCommand.command("settings", async (ctx) => {
  const currentSettings = ctx.session.settings;

  const formattedSettings = getFormattedSettings(currentSettings);

  await ctx.reply(formattedSettings);
});

function getFormattedSettings(settings: Settings) {
  const message = `
Сохранять собственные удаленные сообщения: ${
    settings.sendYoursDeleted ? "✅" : "❌"
  }
Сохранять собственные измененные сообщения: ${
    settings.sendYoursEdited ? "✅" : "❌"
  }
    `;

  return message;
}
