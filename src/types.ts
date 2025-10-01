import type { FileFlavor } from "@grammyjs/files";
import type { Context, SessionFlavor } from "grammy";

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
};

export type SessionData = {
  history: SavedMessage[];
  settings: Settings;
};

export function initial(): SessionData {
  return {
    history: [],
    settings: {
      sendYoursDeleted: true,
      sendYoursEdited: true,
    },
  };
}

export type MyContext = FileFlavor<Context & SessionFlavor<SessionData>>;
