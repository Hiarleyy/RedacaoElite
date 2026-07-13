const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:docker@localhost:5433/BDPlataformaRedacao?schema=public'
    }
  }
});

async function main() {
  console.log('🔧 Iniciando correção do histórico de migrações...\n');

  // 1. Remove as entradas duplicadas/com erro da migração com_pedagogo_role
  const deleted = await prisma.$queryRawUnsafe(`
    DELETE FROM "_prisma_migrations"
    WHERE migration_name = '20260709114928_add_pedagogo_role'
    RETURNING migration_name, finished_at IS NOT NULL as was_applied
  `);
  console.log(`🗑️  Removidas ${deleted.length} entrada(s) de '20260709114928_add_pedagogo_role'`);
  
  // 2. Verifica o que sobrou
  const remaining = await prisma.$queryRawUnsafe(`
    SELECT migration_name, finished_at IS NOT NULL as applied, rolled_back_at IS NOT NULL as rolled_back
    FROM "_prisma_migrations"
    WHERE migration_name >= '20260703130807'
    ORDER BY started_at
  `);
  
  console.log('\n📋 Migrações recentes após limpeza:');
  console.table(remaining);

  // 3. Verifica enum Cargo
  const enumValues = await prisma.$queryRawUnsafe(`
    SELECT enumlabel 
    FROM pg_enum 
    JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
    WHERE pg_type.typname = 'Cargo'
    ORDER BY enumsortorder
  `);
  console.log('\n🏷️  Valores do enum Cargo no banco:', enumValues.map(r => r.enumlabel));
  
  console.log('\n✅ Limpeza concluída! Agora execute: npx prisma migrate dev');

  await prisma.$disconnect();
}

main().catch(e => {
  console.error('❌ Erro:', e.message);
  process.exit(1);
});
