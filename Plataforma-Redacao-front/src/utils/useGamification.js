// ─────────────────────────────────────────────────────────────────────────────
// useGamification.js
// Lógica de gamificação 100% frontend — calcula XP, nível, streak,
// badges, competências C1-C5 e posição no ranking a partir dos dados
// de redações já existentes. Nenhuma alteração no backend necessária.
// ─────────────────────────────────────────────────────────────────────────────

const NIVEIS = [
  { nivel: 1, nome: 'Iniciante',  emoji: '🌱', xpMin: 0,    xpMax: 199   },
  { nivel: 2, nome: 'Escritor',   emoji: '✏️', xpMin: 200,  xpMax: 499   },
  { nivel: 3, nome: 'Redator',    emoji: '📖', xpMin: 500,  xpMax: 999   },
  { nivel: 4, nome: 'Eloquente',  emoji: '🎯', xpMin: 1000, xpMax: 1999  },
  { nivel: 5, nome: 'Mestre',     emoji: '🏅', xpMin: 2000, xpMax: 3999  },
  { nivel: 6, nome: 'Elite',      emoji: '👑', xpMin: 4000, xpMax: Infinity },
]

// ─── XP ──────────────────────────────────────────────────────────────────────
const calcularXP = (redacoes = [], corrigidas = []) => {
  const somaNotas = corrigidas.reduce((acc, r) => acc + (r.correcao?.nota || 0), 0)
  return Math.floor(
    redacoes.length * 50 +
    corrigidas.length * 100 +
    somaNotas * 0.1
  )
}

// ─── Nível ───────────────────────────────────────────────────────────────────
const calcularNivel = (xp) => {
  const nivelAtual = NIVEIS.findLast(n => xp >= n.xpMin) || NIVEIS[0]
  const proximoNivel = NIVEIS.find(n => n.nivel === nivelAtual.nivel + 1)

  const xpDentroNivel = xp - nivelAtual.xpMin
  const xpParaProximo = proximoNivel
    ? proximoNivel.xpMin - nivelAtual.xpMin
    : null
  const progressoPct = proximoNivel
    ? Math.min(100, Math.floor((xpDentroNivel / xpParaProximo) * 100))
    : 100

  // Calcula quantas redações faltam para o próximo nível
  // Cada redação vale ~150 XP (50 envio + 100 corrigida)
  const xpFaltando = proximoNivel ? proximoNivel.xpMin - xp : 0
  const redacoesFaltam = proximoNivel ? Math.ceil(xpFaltando / 150) : 0

  return {
    ...nivelAtual,
    xp,
    xpProximo: proximoNivel?.xpMin ?? null,
    proximoNome: proximoNivel?.nome ?? null,
    progressoPct,
    redacoesFaltam,
  }
}

