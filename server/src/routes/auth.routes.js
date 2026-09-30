const router = require("express").Router();
const bcrypt = require("bcrypt");
const rateLimit = require("express-rate-limit");
const { z } = require("zod");
const pool = require("../config/db");
const { requireAuth } = require("../middleware/auth");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos, probá más tarde" },
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(190),
  password: z.string().min(1).max(200),
});

// Hash falso para que el tiempo de respuesta sea similar exista o no el mail
const DUMMY_HASH = bcrypt.hashSync("dummy-password", 12);

router.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: "Datos inválidos" });
    const { email, password } = parsed.data;

    const [rows] = await pool.execute(
      "SELECT id, name, password_hash, is_active FROM agencies WHERE email = ?",
      [email],
    );
    const agency = rows[0];
    const ok = await bcrypt.compare(
      password,
      agency ? agency.password_hash : DUMMY_HASH,
    );

    if (!agency || !agency.is_active || !ok) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Nuevo ID de sesión al loguear (previene session fixation)
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.agencyId = agency.id;
      req.session.save((err2) => {
        if (err2) return next(err2);
        res.json({ id: agency.id, name: agency.name });
      });
    });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie("sid");
    res.json({ ok: true });
  });
});

router.get("/me", requireAuth, (req, res) => {
  res.json(req.agency);
});

module.exports = router;
