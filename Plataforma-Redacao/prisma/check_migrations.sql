-- Verifica o estado de todas as migrações
SELECT 
  migration_name,
  finished_at IS NOT NULL as applied,
  rolled_back_at IS NOT NULL as rolled_back,
  logs,
  checksum
FROM "_prisma_migrations"
ORDER BY started_at;
