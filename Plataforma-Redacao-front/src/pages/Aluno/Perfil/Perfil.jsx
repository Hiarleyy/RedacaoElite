"use client";

import { useState, useEffect, useMemo } from 'react';
import useUseful from '../../../utils/useUseful';
import useGamification from '../../../utils/useGamification';
import styles from "./styles.module.css";
import Title from "../../../components/Title/Title";
import fetchData from '../../../utils/fetchData';
import Pagination from '../../../components/Pagination/Pagination';
import InfoCard from '../../../components/infoCardRedacao/InfoCardRedacao';
import defaultProfilePicture from '../../../images/Defalult_profile_picture.jpg';
import RedacaoModal from '../../../components/RedacaoModal/RedacaoModal';
import Loading from '../../../components/Loading/Loading';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine, LabelList,
} from 'recharts';
import {
  Pencil,
  Trophy,
  Flame,
  Star,
  CheckCircle2,
  BarChart2,
  FileText,
  Crown,
  Lock,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  LayoutDashboard,
  Target,
  Lightbulb,
  Award,
} from 'lucide-react';

const baseURL = import.meta.env.VITE_API_BASE_URL

// ─── Componente: Avatar com Ring Animado ─────────────────────────────────────
const AvatarRing = ({ src, onError }) => (
  <div className={styles.avatar_wrapper}>
    <div className={styles.avatar_ring} />
    <div className={styles.avatar_ring_mask} />
    <img className={styles.img_container} src={src} alt="Foto de perfil" onError={onError} />
    <div className={styles.avatar_glow} />
  </div>
)

// ─── Componente: Barra de XP ─────────────────────────────────────────────────
const XPBar = ({ nivel }) => (
  <div className={styles.xp_section}>
    <div className={styles.xp_header}>
      <span className={styles.xp_label}>Progresso de XP</span>
      <span className={styles.xp_valor}>{nivel.xp} / 100 XP</span>
    </div>
    <div className={styles.xp_tooltip_wrapper}>
      <div className={styles.xp_bar_container}>
        <div
          className={styles.xp_bar_fill}
          style={{ width: `${nivel.progressoPct}%` }}
        />
      </div>
      {nivel.proximoNome && (
        <div className={styles.xp_tooltip}>
          {nivel.redacoesFaltam > 0
            ? `Envie ~${nivel.redacoesFaltam} redação(ões) para ${nivel.proximoNome}`
            : `Próximo nível: ${nivel.proximoNome}`
          }
        </div>
      )}
    </div>
    <div className={styles.xp_proximo}>
      <span>{nivel.progressoPct}% para o próximo nível</span>
      {nivel.proximoNome && (
        <span className={styles.xp_proximo_nome}>
          <Pencil size={10} />
          {nivel.proximoNome}
        </span>
      )}
    </div>
  </div>
)

// ─── Componente: Card Streak ─────────────────────────────────────────────────
const StreakCard = ({ streak }) => (
  <div className={styles.streak_card}>
    <div className={styles.streak_card_label}>
      <Flame size={12} className={styles.streak_label_icon} />
      <span>Sequência Atual</span>
    </div>
    <div className={styles.streak_header}>
      <span className={`${styles.streak_flame}`}>
        {streak.ativo ? '🔥' : '💤'}
      </span>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span className={styles.streak_numero}>{streak.semanas}</span>
          <span className={styles.streak_dias_text}>semanas</span>
        </div>
        <span className={styles.streak_sublabel}>
          {streak.ativo ? 'Sequência Ativa!' : 'Continue assim!'}
        </span>
      </div>
    </div>
    <div className={styles.streak_historico}>
      {streak.historicoSemanas.map((semana, i) => (
        <div key={i} className={styles.streak_dia}>
          <span className={styles.streak_dia_label}>{semana.label}</span>
          <div className={`${styles.streak_dot} ${semana.enviou ? styles.streak_dot_active : ''}`} />
        </div>
      ))}
    </div>
  </div>
)

