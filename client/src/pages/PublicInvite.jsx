import { useState } from "react";

const MOCK_EVENT = {
  honoreeName: "Julia",
  eventDate: "2027-04-12T20:00:00",
  dressCode: "Elegante",
  gallery: [1, 2, 3, 4],
  transfer: {
    alias: "julia.15",
    bank_name: "Banco Nación",
    holder_name: "Familia Pérez",
  },
  gifts: [{ name: "Lista de regalos en construcción", url: null }],
};

function formatEventDate(iso) {
  return new Date(iso).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const DIET_OPTIONS = [
  { value: "standard", label: "Estándar" },
  { value: "vegetarian", label: "Vegetariano" },
  { value: "vegan", label: "Vegano" },
  { value: "celiac", label: "Celíaco" },
  { value: "other", label: "Otro" },
];

export default function PublicInvite() {
  const event = MOCK_EVENT;
  const [dietary, setDietary] = useState("standard");

  return (
    <div className="invite">
      <section className="invite-hero">
        <p className="invite-kicker">Te invitamos a celebrar con</p>
        <h1>{event.honoreeName}</h1>
        <p className="invite-date">{formatEventDate(event.eventDate)}</p>
      </section>

      <section className="invite-section">
        <h2>Galería</h2>
        <div className="invite-gallery">
          {event.gallery.map((i) => (
            <div key={i} className="invite-gallery-item" />
          ))}
        </div>
      </section>

      <section className="invite-section invite-section-split">
        <div>
          <h2>Código de vestimenta</h2>
          <p>{event.dressCode}</p>
        </div>
        <div>
          <h2>Regalos</h2>
          {event.transfer && (
            <p className="invite-transfer">
              Alias: {event.transfer.alias}
              <br />
              {event.transfer.bank_name} — a nombre de{" "}
              {event.transfer.holder_name}
            </p>
          )}
          <ul className="invite-gift-list">
            {event.gifts.map((g) => (
              <li key={g.name}>{g.name}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="invite-section invite-rsvp">
        <h2>Confirmar asistencia</h2>
        <form
          className="invite-rsvp-form"
          onSubmit={(e) => {
            e.preventDefault();
            alert(
              "Este formulario todavía no está conectado — falta el endpoint público de RSVP.",
            );
          }}
        >
          <label>
            Nombre
            <input type="text" required />
          </label>
          <label>
            Apellido
            <input type="text" required />
          </label>
          <label>
            Email
            <input type="email" required />
          </label>
          <label>
            Teléfono
            <input type="tel" />
          </label>
          <label>
            Menú
            <select
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
            >
              {DIET_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          {dietary === "other" && (
            <label>
              Contanos más
              <textarea rows={2} />
            </label>
          )}
          <button className="btn btn-primary" type="submit">
            Confirmar asistencia
          </button>
        </form>
      </section>
    </div>
  );
}
