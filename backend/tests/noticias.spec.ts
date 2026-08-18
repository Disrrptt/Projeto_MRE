import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import type { ListQuery, Noticia, NoticiaInput, NoticiaRepository } from '../src/domain/noticia.js';

class FakeRepository implements NoticiaRepository {
  items: Noticia[] = [];
  async create(data: NoticiaInput) {
    const now = new Date();
    const item = { id: this.items.length + 1, ...data, createdAt: now, updatedAt: now };
    this.items.push(item);
    return item;
  }
  async findAll(query: ListQuery) {
    const filtered = this.items.filter(
      (i) =>
        !query.search ||
        `${i.titulo} ${i.descricao}`.toLowerCase().includes(query.search.toLowerCase()),
    );
    return {
      items: filtered.slice((query.page - 1) * query.limit, query.page * query.limit),
      total: filtered.length,
    };
  }
  async findById(id: number) {
    return this.items.find((i) => i.id === id) ?? null;
  }
  async update(id: number, data: NoticiaInput) {
    const item = await this.findById(id);
    if (!item) return null;
    Object.assign(item, data, { updatedAt: new Date() });
    return item;
  }
  async delete(id: number) {
    const index = this.items.findIndex((i) => i.id === id);
    if (index < 0) return false;
    this.items.splice(index, 1);
    return true;
  }
}

describe('Feature: criação de notícias', () => {
  it('Given um payload válido, When cria, Then retorna 201 e a notícia', async () => {
    const response = await request(createApp(new FakeRepository()))
      .post('/noticias')
      .send({ titulo: 'Nova versão', descricao: 'Uma descrição suficientemente completa.' });
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ id: 1, titulo: 'Nova versão' });
  });
  it('Given um payload inválido, When cria, Then retorna 422 com detalhes', async () => {
    const response = await request(createApp(new FakeRepository()))
      .post('/noticias')
      .send({ titulo: 'Oi', descricao: 'curta' });
    expect(response.status).toBe(422);
    expect(response.body.error).toBe('Payload inválido');
  });
});

describe('Feature: listagem paginada e cacheada', () => {
  it('Given notícias, When lista duas vezes, Then retorna metadados e cache hit', async () => {
    const repository = new FakeRepository();
    await repository.create({ titulo: 'Tecnologia', descricao: 'Conteúdo sobre tecnologia.' });
    const app = createApp(repository);
    const first = await request(app).get('/noticias?page=1&limit=1&search=Tec');
    const second = await request(app).get('/noticias?page=1&limit=1&search=Tec');
    expect(first.body.meta).toMatchObject({ total: 1, page: 1, totalPages: 1 });
    expect(first.headers['x-cache']).toBe('MISS');
    expect(second.headers['x-cache']).toBe('HIT');
  });
});