// ─── Componente: Card Ranking ─────────────────────────────────────────────────
const RankCard = ({ rankInfo }) => (
  <div className={styles.rank_card}>
    <div className={styles.rank_card_label}>
      <Trophy size={12} className={styles.rank_label_icon} />
      <span>Posição no Ranking</span>
    </div>
    <div className={styles.rank_hexagon_wrapper}>
      <div className={styles.rank_hexagon}>
        <div className={styles.rank_hexagon_inner}>
          <span className={styles.rank_posicao_text}>
            {rankInfo?.posicao ? `#${rankInfo.posicao}` : '–'}
          </span>
        </div>
      </div>
      <div className={styles.rank_hexagon_glow} />
    </div>
    <span className={styles.rank_sem_dados}>
      {rankInfo?.posicao
        ? `Você está em ${rankInfo.posicao}º lugar`
        : 'Ainda sem posição\nno ranking'
      }
    </span>
  </div>
)

// ─── Componente: Badges ──────────────────────────────────────────────────────
const BadgesSection = ({ badges }) => (
  <div className={styles.badges_section}>
    <p className={styles.badges_titulo}>
      <Star size={13} className={styles.section_icon_gold} />
      Conquistas
    </p>
    <div className={styles.badges_grid}>
      {badges.map((badge, i) => (
        <div
          key={badge.id}
          className={`${styles.badge_item} ${badge.desbloqueado ? '' : styles.badge_locked}`}
          style={badge.desbloqueado ? { animationDelay: `${i * 0.08}s` } : {}}
          title={badge.desbloqueado ? badge.nome : badge.criterio}
        >
          {!badge.desbloqueado && (
            <Lock size={10} className={styles.badge_lock_icon_svg} />
          )}
          <span className={styles.badge_emoji}>{badge.emoji}</span>
          <span className={styles.badge_nome}>{badge.nome}</span>
          <span className={styles.badge_tooltip}>{badge.criterio}</span>
        </div>
      ))}
    </div>
  </div>
)

// ─── Componente: Métricas ─────────────────────────────────────────────────────
const MetricsBar = ({ todasRedacoes, redacoesCorrigidas }) => {
  const media = redacoesCorrigidas.length > 0
    ? (redacoesCorrigidas.reduce((acc, r) => acc + (r.correcao?.nota || 0), 0) / redacoesCorrigidas.length).toFixed(1)
    : '0'
  const nota1000 = redacoesCorrigidas.filter(r => r.correcao?.nota === 1000).length

  return (
    <div className={styles.metrics}>
      <div className={styles.metric_item}>
        <div className={styles.metric_icon_wrap} style={{ '--metric-color': '#DA9E00' }}>
          <FileText size={18} color='#DA9E00' />
        </div>
        <span className={styles.metric_label}>Total de Redações</span>
        <span className={styles.metric_value}>{todasRedacoes.length}</span>
      </div>
      <div className={styles.metric_item}>
        <div className={styles.metric_icon_wrap} style={{ color: '#22C55E' }}>
          <CheckCircle2 size={18} color='#22C55E' />
        </div>
        <span className={styles.metric_label}>Avaliadas</span>
        <span className={styles.metric_value}>{redacoesCorrigidas.length}</span>
      </div>
      <div className={styles.metric_item}>
        <div className={styles.metric_icon_wrap} style={{ '--metric-color': '#9B59B6' }}>
          <Star size={18} color='#9B59B6' />
        </div>
        <span className={styles.metric_label}>Nota 1000</span>
        <span className={styles.metric_value}>{nota1000}</span>
      </div>
      <div className={styles.metric_item}>
        <div className={styles.metric_icon_wrap} style={{ '--metric-color': '#4A9EFF' }}>
          <BarChart2 size={18} color='#4A9EFF' />
        </div>
        <span className={styles.metric_label}>Média Geral</span>
        <span className={styles.metric_value}>{media}</span>
      </div>
    </div>
  )
}

// ─── Componente: Empty State das Redações ─────────────────────────────────────
const EmptyRedacoes = () => (
  <div className={styles.empty_state}>
    <div className={styles.empty_chest_wrapper}>
      <div className={styles.empty_chest_glow} />
      <div className={styles.empty_chest_icon}>📦</div>
    </div>
    <h3 className={styles.empty_title}>NENHUMA REDAÇÃO AINDA</h3>
    <p className={styles.empty_subtitle}>
      Que tal começar agora? Escreva sua primeira redação
      e embarque nessa jornada rumo ao topo!
    </p>
    <button className={styles.empty_cta}>
      <Pencil size={15} />
      Escrever Minha Redação
    </button>
  </div>
)

