export interface Endereco {
  cep: string;
  logradouro: string;
  complemento: string;
  unidade: string;
  bairro: string;
  localidade: string;
  uf: string;
  estado: string;
  regiao: string;
  ddd: string;
  erro?: boolean;
}
export interface Noticia {
  id: number;
  titulo: string;
  descricao: string;
  createdAt: string;
  updatedAt: string;
}
export interface NoticiasResponse {
  data: Noticia[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}
