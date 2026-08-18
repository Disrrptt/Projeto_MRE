# Portal Localiza — prova técnica full-stack

Aplicação React/TypeScript para consulta de CEP e gestão de notícias, integrada a uma API REST Node.js/Express com PostgreSQL, Prisma, paginação, filtros e cache em memória.

## Funcionalidades

- Busca de CEP via ViaCEP, com máscara, validação, cancelamento de requisições, loading, mensagens de erro e resultado acessível.
- CRUD de notícias (`titulo` e `descricao`) com criação, edição, exclusão confirmada e listagem.
- Paginação no backend (5 itens por página no frontend) e filtro por título ou descrição.
- Validação de payload com Zod e respostas HTTP semânticas (`201`, `204`, `404`, `422`, `500`).
- Cache em memória da listagem, com TTL configurável, indicador `X-Cache: HIT|MISS` e invalidação após toda mutação.
- PostgreSQL real, migração Prisma, containers com healthcheck e builds multi-stage.
- Testes escritos como cenários BDD (`Given/When/Then`) para CEP e endpoints.

## Requisitos

- Node.js 22+ e npm 10+
- Docker Desktop (para PostgreSQL e execução containerizada)

## Execução local

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie `backend/.env.example` para `backend/.env` e `frontend/.env.example` para `frontend/.env`.

3. Suba somente o banco:

   ```bash
   docker compose up -d db
   ```

4. Gere o client e aplique a migração:

   ```bash
   npm run prisma:generate -w backend
   npm run prisma:deploy -w backend
   ```

5. Inicie frontend e API juntos:

   ```bash
   npm run dev
   ```

O frontend estará em `http://localhost:5173`, a API em `http://localhost:3001` e o PostgreSQL em `localhost:5432`.

## Docker Compose

Para construir as imagens otimizadas e subir web, API e banco:

```bash
docker compose up --build
```

Acesse `http://localhost:8080`. A API fica disponível em `http://localhost:3001`. A API espera o healthcheck do banco e aplica automaticamente as migrações antes de iniciar. Para encerrar, use `docker compose down`; adicione `-v` somente se também quiser apagar os dados persistidos.

Os Dockerfiles usam multi-stage: dependências/build ficam fora da imagem final; o frontend é servido por Nginx e a API roda em Alpine com usuário sem privilégios.

## Testes e qualidade

```bash
npm test                 # todos os testes BDD
npm run test -w frontend # cenários da busca de CEP
npm run test -w backend  # criação, validação, paginação e cache
npm run lint             # ESLint nos dois projetos
npm run format:check     # valida Prettier
npm run build            # TypeScript + builds de produção
```

Os testes da API usam um repositório em memória (test double), portanto são rápidos e não exigem banco. A persistência de produção continua sendo PostgreSQL/Prisma.

## API

| Método   | Rota                                     | Comportamento                      |
| -------- | ---------------------------------------- | ---------------------------------- |
| `POST`   | `/noticias`                              | Cria e retorna `201`               |
| `GET`    | `/noticias?page=1&limit=10&search=texto` | Lista, filtra e retorna metadados  |
| `GET`    | `/noticias/:id`                          | Busca uma notícia                  |
| `PUT`    | `/noticias/:id`                          | Atualiza todos os campos editáveis |
| `DELETE` | `/noticias/:id`                          | Exclui e retorna `204`             |
| `GET`    | `/health`                                | Healthcheck da API                 |

Exemplo de listagem:

```json
{
  "data": [{ "id": 1, "titulo": "Título", "descricao": "Descrição da notícia" }],
  "meta": { "total": 1, "page": 1, "limit": 10, "totalPages": 1 }
}
```

`page` deve ser positivo, `limit` aceita de 1 a 100 e `search` procura sem diferenciar maiúsculas em título ou descrição. Título aceita de 3 a 150 caracteres; descrição, de 10 a 5000. Campos extras são rejeitados.

## Estrutura e decisões

```text
frontend/src/
├── components/   # unidades visuais e seus testes próximos
├── services/     # clientes HTTP; UI não conhece detalhes de transporte
├── test/         # configuração compartilhada de testes
├── App.tsx       # composição da página
└── types.ts      # contratos TypeScript

backend/src/
├── domain/       # entidades e portas, sem dependência de framework
├── repositories/ # adapter Prisma para persistência
├── services/     # regras e cache
├── infra/        # conexão com recursos externos
├── app.ts        # HTTP, validação e tratamento de erros
└── server.ts     # inicialização e encerramento gracioso
```

A separação por responsabilidade permite trocar Prisma/cache ou testar a aplicação sem infraestrutura. O repositório é injetado no app; em escala, o cache em memória pode ser substituído por Redis mantendo a regra de invalidação, e novos módulos podem repetir o fluxo domínio → serviço → adapter. Índice de título, paginação limitada, transação de `findMany/count`, limite do corpo, Helmet e encerramento gracioso evitam gargalos comuns.

O CSS é autoral, sem framework, usa variáveis, grid/flex, breakpoints em 850/560 px, estados de foco, região `aria-live` e suporte a movimento reduzido. ESLint protege consistência e erros estáticos; Prettier normaliza a forma do código.

## GitFlow e publicação

Fluxo recomendado:

- `main`: produção e versões marcadas.
- `develop`: integração da próxima versão.
- `feature/<nome>`: trabalho novo, aberto a partir de `develop`.
- `release/<versao>`: estabilização antes de merge em `main` e `develop`.
- `hotfix/<nome>`: correções urgentes abertas de `main`.

Após criar um repositório vazio no GitHub:

```bash
git init
git add .
git commit -m "feat: implementa prova técnica full-stack"
git branch -M main
git branch develop
git remote add origin https://github.com/SEU_USUARIO/projeto_mre.git
git push -u origin main
git push -u origin develop
```

No trabalho diário: `git switch develop`, `git switch -c feature/minha-feature`, abra PR para `develop`, e depois promova uma `release/*` para `main`. A publicação requer uma conta/autenticação GitHub e, por isso, não é feita automaticamente pela aplicação.
