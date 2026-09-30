require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const pool = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const eventsRoutes = require("./routes/events.routes");
const { requireAuth } = require("./middleware/auth");
const { issueCsrfToken } = require("./middleware/csrf");

if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  throw new Error(
    "SESSION_SECRET faltante o demasiado corto (mín. 32 caracteres)",
  );
}

const app = express();
const isProd = process.env.NODE_ENV === "production";
if (isProd) app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json({ limit: "100kb" }));

app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET,
    store: new MySQLStore({}, pool),
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: isProd, // true en producción (HTTPS !!)
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 8, // 8 horas
    },
  }),
);

app.use("/api/auth", authRoutes);

app.get("/api/csrf-token", requireAuth, (req, res) => {
  res.json({ csrfToken: issueCsrfToken(req) });
});

app.use("/api/events", eventsRoutes);

app.get("/api/panel/ping", requireAuth, (req, res) => {
  res.json({ ok: true, agency: req.agency });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno" });
});

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`API escuchando en http://localhost:${port}`),
);
