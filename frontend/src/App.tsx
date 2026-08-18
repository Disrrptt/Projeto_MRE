import { useEffect, useState } from 'react';
import { CepSearch } from './components/CepSearch';
import { Noticias } from './components/Noticias';
import './styles.css';

type Page = 'cep' | 'noticias';

function pageFromHash(): Page {
  return window.location.hash === '#/noticias' ? 'noticias' : 'cep';
}

export default function App() {
  const [page, setPage] = useState<Page>(pageFromHash);

  useEffect(() => {
    const onHashChange = () => setPage(pageFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return (
    <>
      <header>
        <div className="shell nav">
          <a className="brand" href="#/cep" aria-label="Localiza, consulta de CEP">
            <span aria-hidden="true">L</span>Localiza
          </a>
          <nav className="main-nav" aria-label="Navegação principal">
            <a href="#/cep" aria-current={page === 'cep' ? 'page' : undefined}>
              Consultar CEP
            </a>
            <a href="#/noticias" aria-current={page === 'noticias' ? 'page' : undefined}>
              Notícias
            </a>
          </nav>
        </div>
      </header>
      <main>
        {page === 'cep' ? (
          <div className="page shell">
            <div className="page-heading">
              <span className="eyebrow">Endereços</span>
              <h1>Consulta de CEP</h1>
              <p>Encontre um endereço completo de forma rápida.</p>
            </div>
            <div className="focused-content">
              <CepSearch />
            </div>
          </div>
        ) : (
          <div className="page shell">
            <Noticias />
          </div>
        )}
      </main>
      <footer>
        <div className="shell">Localiza · React e TypeScript</div>
      </footer>
    </>
  );
}
