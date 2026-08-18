import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';
import { z } from 'zod';
import type { NoticiaRepository } from './domain/noticia.js';
import { PrismaNoticiaRepository } from './repositories/prisma-noticia-repository.js';
import { MemoryCache } from './services/cache.js';
import { NoticiaService } from './services/noticia-service.js';

const payloadSchema = z
  .object({
    titulo: z.string().trim().min(3, 'Título deve ter ao menos 3 caracteres').max(150),
    descricao: z.string().trim().min(10, 'Descrição deve ter ao menos 10 caracteres').max(5000),
  })
  .strict();
const paramsSchema = z.object({ id: z.coerce.number().int().positive() });
const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(150).optional(),
});

export function createApp(repository: NoticiaRepository = new PrismaNoticiaRepository()) {
  const app = express();
  const ttl = Number(process.env.CACHE_TTL_SECONDS ?? 30) * 1000;
  const service = new NoticiaService(repository, new MemoryCache(ttl));
  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? '*' }));
  app.use(express.json({ limit: '50kb' }));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.post('/noticias', async (req, res, next) => {
    try {
      const data = payloadSchema.parse(req.body);
      res.status(201).json(await service.create(data));
    } catch (error) {
      next(error);
    }
  });
  app.get('/noticias', async (req, res, next) => {
    try {
      const query = querySchema.parse(req.query);
      const { items, total, cache } = await service.list(query);
      res.setHeader('X-Cache', cache).json({
        data: items,
        meta: {
          total,
          page: query.page,
          limit: query.limit,
          totalPages: Math.ceil(total / query.limit),
        },
      });
    } catch (error) {
      next(error);
    }
  });
  app.get('/noticias/:id', async (req, res, next) => {
    try {
      const { id } = paramsSchema.parse(req.params);
      const item = await service.findById(id);
      if (item) res.json(item);
      else res.status(404).json({ error: 'Notícia não encontrada' });
    } catch (error) {
      next(error);
    }
  });
  app.put('/noticias/:id', async (req, res, next) => {
    try {
      const { id } = paramsSchema.parse(req.params);
      const data = payloadSchema.parse(req.body);
      const item = await service.update(id, data);
      if (item) res.json(item);
      else res.status(404).json({ error: 'Notícia não encontrada' });
    } catch (error) {
      next(error);
    }
  });
  app.delete('/noticias/:id', async (req, res, next) => {
    try {
      const { id } = paramsSchema.parse(req.params);
      if (await service.delete(id)) res.status(204).send();
      else res.status(404).json({ error: 'Notícia não encontrada' });
    } catch (error) {
      next(error);
    }
  });
  app.use((_req, res) => res.status(404).json({ error: 'Rota não encontrada' }));
  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    void _next;
    if (error instanceof z.ZodError)
      return res.status(422).json({ error: 'Payload inválido', details: error.flatten() });
    console.error(error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  });
  return app;
}
