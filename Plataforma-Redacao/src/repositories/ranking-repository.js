const prisma = require("../database/db")

const rankingRepository = {
  listarRankingDeAlunos: async (turmaId, tipo) => {
    const rankTipo = tipo || 'redacoes_media';

    if (rankTipo === 'simulados') {
      if (turmaId) {
        return await prisma.$queryRaw`
          SELECT 
            u.id,
            u.nome,
            t.nome AS turma,
            ROUND(AVG(ns."notaGeral"))::integer AS ultima_nota
          FROM "Usuario" u
          JOIN "Turma" t ON u."turmaId" = t.id
          JOIN "NotasSimulado" ns ON u.id = ns."usuarioId"
          WHERE u."turmaId" = ${turmaId}
          GROUP BY u.id, u.nome, t.nome
          ORDER BY ultima_nota DESC;
        `;
      } else {
        return await prisma.$queryRaw`
          SELECT 
            u.id,
            u.nome,
            t.nome AS turma,
            ROUND(AVG(ns."notaGeral"))::integer AS ultima_nota
          FROM "Usuario" u
          JOIN "Turma" t ON u."turmaId" = t.id
          JOIN "NotasSimulado" ns ON u.id = ns."usuarioId"
          GROUP BY u.id, u.nome, t.nome
          ORDER BY ultima_nota DESC;
        `;
      }
    } else if (rankTipo === 'redacoes_ultima') {
      if (turmaId) {
        return await prisma.$queryRaw`
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
            AND u."turmaId" = ${turmaId}
            AND c."data" = (
              SELECT MAX(c2."data")
              FROM "Redacao" r2
              JOIN "Correcao" c2 ON r2.id = c2."redacaoId"
              WHERE r2."usuarioId" = u.id AND r2.status = 'CORRIGIDA'
            )
          ORDER BY ultima_nota DESC;
        `;
      } else {
        return await prisma.$queryRaw`
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
      }
    } else {
      // Default: redacoes_media (or 'notas')
      if (turmaId) {
        return await prisma.$queryRaw`
          SELECT 
            u.id,
            u.nome,
            t.nome AS turma,
            ROUND(AVG(c.nota))::integer AS ultima_nota
          FROM "Usuario" u
          JOIN "Turma" t ON u."turmaId" = t.id
          JOIN "Redacao" r ON u.id = r."usuarioId"
          JOIN "Correcao" c ON r.id = c."redacaoId"
          WHERE r.status = 'CORRIGIDA'
            AND u."turmaId" = ${turmaId}
          GROUP BY u.id, u.nome, t.nome
          ORDER BY ultima_nota DESC;
        `;
      } else {
        return await prisma.$queryRaw`
          SELECT 
            u.id,
            u.nome,
            t.nome AS turma,
            ROUND(AVG(c.nota))::integer AS ultima_nota
          FROM "Usuario" u
          JOIN "Turma" t ON u."turmaId" = t.id
          JOIN "Redacao" r ON u.id = r."usuarioId"
          JOIN "Correcao" c ON r.id = c."redacaoId"
          WHERE r.status = 'CORRIGIDA'
          GROUP BY u.id, u.nome, t.nome
          ORDER BY ultima_nota DESC;
        `;
      }
    }
  },
  listarRankingDeTurmas: async (tipo) => {
    const rankTipo = tipo || 'redacoes_media';

    if (rankTipo === 'simulados') {
      return await prisma.$queryRaw`
        SELECT 
          t.id,
          t.nome AS nome,
          ROUND(AVG(ns."notaGeral"))::integer AS ultima_nota
        FROM "Turma" t
        JOIN "Usuario" u ON u."turmaId" = t.id
        JOIN "NotasSimulado" ns ON u.id = ns."usuarioId"
        GROUP BY t.id, t.nome
        ORDER BY ultima_nota DESC;
      `;
    } else if (rankTipo === 'redacoes_ultima') {
      return await prisma.$queryRaw`
        SELECT 
          t.id,
          t.nome AS nome,
          ROUND(AVG(c.nota))::integer AS ultima_nota
        FROM "Turma" t
        JOIN "Usuario" u ON u."turmaId" = t.id
        JOIN "Redacao" r ON u.id = r."usuarioId"
        JOIN "Correcao" c ON r.id = c."redacaoId"
        WHERE r.status = 'CORRIGIDA'
          AND c."data" = (
            SELECT MAX(c2."data")
            FROM "Redacao" r2
            JOIN "Correcao" c2 ON r2.id = c2."redacaoId"
            WHERE r2."usuarioId" = u.id AND r2.status = 'CORRIGIDA'
          )
        GROUP BY t.id, t.nome
        ORDER BY ultima_nota DESC;
      `;
    } else {
      return await prisma.$queryRaw`
        SELECT 
          t.id,
          t.nome AS nome,
          ROUND(AVG(c.nota))::integer AS ultima_nota
        FROM "Turma" t
        JOIN "Usuario" u ON u."turmaId" = t.id
        JOIN "Redacao" r ON u.id = r."usuarioId"
        JOIN "Correcao" c ON r.id = c."redacaoId"
        WHERE r.status = 'CORRIGIDA'
        GROUP BY t.id, t.nome
        ORDER BY ultima_nota DESC;
      `;
    }
  }
}

module.exports = rankingRepository