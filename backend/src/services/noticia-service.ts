import type { ListQuery, NoticiaInput, NoticiaRepository } from '../domain/noticia.js';
import { MemoryCache } from './cache.js';

export class NoticiaService {
  constructor(
    private repository: NoticiaRepository,
    private cache: MemoryCache,
  ) {}
  async create(input: NoticiaInput) {
    const item = await this.repository.create(input);
    this.cache.clear();
    return item;
  }
  async list(query: ListQuery) {
    const key = JSON.stringify(query);
    const cached = this.cache.get<Awaited<ReturnType<NoticiaRepository['findAll']>>>(key);
    if (cached) return { ...cached, cache: 'HIT' as const };
    const result = await this.repository.findAll(query);
    this.cache.set(key, result);
    return { ...result, cache: 'MISS' as const };
  }
  findById(id: number) {
    return this.repository.findById(id);
  }
  async update(id: number, input: NoticiaInput) {
    const item = await this.repository.update(id, input);
    this.cache.clear();
    return item;
  }
  async delete(id: number) {
    const deleted = await this.repository.delete(id);
    this.cache.clear();
    return deleted;
  }
}
