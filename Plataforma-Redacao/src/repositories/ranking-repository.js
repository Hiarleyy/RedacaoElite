const prisma = require("../database/db")

const rankingRepository = {
  listarRankingDeAlunos: async () => {
    const ranking = await prisma.$queryRaw`
      SELECT 
        u.id,
        u.nome,
        t.nome AS turma,
        c.nota AS ultima_nota
      FROM "Usuario" u
      JOIN "Turma" t ON u."turmaId" = t.id
      JOIN "Redacao" r ON u.id = r."usuarioId"
      JOIN "Correcao" c ON r.id = c."redacaoId"
      WHERE r.status = 'CORRIGIDA'
        AND c."data" = (
          SELECT MAX(c2."data")
          FROM "Redacao" r2
          JOIN "Correcao" c2 ON r2.id = c2."redacaoId"
          WHERE r2."usuarioId" = u.id AND r2.status = 'CORRIGIDA'
        )
      ORDER BY ultima_nota DESC;
    `;

    return ranking;
  }
}

module.exports = rankingRepository