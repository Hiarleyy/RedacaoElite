-- CreateTable
CREATE TABLE "Simulado" (
    "id" CHAR(36) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "turmaId" VARCHAR(36) NOT NULL,
    "usuarioId" VARCHAR(36) NOT NULL,

    CONSTRAINT "Simulado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotasSimulado" (
    "id" CHAR(36) NOT NULL,
    "simuladoId" CHAR(36) NOT NULL,
    "usuarioId" CHAR(36) NOT NULL,
    "competencia01" INTEGER,
    "competencia02" INTEGER,
    "competencia03" INTEGER,
    "competencia04" INTEGER,
    "competencia05" INTEGER,
    "notaGeral" INTEGER,

    CONSTRAINT "NotasSimulado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotasSimulado_simuladoId_usuarioId_key" ON "NotasSimulado"("simuladoId", "usuarioId");

-- AddForeignKey
ALTER TABLE "Simulado" ADD CONSTRAINT "Simulado_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Simulado" ADD CONSTRAINT "Simulado_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotasSimulado" ADD CONSTRAINT "NotasSimulado_simuladoId_fkey" FOREIGN KEY ("simuladoId") REFERENCES "Simulado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotasSimulado" ADD CONSTRAINT "NotasSimulado_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
