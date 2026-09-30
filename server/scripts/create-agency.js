require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});
const readline = require("readline");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const pool = require("../src/config/db");

function ask(question, hidden = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });
    rl.stdoutMuted = false;
    rl._writeToOutput = (s) => {
      if (rl.stdoutMuted && s.trim()) rl.output.write("*");
      else rl.output.write(s);
    };
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
    rl.stdoutMuted = hidden;
  });
}

(async () => {
  try {
    const name = (await ask("Nombre de la agencia: ")).trim();
    const email = (await ask("Email: ")).trim().toLowerCase();
    const password = await ask("Contraseña (mín. 12 caracteres): ", true);
    console.log();

    const parsed = z
      .object({
        name: z.string().min(2).max(150),
        email: z.string().email().max(190),
        password: z.string().min(12).max(200),
      })
      .safeParse({ name, email, password });

    if (!parsed.success) {
      console.error(
        "Datos inválidos:",
        parsed.error.issues
          .map((i) => i.path[0] + ": " + i.message)
          .join(" | "),
      );
      process.exit(1);
    }

    const hash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      "INSERT INTO agencies (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, hash],
    );
    console.log(`Agencia creada (id ${result.insertId}): ${name} <${email}>`);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      console.error("Ya existe una agencia con ese email.");
    else console.error(err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
