import { Database as BunDatabase } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { Settings } from "./types";

export class Database {
  private db: BunDatabase;

  constructor(filename: string = "savebot.sqlite") {
    const dir = dirname(filename);
    if (dir && dir !== ".") {
      mkdirSync(dir, { recursive: true });
    }

    this.db = new BunDatabase(filename, { create: true });
    this.init();
  }

  private init() {
    this.db.exec("PRAGMA journal_mode = WAL;");

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        user_id INTEGER PRIMARY KEY,
        send_yours_deleted INTEGER NOT NULL DEFAULT 1,
        send_yours_edited INTEGER NOT NULL DEFAULT 1,
        notify_on_deleted INTEGER NOT NULL DEFAULT 1,
        notify_on_edited INTEGER NOT NULL DEFAULT 1
      );
    `);
  }

  getSettings(userId: number): Settings {
    const query = this.db.query<Settings, { $user_id: number }>(`
      SELECT 
        send_yours_deleted as sendYoursDeleted,
        send_yours_edited as sendYoursEdited,
        notify_on_deleted as notifyOnDeleted,
        notify_on_edited as notifyOnEdited
      FROM settings 
      WHERE user_id = $user_id
    `);

    const result = query.get({ $user_id: userId });

    if (!result) {
      const defaults = this.getDefaultSettings();
      this.db
        .query(
          `
        INSERT INTO settings (user_id, send_yours_deleted, send_yours_edited, notify_on_deleted, notify_on_edited)
        VALUES ($user_id, $send_yours_deleted, $send_yours_edited, $notify_on_deleted, $notify_on_edited)
      `
        )
        .run({
          $user_id: userId,
          $send_yours_deleted: defaults.sendYoursDeleted ? 1 : 0,
          $send_yours_edited: defaults.sendYoursEdited ? 1 : 0,
          $notify_on_deleted: defaults.notifyOnDeleted ? 1 : 0,
          $notify_on_edited: defaults.notifyOnEdited ? 1 : 0,
        });
      return defaults;
    }

    return {
      sendYoursDeleted: Boolean(result.sendYoursDeleted),
      sendYoursEdited: Boolean(result.sendYoursEdited),
      notifyOnDeleted: Boolean(result.notifyOnDeleted),
      notifyOnEdited: Boolean(result.notifyOnEdited),
    };
  }

  updateSettings(userId: number, updates: Partial<Settings>): Settings {
    const current = this.getSettings(userId);
    const updated = { ...current, ...updates };

    this.db
      .query(
        `
      UPDATE settings 
      SET send_yours_deleted = $send_yours_deleted,
          send_yours_edited = $send_yours_edited,
          notify_on_deleted = $notify_on_deleted,
          notify_on_edited = $notify_on_edited
      WHERE user_id = $user_id
    `
      )
      .run({
        $user_id: userId,
        $send_yours_deleted: updated.sendYoursDeleted ? 1 : 0,
        $send_yours_edited: updated.sendYoursEdited ? 1 : 0,
        $notify_on_deleted: updated.notifyOnDeleted ? 1 : 0,
        $notify_on_edited: updated.notifyOnEdited ? 1 : 0,
      });

    return updated;
  }

  toggleSetting(
    userId: number,
    key: keyof Settings
  ): { newValue: boolean; settings: Settings } {
    const current = this.getSettings(userId);
    const newValue = !current[key];
    const updated = { ...current, [key]: newValue };

    this.updateSettings(userId, updated);

    return { newValue, settings: updated };
  }

  private getDefaultSettings(): Settings {
    return {
      sendYoursDeleted: true,
      sendYoursEdited: true,
      notifyOnDeleted: true,
      notifyOnEdited: true,
    };
  }

  close() {
    this.db.close();
  }
}
