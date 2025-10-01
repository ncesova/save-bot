import { Composer } from "grammy";
import type { MyContext } from "../types";
import { escapeHtml } from "../utils/text";

export const deleteMessageHandler = new Composer<MyContext>();

deleteMessageHandler.on("deleted_business_messages", async (ctx) => {
  const deletedMessageIds = ctx.update.deleted_business_messages.message_ids;
  const deletedMessages = ctx.session.history.filter((msg) =>
    deletedMessageIds.includes(msg.id)
  );

  const conn = await ctx.getBusinessConnection();
  const employee = conn.user;
  const employeeIdentity = employee.username ?? String(employee.id);

  const settings = ctx.db.getSettings(employee.id);

  for (const deletedMessage of deletedMessages) {
    const isEmployeeMessage = deletedMessage.from === employeeIdentity;

    if (isEmployeeMessage && !settings.sendYoursDeleted) {
      continue;
    }

    const sender = escapeHtml(deletedMessage.from);
    const silentMode = !settings.notifyOnDeleted;

    if (
      deletedMessage.voice ||
      deletedMessage.video ||
      deletedMessage.video_note ||
      deletedMessage.photo
    ) {
      if (deletedMessage.voice) {
        await ctx.api.sendVoice(employee.id, deletedMessage.voice, {
          caption: `Удаленное аудио от <strong>${sender}</strong>`,
          parse_mode: "HTML",
          disable_notification: silentMode,
        });
      }

      if (deletedMessage.video) {
        await ctx.api.sendVideo(employee.id, deletedMessage.video, {
          caption: `Удаленное видео от <strong>${sender}</strong>`,
          parse_mode: "HTML",
          disable_notification: silentMode,
        });
      }

      if (deletedMessage.video_note) {
        await ctx.api.sendVideo(employee.id, deletedMessage.video_note, {
          caption: `Удаленный кружочек от <strong>${sender}</strong>`,
          parse_mode: "HTML",
          disable_notification: silentMode,
        });
      }

      if (deletedMessage.photo) {
        await ctx.api.sendPhoto(employee.id, deletedMessage.photo, {
          caption: `Удаленное фото от <strong>${sender}</strong>`,
          parse_mode: "HTML",
          disable_notification: silentMode,
        });
      }
    }

    const textContent = deletedMessage.text
      ? `<blockquote expandable>${escapeHtml(deletedMessage.text)}</blockquote>`
      : `<blockquote expandable><i>Без текста</i></blockquote>`;

    const message = `<strong>${sender}</strong> удалил сообщение:
${textContent}`;
    await ctx.api.sendMessage(employee.id, message, {
      parse_mode: "HTML",
      disable_notification: silentMode,
    });
  }
});
