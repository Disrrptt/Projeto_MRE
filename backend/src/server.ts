import { createApp } from './app.js';
import { prisma } from './infra/prisma.js';

const port = Number(process.env.PORT ?? 3001);
const server = createApp().listen(port, () =>
  console.log(`API disponível em http://localhost:${port}`),
);

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