// ─── Streak ──────────────────────────────────────────────────────────────────
const calcularStreak = (redacoes = []) => {
  const getWeekKey = (d) => {
    const date = new Date(d)
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(date.setDate(diff))
    return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`
  }

  // Agrupa datas de envio por "Semana"
  const semanasEnvio = new Set(
    redacoes.map(r => getWeekKey(r.data))
  )

  // Histórico das últimas 8 semanas
  const hoje = new Date()
  const historicoSemanas = Array.from({ length: 8 }, (_, i) => {
    const d = new Date(hoje)
    d.setDate(hoje.getDate() - (7 - i) * 7)
    const key = getWeekKey(d)
    const label = i === 7 ? 'Atual' : `S${i + 1}`
    return { key, label, enviou: semanasEnvio.has(key) }
  })

  // Conta streak consecutivo de semanas retroativamente
  let semanas = 0
  for (let i = 0; i <= 52; i++) { // verifica até 1 ano atrás
    const d = new Date(hoje)
    d.setDate(hoje.getDate() - i * 7)
    const key = getWeekKey(d)
    if (semanasEnvio.has(key)) {
      semanas++
    } else if (i === 0) {
      // Se não enviou na semana atual ainda, verifica a passada para não quebrar
      continue
    } else {
      break
    }
  }

  if (semanas > 0) {
    localStorage.setItem('gamification_streak_semanas', semanas)
  }
  
  // Ativo se enviou esta semana ou na semana passada
  const ativo = historicoSemanas[7].enviou || historicoSemanas[6].enviou

  return { semanas, ativo, historicoSemanas }
}

// ─── Badges ──────────────────────────────────────────────────────────────────
const calcularBadges = (redacoes = [], corrigidas = []) => {
  const totalRedacoes = redacoes.length
  const totalCorrigidas = corrigidas.length
  const nota1000Count = corrigidas.filter(r => r.correcao?.nota === 1000).length
  const media = totalCorrigidas > 0
    ? corrigidas.reduce((acc, r) => acc + (r.correcao?.nota || 0), 0) / totalCorrigidas
    : 0

  // Verifica "Evoluindo": nota melhorou 3x seguidas
  const notasOrdenadas = [...corrigidas]
    .sort((a, b) => new Date(a.data) - new Date(b.data))
    .map(r => r.correcao?.nota || 0)
  let melhoras = 0
  let evoluindo = false
  for (let i = 1; i < notasOrdenadas.length; i++) {
    if (notasOrdenadas[i] > notasOrdenadas[i - 1]) {
      melhoras++
      if (melhoras >= 3) { evoluindo = true; break }
    } else {
      melhoras = 0
    }
  }

  // Streak para badge "Em Chamas"
  const { semanas: streakSemanas } = calcularStreak(redacoes)

  return [
    {
      id: 'primeira_redacao',
      nome: 'Primeira Redação',
      emoji: '🥇',
      desbloqueado: totalRedacoes >= 1,
      criterio: 'Envie sua 1ª redação',
    },
    {
      id: 'nota_1000',
      nome: 'Nota 1000',
      emoji: '⭐',
      desbloqueado: nota1000Count >= 1,
      criterio: 'Alcance nota máxima em uma redação',
    },
    {
      id: 'maratonista',
      nome: 'Maratonista',
      emoji: '📚',
      desbloqueado: totalRedacoes >= 10,
      criterio: 'Envie 10 redações',
    },
    {
      id: 'em_chamas',
      nome: 'Em Chamas',
      emoji: '🔥',
      desbloqueado: streakSemanas >= 8,
      criterio: 'Envie redações por 8 semanas seguidas',
    },
    {
      id: 'evoluindo',
      nome: 'Evoluindo',
      emoji: '📈',
      desbloqueado: evoluindo,
      criterio: 'Melhore sua nota 3x consecutivas',
    },
    {
      id: 'elite',
      nome: 'Elite',
      emoji: '🏆',
      desbloqueado: media >= 900,
      criterio: 'Alcance média acima de 900 pontos',
    },
  ]
}

// ─── Competências C1-C5 ───────────────────────────────────────────────────────
// Campos reais no banco (schema Prisma): competencia01 … competencia05
const calcularCompetencias = (corrigidas = []) => {
  const NOMES_C = [
    'Domínio da norma culta',
    'Compreensão da proposta',
    'Seleção de argumentos',
    'Coesão textual',
    'Proposta de intervenção',
  ]
  const CORES_C  = ['#4A9EFF', '#DA9E00', '#22C55E', '#FF6B35', '#A855F7']
  const CHAVES_C = ['competencia01', 'competencia02', 'competencia03', 'competencia04', 'competencia05']

  // Verifica se ao menos uma correção tem os campos preenchidos
  const temCompetencias = corrigidas.some(
    r => CHAVES_C.some(k => r.correcao?.[k] != null)
  )

  if (temCompetencias) {
    return CHAVES_C.map((chave, i) => {
      const valores = corrigidas
        .map(r => r.correcao?.[chave] ?? null)
        .filter(v => v !== null && v !== undefined)
      const media = valores.length > 0
        ? Math.round(valores.reduce((a, b) => a + b, 0) / valores.length)
        : 0
      return { nome: NOMES_C[i], valor: media, max: 200, cor: CORES_C[i], label: `C${i + 1}` }
    })
  }

  // Fallback: usa a média geral (nota total / 5 = estimativa por competência)
  if (corrigidas.length > 0) {
    const mediaGeral = corrigidas.reduce((acc, r) => acc + (r.correcao?.nota || 0), 0) / corrigidas.length
    return NOMES_C.map((nome, i) => ({
      nome,
      valor: Math.round(mediaGeral / 5),
      max: 200,
      cor: CORES_C[i],
      label: `C${i + 1}`,
    }))
  }

  return NOMES_C.map((nome, i) => ({
    nome, valor: 0, max: 200, cor: CORES_C[i], label: `C${i + 1}`,
  }))
}

// ─── Ranking ─────────────────────────────────────────────────────────────────
const calcularRankInfo = (ranking = [], userId) => {
  const top3 = ranking.slice(0, 3)
  const userIndex = ranking.findIndex(r => r.id === userId)
  const posicao = userIndex !== -1 ? userIndex + 1 : null
  const pontuacao = userIndex !== -1 ? ranking[userIndex].ultima_nota : null

  return { top3, posicao, pontuacao }
}

// ─── Export ──────────────────────────────────────────────────────────────────
const useGamification = () => ({
  calcularXP,
  calcularNivel,
  calcularStreak,
  calcularBadges,
  calcularCompetencias,
  calcularRankInfo,
})

export default useGamification
