const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:docker@localhost:5433/BDPlataformaRedacao?schema=public'
    }
  }
});

async function main() {
  // Verifica tabela Proposta
  const propostaCols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, character_maximum_length
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Proposta'
    ORDER BY ordinal_position
  `);
  console.log('📊 Tabela Proposta:');
  console.table(propostaCols);

  // Verifica se MaterialApoio já existe
  const materialExists = await prisma.$queryRawUnsafe(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'MaterialApoio'
    ) as exists
  `);
  console.log('\n🔍 MaterialApoio existe?', materialExists[0].exists);

  // Verifica constraints da tabela Proposta
  const constraints = await prisma.$queryRawUnsafe(`
    SELECT constraint_name, constraint_type
    FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'Proposta'
  `);
  console.log('\n🔒 Constraints da Proposta:');
  console.table(constraints);

  // Verifica FKs que referenciam Proposta
  const fks = await prisma.$queryRawUnsafe(`
    SELECT tc.constraint_name, tc.table_name, kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
    JOIN information_schema.table_constraints tc2 ON rc.unique_constraint_name = tc2.constraint_name
    WHERE tc2.table_name = 'Proposta' AND tc.constraint_type = 'FOREIGN KEY'
  `);
  console.log('\n🔗 FKs que referenciam Proposta:');
  console.table(fks);

  // Estado das migrações recentes
  const migrations = await prisma.$queryRawUnsafe(`
    SELECT migration_name, finished_at IS NOT NULL as applied, rolled_back_at IS NOT NULL as rolled_back
    FROM "_prisma_migrations"
    WHERE migration_name >= '20260709'
    ORDER BY started_at
  `);
  console.log('\n📋 Migrações recentes:');
  console.table(migrations);

  await prisma.$disconnect();
}

main().catch(e => {
  console.error('❌ Erro:', e.message);
  process.exit(1);
});
