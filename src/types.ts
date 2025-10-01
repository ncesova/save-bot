import type { FileFlavor } from "@grammyjs/files";
import type { Context, SessionFlavor } from "grammy";
import type { Database } from "./database";

export type SavedMessage = {
  id: number;
  from: string;
  text: string | undefined;
  voice: string | undefined;
  video_note: string | undefined;
  video: string | undefined;
  photo: string | undefined;
};

export type Settings = {
  sendYoursEdited: boolean;
  sendYoursDeleted: boolean;
  notifyOnDeleted: boolean;
  notifyOnEdited: boolean;
};

export type SessionData = {
  history: SavedMessage[];
};

export function initial(): SessionData {
  return {
    history: [],
  };
}

export type MyContext = FileFlavor<Context & SessionFlavor<SessionData>> & {
  db: Database;
};
