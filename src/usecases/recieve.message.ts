import { Composer, Context, InputFile } from "grammy";
import type { MyContext, SavedMessage } from "../types";

export const businessMessageHandler = new Composer<MyContext>();

async function sendFileTo(userId: number, fileUrl: string, ctx: MyContext) {
  const file = await ctx.api.getFile(fileUrl);
  const temporaryFilePath = await file.download();
  await ctx.api.sendPhoto(userId, new InputFile(temporaryFilePath));
}

businessMessageHandler.on("business_message", async (ctx) => {
  const savedMessage: SavedMessage = {
    id: ctx.msgId,
    from: ctx.msg.from.username ?? String(ctx.msg.from.id),
    text: ctx.msg.text,
    voice: ctx.msg.voice?.file_id,
    video_note: ctx.msg.video_note?.file_id,
    video: ctx.msg.video?.file_id,
    photo: ctx.msg.photo?.at(-1)?.file_id,
  };
  ctx.session.history.push(savedMessage);

  const conn = await ctx.getBusinessConnection();

  const employee = conn.user;
  if (ctx.from.id !== employee.id) {
    return;
  }

  const reply = ctx.msg.reply_to_message;
  if (!reply || !reply.has_protected_content) {
    return;
  }

  const fromReply = reply.from?.username ?? String(reply.from?.id);

  const photo = reply.photo?.at(-1)?.file_id;
  if (photo) {
    const file = await ctx.api.getFile(photo);
    const tempPath = await file.download();
    ctx.api.sendPhoto(ctx.msg.from.id, new InputFile(tempPath), {
      caption: `Фото от <strong>${fromReply}</strong>`,
      parse_mode: "HTML",
    });
  }

  const video = reply.video?.file_id;
  if (video) {
    ctx.api.sendVideo(ctx.msg.from.id, video, {
      caption: `Видео от <strong>${fromReply}</strong>`,
      parse_mode: "HTML",
    });
  }

  const voice = reply.voice?.file_id;
  if (voice) {
    ctx.api.sendVoice(ctx.msg.from.id, voice, {
      caption: `Аудио от <strong>${fromReply}</strong>`,
      parse_mode: "HTML",
    });
  }

  const video_note = reply.video_note?.file_id;
  if (video_note) {
    const file = await ctx.api.getFile(video_note);
    const tempPath = await file.download();
    ctx.api.sendVideo(ctx.msg.from.id, new InputFile(tempPath), {
      caption: `Кружочек от <strong>${fromReply}</strong>`,
      parse_mode: "HTML",
    });
  }
});
