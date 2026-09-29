import { getChatGPTUser } from "../../chatgpt-auth";
import { readGameSave, writeGameSave } from "../../../db/game-save";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };
const json = (value: unknown, status = 200) => Response.json(value, { status, headers });

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return json({ error: "sign_in_required" }, 401);
  try {
    const row = await readGameSave(user.userId);
    return json(row ? { save: JSON.parse(row.payload), revision: row.revision, updatedAt: row.updated_at } : { save: null, revision: 0 });
  } catch (error) {
    console.error("game save read failed", error);
    return json({ error: "storage_unavailable" }, 503);
  }
}

export async function PUT(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return json({ error: "sign_in_required" }, 401);
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return json({ error: "invalid_origin" }, 403);
  if (request.headers.get("content-type")?.split(";")[0] !== "application/json") return json({ error: "invalid_type" }, 415);
  let body: { save?: unknown; expectedRevision?: unknown };
  try {
    const raw = await request.text();
    if (raw.length > 140_000) return json({ error: "save_too_large" }, 413);
    body = JSON.parse(raw);
  } catch { return json({ error: "invalid_json" }, 400); }
  const value = body.save;
  if (!value || typeof value !== "object" || Array.isArray(value)) return json({ error: "invalid_save" }, 400);
  const save = value as Record<string, unknown>;
  if (typeof save.name !== "string" || save.name.length > 24 ||
      !Number.isInteger(save.realm) || (save.realm as number) < 0 || (save.realm as number) > 7 ||
      !Number.isInteger(save.year) || (save.year as number) < 1 ||
      !Array.isArray(save.flags) || !Array.isArray(save.disciples) || !Array.isArray(save.log) ||
      save.flags.length > 100 || save.disciples.length > 30 || save.log.length > 50 ||
      !Number.isInteger(body.expectedRevision) || (body.expectedRevision as number) < 0) {
    return json({ error: "invalid_save" }, 400);
  }
  try {
    const row = await writeGameSave(user.userId, JSON.stringify(save), body.expectedRevision as number);
    if (!row) {
      const current = await readGameSave(user.userId);
      return json({ error: "revision_conflict", revision: current?.revision ?? 0,
        save: current ? JSON.parse(current.payload) : null, updatedAt: current?.updated_at ?? null }, 409);
    }
    return json({ revision: row.revision, updatedAt: row.updated_at });
  } catch (error) {
    console.error("game save write failed", error);
    return json({ error: "storage_unavailable" }, 503);
  }
}
