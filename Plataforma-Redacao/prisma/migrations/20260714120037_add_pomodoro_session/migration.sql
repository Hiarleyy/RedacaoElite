-- CreateTable
CREATE TABLE "PomodoroSession" (
    "id" CHAR(36) NOT NULL,
    "tema" VARCHAR(200) NOT NULL,
    "duracao" INTEGER NOT NULL,
    "pontos" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" CHAR(36) NOT NULL,

    CONSTRAINT "PomodoroSession_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PomodoroSession" ADD CONSTRAINT "PomodoroSession_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
