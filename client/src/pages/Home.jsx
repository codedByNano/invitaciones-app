import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home">
      <header className="home-header">
        <Link to="/login" className="btn btn-ghost">
          Iniciar sesión
        </Link>
      </header>
      <main className="home-main">
        <h1>Tu Agencia</h1>
      </main>
    </div>
  );
}
