import type { MyContext, Settings } from "../types";
import { Composer, InlineKeyboard } from "grammy";

const settingsCommand = new Composer<MyContext>();

const SETTINGS_PREFIX = "settings:toggle:";

settingsCommand.command("settings", async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const currentSettings = ctx.db.getSettings(userId);

  const formattedSettings = getFormattedSettings(currentSettings);

  await ctx.reply(formattedSettings, {
    parse_mode: "HTML",
    reply_markup: getSettingsKeyboard(currentSettings),
  });
});

settingsCommand.callbackQuery(
  new RegExp(
    `^${SETTINGS_PREFIX}(sendYoursDeleted|sendYoursEdited|notifyOnDeleted|notifyOnEdited)$`
  ),
  async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const settingKey = ctx.match[1] as keyof Settings;

    const { newValue, settings } = ctx.db.toggleSetting(userId, settingKey);

    await ctx.answerCallbackQuery({
      text: getToggleResponse(settingKey, newValue),
      show_alert: false,
    });

    const updatedMessage = getFormattedSettings(settings);

    try {
      await ctx.editMessageText(updatedMessage, {
        parse_mode: "HTML",
        reply_markup: getSettingsKeyboard(settings),
      });
    } catch {
      await ctx.reply(updatedMessage, {
        parse_mode: "HTML",
        reply_markup: getSettingsKeyboard(settings),
      });
    }
  }
);

function getFormattedSettings(settings: Settings) {
  const message = `
<b>Настройки уведомлений</b>

<b>Сохранение сообщений:</b>
• Собственные удаленные сообщения: ${
    settings.sendYoursDeleted ? "✅ Включено" : "❌ Выключено"
  }
• Собственные измененные сообщения: ${
    settings.sendYoursEdited ? "✅ Включено" : "❌ Выключено"
  }

<b>Уведомления со звуком:</b>
• При удалении сообщений: ${settings.notifyOnDeleted ? "🔔 Вкл" : "🔕 Выкл"}
• При изменении сообщений: ${settings.notifyOnEdited ? "🔔 Вкл" : "🔕 Выкл"}

Нажми на кнопку ниже, чтобы переключить нужный пункт.`;

  return message;
}

function getSettingsKeyboard(settings: Settings) {
  return new InlineKeyboard()
    .text(
      `${settings.sendYoursDeleted ? "✅" : "❌"} Собственные удаленные`,
      `${SETTINGS_PREFIX}sendYoursDeleted`
    )
    .row()
    .text(
      `${settings.sendYoursEdited ? "✅" : "❌"} Собственные измененные`,
      `${SETTINGS_PREFIX}sendYoursEdited`
    )
    .row()
    .text(
      `${settings.notifyOnDeleted ? "🔔" : "🔕"} Уведомления: удаление`,
      `${SETTINGS_PREFIX}notifyOnDeleted`
    )
    .row()
    .text(
      `${settings.notifyOnEdited ? "🔔" : "🔕"} Уведомления: изменение`,
      `${SETTINGS_PREFIX}notifyOnEdited`
    );
}

function getToggleResponse(key: keyof Settings, newValue: boolean) {
  const status = newValue ? "включено" : "выключено";

  if (key === "sendYoursDeleted") {
    return `Сохранение собственных удаленных сообщений ${status}.`;
  }

  if (key === "sendYoursEdited") {
    return `Сохранение собственных измененных сообщений ${status}.`;
  }

  if (key === "notifyOnDeleted") {
    return `Уведомления при удалении ${status}.`;
  }

  if (key === "notifyOnEdited") {
    return `Уведомления при изменении ${status}.`;
  }

  return `Настройка обновлена.`;
}

export default settingsCommand;
