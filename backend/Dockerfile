FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci --workspace=backend --include-workspace-root

FROM deps AS build
COPY backend ./backend
RUN npm run prisma:generate -w backend && npm run build -w backend

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl && addgroup -S nodejs && adduser -S api -G nodejs
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/backend/node_modules ./backend/node_modules
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/prisma ./backend/prisma
COPY --from=build /app/backend/package.json ./backend/package.json
USER api
EXPOSE 3001
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy --schema backend/prisma/schema.prisma && node backend/dist/src/server.js"]