// ─── Tooltip customizado dos gráficos ────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.chart_tooltip}>
      <span className={styles.chart_tooltip_label}>{label}</span>
      <span className={styles.chart_tooltip_value}>{payload[0].value} pts</span>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
const DashboardTab = ({ redacoesCorrigidas, todasRedacoes, rankInfo }) => {
  // ── KPI cards ──────────────────────────────────────────────────────────────
  const notas = redacoesCorrigidas.map(r => r.correcao?.nota || 0).filter(n => n > 0)
  const melhorNota  = notas.length ? Math.max(...notas) : 0
  const piorNota    = notas.length ? Math.min(...notas) : 0
  const mediaGeral  = notas.length ? (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(1) : '0'
  const tendencia   = (() => {
    if (notas.length < 2) return 'neutro'
    const ult3 = notas.slice(-3)
    if (ult3[ult3.length - 1] > ult3[0]) return 'subindo'
    if (ult3[ult3.length - 1] < ult3[0]) return 'caindo'
    return 'neutro'
  })()

  // ── Dados para o gráfico de linha (evolução temporal) ──────────────────────
  const evolucaoData = [...redacoesCorrigidas]
    .sort((a, b) => new Date(a.data) - new Date(b.data))
    .map((r, i) => ({
      name: `R${i + 1}`,
      nota: r.correcao?.nota || 0,
      data: new Date(r.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    }))

  // ── Dados para gráfico de barras agrupadas C1-C5 ────────────────────────────────
  // Campos reais no banco: competencia01, competencia02, ..., competencia05
  const COMP_CHAVES = ['competencia01', 'competencia02', 'competencia03', 'competencia04', 'competencia05']
  const COMP_NOMES  = ['C1 Norma', 'C2 Proposta', 'C3 Argumentos', 'C4 Coesão', 'C5 Intervenção']
  const compData = COMP_CHAVES.map((chave, i) => {
    const vals = redacoesCorrigidas
      .map(r => r.correcao?.[chave] ?? null)
      .filter(v => v !== null && v !== undefined)
    const media = vals.length
      ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
      : 0
    const min = vals.length ? Math.min(...vals) : 0
    const max = vals.length ? Math.max(...vals) : 0
    return {
      comp: COMP_NOMES[i],
      min: min,
      max: max,
      media: media,
    }
  })

  // ── Distribuição de notas por faixa ────────────────────────────────────────
  const faixas = [
    { label: '0–399',   cor: '#ef4444', count: 0 },
    { label: '400–599', cor: '#f97316', count: 0 },
    { label: '600–799', cor: '#eab308', count: 0 },
    { label: '800–899', cor: '#22c55e', count: 0 },
    { label: '900–999', cor: '#4A9EFF', count: 0 },
    { label: '1000',    cor: '#FFD700', count: 0 },
  ]
  notas.forEach(n => {
    if (n === 1000)     faixas[5].count++
    else if (n >= 900)  faixas[4].count++
    else if (n >= 800)  faixas[3].count++
    else if (n >= 600)  faixas[2].count++
    else if (n >= 400)  faixas[1].count++
    else                faixas[0].count++
  })

  // ── Heatmap das últimas 12 semanas ─────────────────────────────────────────
  const getWeekKey = (d) => {
    const date = new Date(d)
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(date.setDate(diff))
    return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`
  }
  const heatmapData = (() => {
    const counts = {}
    todasRedacoes.forEach(r => {
      const k = getWeekKey(r.data)
      counts[k] = (counts[k] || 0) + 1
    })
    const hoje = new Date()
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(hoje)
      d.setDate(hoje.getDate() - (11 - i) * 7)
      const k = getWeekKey(d)
      const count = counts[k] || 0
      const labelDate = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
      return { k, count, label: i === 11 ? 'Atual' : labelDate }
    })
  })()
  const maxCount = Math.max(...heatmapData.map(d => d.count), 1)

  // ── Insight automático ─────────────────────────────────────────────────────
  const insights = []
  if (notas.length === 0) {
    insights.push({ icon: '📝', text: 'Envie sua primeira redação para ver seu diagnóstico aqui!' })
  } else {
    if (tendencia === 'subindo') insights.push({ icon: '🚀', text: `Sua nota média subiu nas últimas redações. Continue assim!` })
    if (tendencia === 'caindo')  insights.push({ icon: '⚠️', text: `Sua nota caiu nas últimas redações. Revise seus textos mais recentes.` })
    const piorComp = [...compData].sort((a, b) => a.media - b.media)[0]
    if (piorComp?.media < 120) insights.push({ icon: '🎯', text: `Sua ${piorComp.comp} está em ${piorComp.media}pts. Esse é seu ponto a melhorar!` })
    if (melhorNota === 1000) insights.push({ icon: '🏆', text: 'Você já alcançou nota 1000! Você é Elite!' })
    if (notas.length < 3) insights.push({ icon: '📚', text: `Envie mais ${3 - notas.length} redação(ões) para desbloquear análises completas.` })
    if (rankInfo?.posicao) insights.push({ icon: '📊', text: `Você está na posição #${rankInfo.posicao} do ranking da plataforma!` })
  }

  if (redacoesCorrigidas.length === 0) {
    return (
      <div className={styles.dash_empty}>
        <div className={styles.dash_empty_icon}>📊</div>
        <h3>Nenhuma redação avaliada ainda</h3>
        <p>Envie sua primeira redação e aguarde a correção para ver seu dashboard completo!</p>
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>
      {/* ── KPI Cards ── */}
      <div className={styles.dash_kpi_grid}>
        <div className={styles.dash_kpi_card}>
          <div className={styles.dash_kpi_icon} style={{ '--kpi-color': '#FFD700' }}>
            <Award size={20} color="#FFD700" />
          </div>
          <span className={styles.dash_kpi_label}>Melhor Nota</span>
          <span className={styles.dash_kpi_value} style={{ color: '#FFD700' }}>{melhorNota}</span>
        </div>
        <div className={styles.dash_kpi_card}>
          <div className={styles.dash_kpi_icon} style={{ '--kpi-color': '#ef4444' }}>
            <Target size={20} color="#ef4444" />
          </div>
          <span className={styles.dash_kpi_label}>Pior Nota</span>
          <span className={styles.dash_kpi_value} style={{ color: '#ef4444' }}>{piorNota}</span>
        </div>
        <div className={styles.dash_kpi_card}>
          <div className={styles.dash_kpi_icon} style={{ '--kpi-color': '#4A9EFF' }}>
            <BarChart2 size={20} color="#4A9EFF" />
          </div>
          <span className={styles.dash_kpi_label}>Média Geral</span>
          <span className={styles.dash_kpi_value} style={{ color: '#4A9EFF' }}>{mediaGeral}</span>
        </div>
        <div className={styles.dash_kpi_card}>
          <div className={styles.dash_kpi_icon} style={{
            '--kpi-color': tendencia === 'subindo' ? '#22c55e' : tendencia === 'caindo' ? '#ef4444' : '#888'
          }}>
            {tendencia === 'subindo' ? <TrendingUp size={20} color="#22c55e" />
            : tendencia === 'caindo' ? <TrendingDown size={20} color="#ef4444" />
            : <Minus size={20} color="#888" />}
          </div>
          <span className={styles.dash_kpi_label}>Tendência</span>
          <span className={styles.dash_kpi_value} style={{
            color: tendencia === 'subindo' ? '#22c55e' : tendencia === 'caindo' ? '#ef4444' : '#888',
            fontSize: 13
          }}>
            {tendencia === 'subindo' ? '↑ Subindo' : tendencia === 'caindo' ? '↓ Caindo' : '→ Estável'}
          </span>
        </div>
      </div>

      {/* ── Linha: Evolução da Nota ── */}
      <div className={styles.dash_section}>
        <h4 className={styles.dash_section_title}>
          <TrendingUp size={15} /> Evolução da Nota
        </h4>
        <div className={styles.dash_chart_wrapper}>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={evolucaoData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="data" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 1000]} tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={1000} stroke="rgba(255,215,0,0.3)" strokeDasharray="4 4" label={{ value: 'Meta 1000', fill: '#FFD700', fontSize: 9, position: 'insideTopRight' }} />
              <Line
                type="monotone" dataKey="nota" stroke="#FFD700"
                strokeWidth={2.5} dot={{ r: 4, fill: '#FFD700', stroke: '#0d0d0d', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#FFD700', stroke: '#0d0d0d' }}
                animationDuration={1200} animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Competências ENEM (barras agrupadas) ── */}
      <div className={styles.dash_section}>
        <h4 className={styles.dash_section_title}>
          <Star size={15} /> Competências ENEM — Média por Competência
        </h4>
        <div className={styles.dash_chart_wrapper}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={compData}
              margin={{ top: 16, right: 12, left: -16, bottom: 0 }}
              barGap={4}
              barCategoryGap="28%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="comp"
                tick={{ fill: '#aaa', fontSize: 9, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 200]}
                tick={{ fill: '#555', fontSize: 9 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <div className={styles.chart_tooltip}>
                      <span className={styles.chart_tooltip_label}>{label}</span>
                      {payload.map((entry, idx) => (
                        <span key={idx} className={styles.chart_tooltip_value} style={{ color: entry.color, fontSize: 11, fontWeight: 600 }}>
                          {entry.name}: {entry.value} pts
                        </span>
                      ))}
                    </div>
                  ) : null
                }
              />
              <Bar dataKey="min" fill="#555555" name="Mínima" radius={[4, 4, 0, 0]} animationDuration={1000} barSize={8} />
              <Bar dataKey="max" fill="#FFD700" name="Máxima" radius={[4, 4, 0, 0]} animationDuration={1000} barSize={8} />
              <Bar dataKey="media" fill="#4A9EFF" name="Média" radius={[4, 4, 0, 0]} animationDuration={1000} barSize={8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Legenda manual */}
        <div className={styles.comp_legenda}>
          <div className={styles.comp_legenda_item}>
            <span className={styles.comp_legenda_dot} style={{ background: '#555555' }} />
            <span className={styles.comp_legenda_label}>Mínima</span>
          </div>
          <div className={styles.comp_legenda_item}>
            <span className={styles.comp_legenda_dot} style={{ background: '#FFD700' }} />
            <span className={styles.comp_legenda_label}>Máxima</span>
          </div>
          <div className={styles.comp_legenda_item}>
            <span className={styles.comp_legenda_dot} style={{ background: '#4A9EFF' }} />
            <span className={styles.comp_legenda_label}>Média</span>
          </div>
        </div>
      </div>

        {/* Distribuição de Notas */}
        <div className={styles.dash_section}>
          <h4 className={styles.dash_section_title}>
            <BarChart2 size={15} /> Distribuição de Notas
          </h4>
          <div className={styles.dash_chart_wrapper}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={faixas} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#666', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#666', fontSize: 9 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <div className={styles.chart_tooltip}>
                      <span className={styles.chart_tooltip_label}>{label}</span>
                      <span className={styles.chart_tooltip_value}>{payload[0].value} redação(ões)</span>
                    </div>
                  ) : null
                } />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} animationDuration={1000}>
                  {faixas.map((f, i) => <Cell key={i} fill={f.cor} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      {/* ── Heatmap Semanal ── */}
      <div className={styles.dash_section}>
        <h4 className={styles.dash_section_title}>
          <Flame size={15} /> Frequência de Envios (últimas 12 semanas)
        </h4>
        <div className={styles.dash_heatmap}>
          {heatmapData.map((w, i) => {
            const intensity = w.count === 0 ? 0 : Math.min(1, w.count / maxCount)
            const bg = w.count === 0
              ? 'rgba(255,255,255,0.04)'
              : `rgba(255, 215, 0, ${0.15 + intensity * 0.75})`
            return (
              <div key={i} className={styles.dash_heatmap_cell} style={{ background: bg }} title={`${w.label}: ${w.count} redação(ões)`}>
                <span className={styles.dash_heatmap_label}>{w.label}</span>
                {w.count > 0 && <span className={styles.dash_heatmap_count}>{w.count}</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Insights Automáticos ── */}
      <div className={styles.dash_section}>
        <h4 className={styles.dash_section_title}>
          <Lightbulb size={15} /> Insights
        </h4>
        <div className={styles.dash_insights}>
          {insights.map((ins, i) => (
            <div key={i} className={styles.dash_insight_item} style={{ animationDelay: `${i * 0.1}s` }}>
              <span className={styles.dash_insight_icon}>{ins.icon}</span>
              <span className={styles.dash_insight_text}>{ins.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
const Perfil = () => {
  const [usuario, setUsuario] = useState({})
  const [activeTab, setActiveTab] = useState('minhas')
  const [redacoes, setRedacoes] = useState([])
  const [redacoesCorrigidas, setRedacoesCorrigidas] = useState([])
  const [ranking, setRanking] = useState([])
  const [, setIsMobile] = useState(window.innerWidth <= 768)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedRedacao, setSelectedRedacao] = useState(null)

  const { brasilFormatData } = useUseful()
  const { calcularXP, calcularNivel, calcularStreak, calcularBadges, calcularRankInfo } = useGamification()

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentRedacoes = redacoes.slice(indexOfFirstItem, indexOfLastItem)
  const currentRedacoesCorrigidas = redacoesCorrigidas.slice(indexOfFirstItem, indexOfLastItem)

  const getAlunoId = () => {
    const aluno = localStorage.getItem('user_access_data')
    const { id } = JSON.parse(aluno)
    return id
  }

  const handleRedacaoClick = (redacao) => {
    setSelectedRedacao(redacao)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedRedacao(null)
  }

  const handleImageError = (e) => {
    e.target.src = defaultProfilePicture
  }

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const getData = async () => {
      const { getRedacoes, getAlunoById, getRanking } = fetchData()
      const alunoId = getAlunoId()

      try {
        const [responsePendentes, responseCorrigidas, responseAluno, responseRanking] = await Promise.all([
          getRedacoes(alunoId, false, true),
          getRedacoes(alunoId, true),
          getAlunoById(alunoId),
          getRanking('', 'redacoes_media', 'alunos').catch(() => []),
        ])

        setRedacoes(responsePendentes || [])
        setRedacoesCorrigidas(responseCorrigidas || [])
        setUsuario(responseAluno || {})
        setRanking(responseRanking || [])
      } finally {
        setLoading(false)
      }
    }

    getData()
  }, [])

  // ── Cálculos de gamificação (memoizados) ────────────────────────────────
  const todasRedacoes = useMemo(
    () => [...redacoes, ...redacoesCorrigidas],
    [redacoes, redacoesCorrigidas]
  )

  const xp = useMemo(() => calcularXP(todasRedacoes, redacoesCorrigidas), [todasRedacoes, redacoesCorrigidas])
  const nivel = useMemo(() => calcularNivel(xp), [xp])
  const streak = useMemo(() => calcularStreak(todasRedacoes), [todasRedacoes])
  const badges = useMemo(() => calcularBadges(todasRedacoes, redacoesCorrigidas), [todasRedacoes, redacoesCorrigidas])
  const rankInfo = useMemo(() => calcularRankInfo(ranking, usuario.id), [ranking, usuario.id])

  const avatarSrc = usuario.caminho
    ? `${baseURL}/usuarios/${usuario.id}/profile-image`
    : defaultProfilePicture

  return (
    <div className={styles.container}>
      <Title title="Perfil" />
      <div className={styles.main_content}>

        {/* ═══ CARD PERFIL (esquerda) ═══ */}
        <div className={styles.perfil}>

          {/* Badge de coroa no canto */}
          <div className={styles.crown_badge}>
            <Crown size={18} className={styles.crown_icon} />
            <span className={styles.crown_level}>{nivel.nivel}</span>
          </div>

          {/* 1. HERO — Avatar + Nível + XP */}
          <div className={styles.hero_section}>
            <AvatarRing src={avatarSrc} onError={handleImageError} />

            <div className={styles.nivel_badge}>
              <span className={styles.nivel_emoji}>{nivel.emoji}</span>
              <span>Nível {nivel.nivel}</span>
              <span className={styles.nivel_sep}>—</span>
              <span className={styles.nivel_nome}>{nivel.nome}</span>
            </div>

            <div className={styles.usuario_nome_wrap}>
              <h3 className={styles.usuario_nome}>{usuario.nome || 'Carregando...'}</h3>
              <Pencil size={14} className={styles.edit_icon} />
            </div>
          

            {!loading && <XPBar nivel={nivel} />}
          </div>

          {/* 2. STREAK + RANK CARDS */}
          {!loading && (
            <div className={styles.streak_rank_section}>
              <StreakCard streak={streak} />
              <RankCard rankInfo={rankInfo} />
            </div>
          )}

          {/* 3. BADGES */}
          {!loading && (
            <BadgesSection badges={badges} />
          )}

          {/* 4. MÉTRICAS */}
          {!loading && (
            <MetricsBar todasRedacoes={todasRedacoes} redacoesCorrigidas={redacoesCorrigidas} />
          )}
        </div>

        {/* ═══ REDAÇÕES (direita) ═══ */}
        <div className={styles.aba_redacoes}>
          <div className={styles.menu_redacoes}>
            <div className={styles.tab_buttons}>
              <button
                className={`${styles.tab_button} ${activeTab === 'minhas' ? styles.active_tab : ''}`}
                onClick={() => setActiveTab('minhas')}
              >
                <FileText size={16} />
                Minhas Redações
              </button>
              <button
                className={`${styles.tab_button} ${activeTab === 'avaliadas' ? styles.active_tab : ''}`}
                onClick={() => setActiveTab('avaliadas')}
              >
                <CheckCircle2 size={16} />
                Redações Avaliadas
              </button>
              <button
                className={`${styles.tab_button} ${activeTab === 'dashboard' ? styles.active_tab : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </button>
            </div>

            <div className={styles.tab_content}>
              {loading ? (
                <div className={styles.loading_container}>
                  <Loading size="50px" />
                </div>
              ) : activeTab === 'minhas' ? (
                <div className={styles.minhas_redacoes}>
                  {currentRedacoes.length === 0 ? (
                    <EmptyRedacoes />
                  ) : (
                    <>
                      <div className={styles.cards_container}>
                        {currentRedacoes.map((redacao) => (
                          <div key={redacao.id} onClick={() => handleRedacaoClick(redacao)} className={styles.card_clickable}>
                            <InfoCard
                              title={redacao.titulo}
                              subtitle={brasilFormatData(redacao.data)}
                              button={false}
                              img="https://static.vecteezy.com/system/resources/previews/028/049/250/non_2x/terms-icon-design-vector.jpg"
                            />
                          </div>
                        ))}
                      </div>
                      <div className={styles.pagination_container}>
                        <Pagination
                          currentPage={currentPage}
                          totalItems={redacoes.length}
                          itemsPerPage={itemsPerPage}
                          setCurrentPage={setCurrentPage}
                        />
                      </div>
                    </>
                  )}
                </div>
              ) : activeTab === 'dashboard' ? (
                <DashboardTab
                  redacoesCorrigidas={redacoesCorrigidas}
                  todasRedacoes={todasRedacoes}
                  rankInfo={rankInfo}
                />
              ) : (
                <div className={styles.redacoes_avaliadas}>
                  {currentRedacoesCorrigidas.length === 0 ? (
                    <EmptyRedacoes />
                  ) : (
                    <>
                      <div className={styles.cards_container}>
                        {currentRedacoesCorrigidas.map((redacao) => (
                          <div key={redacao.id} onClick={() => handleRedacaoClick(redacao)} className={styles.card_clickable}>
                            <InfoCard
                              title={redacao.titulo}
                              subtitle={brasilFormatData(redacao.data)}
                              button={false}
                              img="https://static.vecteezy.com/system/resources/previews/028/049/250/non_2x/terms-icon-design-vector.jpg"
                            />
                          </div>
                        ))}
                      </div>
                      <div className={styles.pagination_container}>
                        <Pagination
                          currentPage={currentPage}
                          totalItems={redacoesCorrigidas.length}
                          itemsPerPage={itemsPerPage}
                          setCurrentPage={setCurrentPage}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de redação */}
      <RedacaoModal
        redacao={selectedRedacao}
        isOpen={modalOpen}
        onClose={closeModal}
        activeTab={activeTab}
        brasilFormatData={brasilFormatData}
      />
    </div>
  )
}

export default Perfil
