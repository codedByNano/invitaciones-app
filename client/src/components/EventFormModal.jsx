import { useState } from "react";

const DRESS_CODES = ["Elegante", "Elegante sport", "Formal", "Casual chic"];

function toLocalInputValue(iso) {
  if (!iso) return "";
  return iso.slice(0, 16);
}

export default function EventFormModal({ initial, onSubmit, onClose }) {
  const [honoreeName, setHonoreeName] = useState(initial?.honoree_name || "");
  const [eventDate, setEventDate] = useState(
    toLocalInputValue(initial?.event_date),
  );
  const [dressCode, setDressCode] = useState(initial?.dress_code || "");
  const [status, setStatus] = useState(initial?.status || "draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        honoree_name: honoreeName,
        event_date: eventDate,
        dress_code: dressCode || null,
        status,
      });
    } catch (err) {
      setError(err.message || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2>{initial ? "Editar evento" : "Nuevo evento"}</h2>

        <label>
          Nombre del agasajado
          <input
            value={honoreeName}
            onChange={(e) => setHonoreeName(e.target.value)}
            required
          />
        </label>

        <label>
          Fecha y hora
          <input
            type="datetime-local"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
          />
        </label>

        <label>
          Código de vestimenta
          <select
            value={dressCode}
            onChange={(e) => setDressCode(e.target.value)}
          >
            <option value="">Sin especificar</option>
            {DRESS_CODES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>

        <label>
          Estado
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
