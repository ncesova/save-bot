import { Composer, InputFile } from "grammy";
import type { MyContext } from "../types";
import { escapeHtml } from "../utils/text";

export const editMessageHandler = new Composer<MyContext>();

editMessageHandler.on("edited_business_message", async (ctx) => {
  const editedMessage = ctx.update.edited_business_message;
  const oldEditedMessage = ctx.session.history.find(
    (msg) => msg.id === editedMessage.message_id
  );

  const conn = await ctx.getBusinessConnection();
  const employee = conn.user;
  const employeeIdentity = employee.username ?? String(employee.id);
  const editorIdentity =
    editedMessage.from?.username ?? String(editedMessage.from?.id ?? "");

  const settings = ctx.db.getSettings(employee.id);

  if (!settings.sendYoursEdited) {
    const isEmployeeMessage =
      oldEditedMessage?.from === employeeIdentity ||
      editorIdentity === employeeIdentity;

    if (isEmployeeMessage) {
      return;
    }
  }

  const silentMode = !settings.notifyOnEdited;

  if (oldEditedMessage?.voice) {
    const file = await ctx.api.getFile(oldEditedMessage.voice);
    const temporaryFilePath = await file.download();
    const sender = escapeHtml(oldEditedMessage.from);
    await ctx.api.sendVoice(employee.id, new InputFile(temporaryFilePath), {
      caption: `Оригинальное аудио от <strong>${sender}</strong>`,
      parse_mode: "HTML",
      disable_notification: silentMode,
    });
  }

  if (oldEditedMessage?.video_note) {
    const file = await ctx.api.getFile(oldEditedMessage.video_note);
    const temporaryFilePath = await file.download();
    const sender = escapeHtml(oldEditedMessage.from);
    await ctx.api.sendVideo(employee.id, new InputFile(temporaryFilePath), {
      caption: `Оригинальный кружок от <strong>${sender}</strong>`,
      parse_mode: "HTML",
      disable_notification: silentMode,
    });
  }

  if (oldEditedMessage?.video) {
    const file = await ctx.api.getFile(oldEditedMessage.video);
    const temporaryFilePath = await file.download();
    const sender = escapeHtml(oldEditedMessage.from);
    await ctx.api.sendVideo(employee.id, new InputFile(temporaryFilePath), {
      caption: `Оригинальное видео от <strong>${sender}</strong>`,
      parse_mode: "HTML",
      disable_notification: silentMode,
    });
  }

  if (oldEditedMessage?.photo) {
    const file = await ctx.api.getFile(oldEditedMessage.photo);
    const temporaryFilePath = await file.download();
    const sender = escapeHtml(oldEditedMessage.from);
    await ctx.api.sendPhoto(employee.id, new InputFile(temporaryFilePath), {
      caption: `Оригинальное фото от <strong>${sender}</strong>`,
      parse_mode: "HTML",
      disable_notification: silentMode,
    });
  }

  const editorName = escapeHtml(
    editedMessage.from?.username ??
      String(editedMessage.from?.id ?? "Неизвестно")
  );
  const originalText = oldEditedMessage?.text
    ? `<blockquote expandable>${escapeHtml(oldEditedMessage.text)}</blockquote>`
    : `<blockquote expandable><i>Оригинальный текст не найден</i></blockquote>`;
  const updatedText = editedMessage.text
    ? `<blockquote expandable>${escapeHtml(editedMessage.text)}</blockquote>`
    : `<blockquote expandable><i>Обновленный текст отсутствует</i></blockquote>`;

  const message = `<strong>${editorName}</strong> изменил сообщение:
${originalText}
Обновленный текст:
${updatedText}`;

  await ctx.api.sendMessage(employee.id, message, {
    parse_mode: "HTML",
    disable_notification: silentMode,
  });
});
