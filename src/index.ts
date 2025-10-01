import { Bot, session } from "grammy";
import { hydrateFiles } from "@grammyjs/files";
import "dotenv/config";
import { editMessageHandler } from "./usecases/edit.message";
import { deleteMessageHandler } from "./usecases/delete.message";
import { businessMessageHandler } from "./usecases/recieve.message";
import { initial, type MyContext } from "./types";
import startCommand from "./usecases/start.command";
import settingsCommand from "./usecases/settings.command";
import { Database } from "./database";

const bot = new Bot<MyContext>(process.env.TELEGRAM_API_KEY ?? "");
const dbPath = process.env.DB_PATH || "data/savebot.sqlite";
const db = new Database(dbPath);

bot.api.config.use(hydrateFiles(bot.token));

bot.use((ctx, next) => {
  ctx.db = db;
  return next();
});

bot.use(session({ initial }));
bot.use(startCommand);
bot.use(settingsCommand);

bot.use(editMessageHandler);
bot.use(deleteMessageHandler);
bot.use(businessMessageHandler);

process.on("SIGINT", () => {
  console.log("Shutting down gracefully...");
  db.close();
  bot.stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("Shutting down gracefully...");
  db.close();
  bot.stop();
  process.exit(0);
});

bot.start();
