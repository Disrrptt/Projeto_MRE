export interface Noticia {
  id: number;
  titulo: string;
  descricao: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NoticiaInput {
  titulo: string;
  descricao: string;
}

export interface ListQuery {
  page: number;
  limit: number;
  search?: string;
}

export interface NoticiaRepository {
  create(data: NoticiaInput): Promise<Noticia>;
  findAll(query: ListQuery): Promise<{ items: Noticia[]; total: number }>;
  findById(id: number): Promise<Noticia | null>;
  update(id: number, data: NoticiaInput): Promise<Noticia | null>;
  delete(id: number): Promise<boolean>;
}
