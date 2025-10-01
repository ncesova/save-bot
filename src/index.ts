import { Bot, session } from "grammy";
import { hydrateFiles } from "@grammyjs/files";
import "dotenv/config";
import { editMessageHandler } from "./usecases/edit.message";
import { deleteMessageHandler } from "./usecases/delete.message";
import { businessMessageHandler } from "./usecases/recieve.message";
import { initial, type MyContext } from "./types";
import startCommand from "./usecases/start.command";

const bot = new Bot<MyContext>(process.env.TELEGRAM_API_KEY ?? "");

bot.api.config.use(hydrateFiles(bot.token));
bot.use(session({ initial }));
bot.use(startCommand);

bot.use(editMessageHandler);
bot.use(deleteMessageHandler);
bot.use(businessMessageHandler);

bot.start();
