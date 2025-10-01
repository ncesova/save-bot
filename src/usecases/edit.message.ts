import { Composer, InputFile } from "grammy";
import type { MyContext } from "../types";

export const editMessageHandler = new Composer<MyContext>();

editMessageHandler.on("edited_business_message", async (ctx) => {
  const editedMessage = ctx.update.edited_business_message;
  const oldEditedMessage = ctx.session.history.find(
    (msg) => msg.id === editedMessage.message_id
  );

  const conn = await ctx.getBusinessConnection();
  const employee = conn.user;

  if (oldEditedMessage?.voice) {
    const file = await ctx.api.getFile(oldEditedMessage.voice);
    const temporaryFilePath = await file.download();
    await ctx.api.sendVoice(employee.id, new InputFile(temporaryFilePath), {
      caption: `Оригинальное аудио от <strong>${oldEditedMessage.from}</strong>`,
      parse_mode: "HTML",
    });
  }

  if (oldEditedMessage?.video_note) {
    const file = await ctx.api.getFile(oldEditedMessage.video_note);
    const temporaryFilePath = await file.download();
    await ctx.api.sendVideo(employee.id, new InputFile(temporaryFilePath), {
      caption: `Оригинальный кружок от <strong>${oldEditedMessage.from}</strong>`,
      parse_mode: "HTML",
    });
  }

  if (oldEditedMessage?.video) {
    const file = await ctx.api.getFile(oldEditedMessage.video);
    const temporaryFilePath = await file.download();
    await ctx.api.sendVideo(employee.id, new InputFile(temporaryFilePath), {
      caption: `Оригинальное видео от <strong>${oldEditedMessage.from}</strong>`,
      parse_mode: "HTML",
    });
  }

  if (oldEditedMessage?.photo) {
    const file = await ctx.api.getFile(oldEditedMessage.photo);
    const temporaryFilePath = await file.download();
    await ctx.api.sendPhoto(employee.id, new InputFile(temporaryFilePath), {
      caption: `Оригинальное фото от <strong>${oldEditedMessage.from}</strong>`,
      parse_mode: "HTML",
    });
  }

  const message = `
  <strong>${
    editedMessage.from.username
  }</strong> изменил сообщение: <blockquote expandable>${
    oldEditedMessage?.text ?? "Error: no old edited text found"
  }</blockquote>
  Обновленный текст: <blockquote expandable>${editedMessage.text}</blockquote>
  `;

  await ctx.api.sendMessage(employee.id, message, { parse_mode: "HTML" });
});
