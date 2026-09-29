import { env } from "cloudflare:workers";

type SaveRow = { payload: string; revision: number; updated_at: string };

export async function readGameSave(userId: string) {
  return env.DB.prepare("SELECT payload, revision, updated_at FROM game_saves WHERE user_id = ?")
    .bind(userId).first<SaveRow>();
}

export async function writeGameSave(userId: string, payload: string, expectedRevision: number) {
  const timestamp = new Date().toISOString();
  if (expectedRevision === 0) {
    const row = await env.DB.prepare(
      "INSERT INTO game_saves (user_id, payload, revision, updated_at) VALUES (?, ?, 1, ?) ON CONFLICT(user_id) DO NOTHING RETURNING revision, updated_at"
    ).bind(userId, payload, timestamp).first<{ revision: number; updated_at: string }>();
    return row;
  }
  return env.DB.prepare(
    "UPDATE game_saves SET payload = ?, revision = revision + 1, updated_at = ? WHERE user_id = ? AND revision = ? RETURNING revision, updated_at"
  ).bind(payload, timestamp, userId, expectedRevision).first<{ revision: number; updated_at: string }>();
}
