const pool = require("../config/db");

async function requireAuth(req, res, next) {
  try {
    const id = req.session && req.session.agencyId;
    if (!id) return res.status(401).json({ error: "No autenticado" });

    const [rows] = await pool.execute(
      "SELECT id, name, email FROM agencies WHERE id = ? AND is_active = 1",
      [id],
    );
    if (!rows[0]) {
      return req.session.destroy(() =>
        res.status(401).json({ error: "No autenticado" }),
      );
    }
    req.agency = rows[0];
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAuth };
