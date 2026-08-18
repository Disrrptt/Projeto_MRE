CREATE TABLE "Noticia" (
  "id" SERIAL NOT NULL,
  "titulo" VARCHAR(150) NOT NULL,
  "descricao" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Noticia_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Noticia_titulo_idx" ON "Noticia"("titulo");
