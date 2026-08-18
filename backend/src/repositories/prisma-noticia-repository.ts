import type { NoticiaRepository, NoticiaInput, ListQuery } from '../domain/noticia.js';
import { prisma } from '../infra/prisma.js';

export class PrismaNoticiaRepository implements NoticiaRepository {
  create(data: NoticiaInput) {
    return prisma.noticia.create({ data });
  }

  async findAll({ page, limit, search }: ListQuery) {
    const where = search
      ? {
          OR: [
            { titulo: { contains: search, mode: 'insensitive' as const } },
            { descricao: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};
    const [items, total] = await prisma.$transaction([
      prisma.noticia.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      prisma.noticia.count({ where }),
    ]);
    return { items, total };
  }

  findById(id: number) {
    return prisma.noticia.findUnique({ where: { id } });
  }
  async update(id: number, data: NoticiaInput) {
    if (!(await this.findById(id))) return null;
    return prisma.noticia.update({ where: { id }, data });
  }
  async delete(id: number) {
    if (!(await this.findById(id))) return false;
    await prisma.noticia.delete({ where: { id } });
    return true;
  }
}
