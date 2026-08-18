import { CepSearch } from './components/CepSearch';
import { Noticias } from './components/Noticias';
import './styles.css';
export default function App() {
  return (
    <>
      <header>
        <div className="shell nav">
          <a className="brand" href="#top" aria-label="Portal Localiza, início">
            <span>L</span>Localiza
          </a>
          <a href="#noticias">Notícias</a>
        </div>
      </header>
      <main id="top">
        <div className="hero shell">
          <div className="hero-copy">
            <span className="pill">Serviços em um só lugar</span>
            <h1>
              Informação local,
              <br />
              <em>sem complicação.</em>
            </h1>
            <p>
              Consulte endereços e mantenha suas notícias organizadas em uma experiência simples e
              acessível.
            </p>
          </div>
          <CepSearch />
        </div>
        <div id="noticias" className="shell">
          <Noticias />
        </div>
      </main>
      <footer>
        <div className="shell">Portal Localiza · Construído com React e TypeScript</div>
      </footer>
    </>
  );
}
