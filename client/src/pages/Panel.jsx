import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import EventFormModal from "../components/EventFormModal";

function formatDate(iso) {
  return new Date(iso).toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const STATUS_LABEL = {
  draft: "Borrador",
  published: "Publicado",
  cancelled: "Cancelado",
};

export default function Panel() {
  const { agency, logout } = useAuth();
  const [tab, setTab] = useState("current");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalEvent, setModalEvent] = useState(undefined);

  async function loadEvents() {
    setLoading(true);
    try {
      setEvents(await api.listEvents(tab));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, [tab]);

  async function handleSave(payload) {
    if (modalEvent?.id) {
      await api.updateEvent(modalEvent.id, payload);
    } else {
      await api.createEvent(payload);
    }
    setModalEvent(undefined);
    await loadEvents();
  }

  async function handleDelete(ev) {
    if (
      !confirm(
        `¿Borrar la invitación de ${ev.honoree_name}? No se puede deshacer.`,
      )
    )
      return;
    await api.deleteEvent(ev.id);
    await loadEvents();
  }

  return (
    <div className="panel">
      <header className="panel-header">
        <h1>{agency?.name}</h1>
        <button className="btn btn-ghost" onClick={logout}>
          Cerrar sesión
        </button>
      </header>

      <div className="panel-toolbar">
        <div className="tabs">
          <button
            className={tab === "current" ? "tab tab-active" : "tab"}
            onClick={() => setTab("current")}
          >
            En curso
          </button>
          <button
            className={tab === "finished" ? "tab tab-active" : "tab"}
            onClick={() => setTab("finished")}
          >
            Finalizados
          </button>
        </div>
        <button className="btn btn-primary" onClick={() => setModalEvent(null)}>
          + Nuevo evento
        </button>
      </div>

      {loading ? (
        <p className="panel-empty">Cargando…</p>
      ) : events.length === 0 ? (
        <p className="panel-empty">
          Todavía no hay eventos{" "}
          {tab === "current" ? "en curso" : "finalizados"}.
        </p>
      ) : (
        <ul className="event-list">
          {events.map((ev) => (
            <li key={ev.id} className={`event-card event-card-${ev.status}`}>
              <div className="event-card-main">
                <h3>{ev.honoree_name}</h3>
                <p className="event-card-date">{formatDate(ev.event_date)}</p>
                {ev.dress_code && (
                  <p className="event-card-dress">{ev.dress_code}</p>
                )}
                <a
                  className="event-card-link"
                  href={`/i/${ev.slug}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  /i/{ev.slug}
                </a>
              </div>
              <div className="event-card-side">
                <span className="status-pill">{STATUS_LABEL[ev.status]}</span>
                <div className="event-card-actions">
                  <button
                    className="btn btn-ghost"
                    onClick={() => setModalEvent(ev)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-ghost btn-danger"
                    onClick={() => handleDelete(ev)}
                  >
                    Borrar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modalEvent !== undefined && (
        <EventFormModal
          initial={modalEvent}
          onSubmit={handleSave}
          onClose={() => setModalEvent(undefined)}
        />
      )}
    </div>
  );
}
