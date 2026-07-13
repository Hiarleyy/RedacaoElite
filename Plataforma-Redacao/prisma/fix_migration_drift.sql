-- Script para corrigir o drift do Prisma sem perder dados
-- Execute este script conectado ao banco BDPlataformaRedacao

-- 1. Atualiza o checksum da migração que foi modificada no disco
UPDATE "_prisma_migrations"
SET 
  checksum = '84a1fa0fc379a41e98dbfd75dff11d0769a5ee856f9c111b2fbade1d910fb3ab',
  logs = NULL,
  rolled_back_at = NULL,
  finished_at = COALESCE(finished_at, NOW())
WHERE migration_name = '20260703130807_add_calendario_academico';

-- 2. Verifica o estado atual de todas as migrações
SELECT migration_name, finished_at, rolled_back_at, logs
FROM "_prisma_migrations"
ORDER BY started_at;
