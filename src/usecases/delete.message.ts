import { Composer } from "grammy";
import type { MyContext } from "../types";

export const deleteMessageHandler = new Composer<MyContext>();

deleteMessageHandler.on("deleted_business_messages", async (ctx) => {
  const deletedMessageIds = ctx.update.deleted_business_messages.message_ids;
  const deletedMessages = ctx.session.history.filter((msg) =>
    deletedMessageIds.includes(msg.id)
  );

  const conn = await ctx.getBusinessConnection();
  const employee = conn.user;

  for (const deletedMessage of deletedMessages) {
    if (
      deletedMessage.voice ||
      deletedMessage.video ||
      deletedMessage.video_note ||
      deletedMessage.photo
    ) {
      if (deletedMessage.voice) {
        ctx.api.sendVoice(employee.id, deletedMessage.voice, {
          caption: `Удаленное аудио от <strong>${deletedMessage.from}</strong>`,
          parse_mode: "HTML",
        });
      }

      if (deletedMessage.video) {
        ctx.api.sendVideo(employee.id, deletedMessage.video, {
          caption: `Удаленное видео от <strong>${deletedMessage.from}</strong>`,
          parse_mode: "HTML",
        });
      }

      if (deletedMessage.video_note) {
        ctx.api.sendVideo(employee.id, deletedMessage.video_note, {
          caption: `Удаленный кружочек от <strong>${deletedMessage.from}</strong>`,
          parse_mode: "HTML",
        });
      }

      if (deletedMessage.photo) {
        ctx.api.sendPhoto(employee.id, deletedMessage.photo, {
          caption: `Удаленное фото от <strong>${deletedMessage.from}</strong>`,
          parse_mode: "HTML",
        });
      }
    }

    const message = `
  <strong>${deletedMessage.from}</strong> удалил сообщение:
  <blockquote expandable>${deletedMessage.text}</blockquote>
  `;
    await ctx.api.sendMessage(employee.id, message, { parse_mode: "HTML" });
  }
});
