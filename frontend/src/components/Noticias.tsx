import { FormEvent, useCallback, useEffect, useState } from 'react';
import { excluirNoticia, listarNoticias, salvarNoticia } from '../services/api';
import type { Noticia, NoticiasResponse } from '../types';

const empty = { titulo: '', descricao: '' };
export function Noticias() {
  const [result, setResult] = useState<NoticiasResponse>({
    data: [],
    meta: { total: 0, page: 1, limit: 5, totalPages: 0 },
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<number>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setResult(await listarNoticias(page, query));
    } catch {
      setError('Não foi possível carregar as notícias. Verifique se a API está ativa.');
    } finally {
      setLoading(false);
    }
  }, [page, query]);
  useEffect(() => {
    void load();
  }, [load]);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (form.titulo.trim().length < 3 || form.descricao.trim().length < 10) {
      setError('Use ao menos 3 caracteres no título e 10 na descrição.');
      return;
    }
    setSaving(true);
    try {
      await salvarNoticia(form, editing);
      setForm(empty);
      setEditing(undefined);
      setPage(1);
      await load();
    } catch {
      setError('Não foi possível salvar a notícia.');
    } finally {
      setSaving(false);
    }
  }
  function edit(item: Noticia) {
    setEditing(item.id);
    setForm({ titulo: item.titulo, descricao: item.descricao });
    document.getElementById('titulo')?.focus();
  }
  async function remove(item: Noticia) {
    if (!window.confirm(`Excluir “${item.titulo}”?`)) return;
    try {
      await excluirNoticia(item.id);
      if (result.data.length === 1 && page > 1) setPage(page - 1);
      else await load();
    } catch {
      setError('Não foi possível excluir a notícia.');
    }
  }
  return (
    <section className="news-section" aria-labelledby="news-title">
      <div className="section-heading">
        <div>
          <div className="eyebrow">Conteúdo</div>
          <h2 id="news-title">Painel de notícias</h2>
        </div>
        <form
          className="search"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setQuery(search);
          }}
          role="search"
        >
          <label className="sr-only" htmlFor="search">
            Filtrar notícias
          </label>
          <input
            id="search"
            placeholder="Filtrar por título ou descrição"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="secondary">Filtrar</button>
        </form>
      </div>
      <div className="news-grid">
        <form className="card editor" onSubmit={submit}>
          <h3>{editing ? 'Editar notícia' : 'Nova notícia'}</h3>
          <label htmlFor="titulo">Título</label>
          <input
            id="titulo"
            value={form.titulo}
            maxLength={150}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
          />
          <label htmlFor="descricao">Descrição</label>
          <textarea
            id="descricao"
            rows={6}
            maxLength={5000}
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          />
          <div className="form-actions">
            {editing && (
              <button
                type="button"
                className="ghost"
                onClick={() => {
                  setEditing(undefined);
                  setForm(empty);
                }}
              >
                Cancelar
              </button>
            )}
            <button disabled={saving}>
              {saving ? 'Salvando…' : editing ? 'Atualizar' : 'Publicar'}
            </button>
          </div>
        </form>
        <div className="list" aria-busy={loading}>
          {error && (
            <div className="alert" role="alert">
              {error}
            </div>
          )}
          {loading ? (
            <div className="card empty-state">
              <span className="spinner dark" />
              Carregando notícias…
            </div>
          ) : result.data.length === 0 ? (
            <div className="card empty-state">
              <strong>Nenhuma notícia encontrada</strong>
              <span>Publique a primeira ou altere o filtro.</span>
            </div>
          ) : (
            result.data.map((item) => (
              <article className="card news-item" key={item.id}>
                <div>
                  <h3>{item.titulo}</h3>
                  <p>{item.descricao}</p>
                </div>
                <div className="item-actions">
                  <button className="ghost" onClick={() => edit(item)}>
                    Editar
                  </button>
                  <button className="danger" onClick={() => void remove(item)}>
                    Excluir
                  </button>
                </div>
              </article>
            ))
          )}
          {!loading && result.meta.totalPages > 0 && (
            <nav className="pagination" aria-label="Paginação">
              <button className="secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>
                Anterior
              </button>
              <span>
                Página <strong>{page}</strong> de {result.meta.totalPages} · {result.meta.total}{' '}
                itens
              </span>
              <button
                className="secondary"
                disabled={page >= result.meta.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Próxima
              </button>
            </nav>
          )}
        </div>
      </div>
    </section>
  );
}
