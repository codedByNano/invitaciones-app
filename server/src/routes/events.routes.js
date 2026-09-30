const router = require("express").Router();
const { z } = require("zod");
const pool = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const { requireCsrf } = require("../middleware/csrf");
const { slugAttempt } = require("../utils/slugify");

router.use(requireAuth);

const eventSchema = z.object({
  honoree_name: z.string().trim().min(2).max(150),
  event_date: z.coerce.date(),
  dress_code: z.string().trim().max(100).optional().nullable(),
  status: z.enum(["draft", "published", "cancelled"]).optional(),
});

function toMysqlDatetime(date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

router.get("/", async (req, res, next) => {
  try {
    const { scope } = req.query;
    let where = "agency_id = ?";
    const params = [req.agency.id];

    if (scope === "current") where += " AND event_date >= NOW()";
    else if (scope === "finished") where += " AND event_date < NOW()";

    const [rows] = await pool.execute(
      `SELECT id, slug, honoree_name, event_date, dress_code, status, created_at, updated_at
       FROM events WHERE ${where} ORDER BY event_date ASC`,
      params,
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM events WHERE id = ? AND agency_id = ?",
      [req.params.id, req.agency.id],
    );
    if (!rows[0]) return res.status(404).json({ error: "No encontrado" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post("/", requireCsrf, async (req, res, next) => {
  try {
    const parsed = eventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Datos inválidos", details: parsed.error.issues });
    }
    const { honoree_name, event_date, dress_code, status } = parsed.data;

    for (let attempt = 0; attempt < 5; attempt++) {
      const slug = slugAttempt(honoree_name, event_date, attempt);
      try {
        const [result] = await pool.execute(
          `INSERT INTO events (agency_id, slug, honoree_name, event_date, dress_code, status)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            req.agency.id,
            slug,
            honoree_name,
            toMysqlDatetime(event_date),
            dress_code || null,
            status || "draft",
          ],
        );
        return res.status(201).json({ id: result.insertId, slug });
      } catch (err) {
        if (err.code === "ER_DUP_ENTRY" && attempt < 4) continue;
        throw err;
      }
    }
  } catch (err) {
    next(err);
  }
});

router.put("/:id", requireCsrf, async (req, res, next) => {
  try {
    const parsed = eventSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Datos inválidos", details: parsed.error.issues });
    }
    const fields = parsed.data;
    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ error: "Nada para actualizar" });
    }

    const sets = [];
    const params = [];
    for (const [key, value] of Object.entries(fields)) {
      sets.push(`${key} = ?`);
      params.push(key === "event_date" ? toMysqlDatetime(value) : value);
    }
    params.push(req.params.id, req.agency.id);

    const [result] = await pool.execute(
      `UPDATE events SET ${sets.join(", ")} WHERE id = ? AND agency_id = ?`,
      params,
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "No encontrado" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireCsrf, async (req, res, next) => {
  try {
    const [result] = await pool.execute(
      "DELETE FROM events WHERE id = ? AND agency_id = ?",
      [req.params.id, req.agency.id],
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "No encontrado" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
