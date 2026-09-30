const crypto = require("crypto");

const MESES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

function slugify(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function buildBaseSlug(honoreeName, eventDate) {
  const namePart = slugify(honoreeName).slice(0, 40) || "evento";
  const day = String(eventDate.getDate()).padStart(2, "0");
  const month = MESES[eventDate.getMonth()];
  const yy = String(eventDate.getFullYear()).slice(-2);
  return `${namePart}${day}${month}${yy}`; // ej: julia12abr27
}

function slugAttempt(honoreeName, eventDate, attempt) {
  const base = buildBaseSlug(honoreeName, eventDate);
  return attempt === 0 ? base : `${base}-${attempt + 1}`;
}

module.exports = { slugify, slugAttempt };
