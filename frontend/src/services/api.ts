import axios from 'axios';
import type { Endereco, Noticia, NoticiasResponse } from '../types';

export const noticiasApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
  timeout: 8000,
});
export async function buscarCep(cep: string, signal?: AbortSignal) {
  const { data } = await axios.get<Endereco>(`https://viacep.com.br/ws/${cep}/json/`, {
    signal,
    timeout: 8000,
  });
  if (data.erro) throw new Error('CEP não encontrado. Confira os números e tente novamente.');
  return data;
}
export async function listarNoticias(page: number, search: string) {
  return (
    await noticiasApi.get<NoticiasResponse>('/noticias', {
      params: { page, limit: 5, search: search || undefined },
    })
  ).data;
}
export async function salvarNoticia(data: Pick<Noticia, 'titulo' | 'descricao'>, id?: number) {
  return id ? noticiasApi.put(`/noticias/${id}`, data) : noticiasApi.post('/noticias', data);
}
export async function excluirNoticia(id: number) {
  return noticiasApi.delete(`/noticias/${id}`);
}
