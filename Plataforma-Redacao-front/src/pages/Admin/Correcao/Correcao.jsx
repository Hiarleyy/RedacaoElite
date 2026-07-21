import styles from "./styles.module.css"
import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import fetchData from "../../../utils/fetchData"
import CorrecaoModal from "../../../components/CorrecaoModal/CorrecaoModal"
import Title from "../../../components/Title/Title"
import DownloadZipModal from "../../../components/DownloadZipModal/DownloadZipModal"

const ITEMS_PER_PAGE = 5

const tempoDecorrido = (dataStr) => {
  if (!dataStr) return ""
  const agora = new Date()
  const data = new Date(dataStr)
  const diffMs = agora - data
  const diffH = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffH < 1) return "Há menos de 1 hora"
  if (diffH === 1) return "Há 1 hora"
  if (diffH < 24) return `Há ${diffH} horas`
  const diffD = Math.floor(diffH / 24)
  if (diffD === 1) return "Há 1 dia"
  return `Há ${diffD} dias`
}

const formatDataHora = (dataStr) => {
  if (!dataStr) return "—"
  const d = new Date(dataStr)
  return d.toLocaleDateString("pt-BR") + " às " +
    d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

// ── Paginação ──────────────────────────────────────────────────────
const Pagination = ({ current, total, perPage, onChange }) => {
  const totalPages = Math.ceil(total / perPage)
  if (totalPages <= 1) return null

  const first = (current - 1) * perPage + 1
  const last = Math.min(current * perPage, total)

  const pages = () => {
    const arr = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) arr.push(i)
      return arr
    }
    arr.push(1)
    if (current > 3) arr.push("...")
    for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) arr.push(i)
    if (current < totalPages - 2) arr.push("...")
    arr.push(totalPages)
    return arr
  }

  return (
    <div className={styles.paginacao}>
      <span className={styles.paginacao_info}>
        Mostrando {first} a {last} de {total} redações
      </span>
      <div className={styles.paginacao_btns}>
        <button
          className={styles.pag_btn}
          onClick={() => onChange(current - 1)}
          disabled={current === 1}
        >
          <i className="fa-solid fa-chevron-left" />
        </button>
        {pages().map((p, i) =>
          p === "..." ? (
            <span key={`e${i}`} className={styles.pag_ellipsis}>…</span>
          ) : (
            <button
              key={p}
              className={`${styles.pag_btn} ${p === current ? styles.pag_active : ""}`}
              onClick={() => onChange(p)}
            >
              {p}
            </button>
          )
        )}
        <button
          className={styles.pag_btn}
          onClick={() => onChange(current + 1)}
          disabled={current === totalPages}
        >
          <i className="fa-solid fa-chevron-right" />
        </button>
      </div>
    </div>
  )
}

// ── Card de Redação Pendente ───────────────────────────────────────
const CardPendente = ({ redacao, onClick }) => (
  <div className={`${styles.card} ${styles.card_pendente}`} onClick={onClick}>
    <div className={styles.card_left}>
      <p className={styles.card_titulo}>{redacao.titulo}</p>
      <p className={styles.card_aluno}>
        <span className={styles.aluno_nome}>{redacao?.usuario?.nome}</span>
        {redacao?.usuario?.turma?.nome && (
          <span className={styles.card_turma}> • {redacao.usuario.turma.nome}</span>
        )}
      </p>
      <p className={styles.card_data}>
        <i className="fa-regular fa-clock" style={{ marginRight: "6px", color: "rgba(245, 158, 11, 0.7)" }} />
        {formatDataHora(redacao.data)}
      </p>
    </div>
    <div className={styles.card_right}>
      <div className={styles.card_tempo}>
        <i className="fa-regular fa-calendar" />
        <span>{tempoDecorrido(redacao.data)}</span>
      </div>
    </div>
  </div>
)

// ── Card de Redação Corrigida ──────────────────────────────────────
const CardCorrigida = ({ redacao, onView }) => (
  <div className={`${styles.card} ${styles.card_corrigida}`}>
    <div className={styles.card_left}>
      <p className={styles.card_titulo}>{redacao.titulo}</p>
      <p className={styles.card_aluno}>
        <span className={styles.aluno_nome}>{redacao?.usuario?.nome}</span>
        {redacao?.usuario?.turma?.nome && (
          <span className={styles.card_turma}> • {redacao.usuario.turma.nome}</span>
        )}
      </p>
      <p className={styles.card_data}>
        <i className="fa-regular fa-calendar-check" style={{ marginRight: "6px", color: "rgba(34, 197, 94, 0.7)" }} />
        {formatDataHora(redacao.data)}
      </p>
    </div>
    <div className={styles.card_right}>
      <span className={styles.badge_corrigida}>
        <i className="fa-solid fa-circle-check" /> Corrigida
      </span>
      <button
        className={styles.btn_view}
        title="Ver detalhes"
        onClick={() => onView(redacao)}
      >
        <i className="fa-regular fa-eye" />
      </button>
    </div>
  </div>
)

// ── Componente Principal ───────────────────────────────────────────
const Correcao = () => {
  const navigate = useNavigate()
  const [pendentes, setPendentes] = useState([])
  const [corrigidas, setCorrigidas] = useState([])
  const [turmas, setTurmas] = useState([])
  const [propostas, setPropostas] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Filtros
  const [busca, setBusca] = useState("")
  const [situacao, setSituacao] = useState("todas")
  const [turmaFiltro, setTurmaFiltro] = useState("")
  const [dataFiltroInicio, setDataFiltroInicio] = useState("")
  const [dataFiltroFim, setDataFiltroFim] = useState("")

  // Paginação
  const [pagePen, setPagePen] = useState(1)
  const [pageCorr, setPageCorr] = useState(1)

  // Modal
  const [modalData, setModalData] = useState({})
  const [modalOpen, setModalOpen] = useState(false)

  // Modal de download ZIP
  const [downloadModalOpen, setDownloadModalOpen] = useState(false)

  // Temas vindos das propostas cadastradas (campo `tema`), ordenados alfabeticamente
  const temas = useMemo(() => {
    return propostas
      .map((p) => p.tema)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "pt-BR"))
  }, [propostas])

  useEffect(() => {
    const load = async () => {
      try {
        const { getRedacoes, getTurmas, getPropostas } = fetchData()
        const [penResp, corrResp, turmasResp, propostasResp] = await Promise.all([
          getRedacoes(false, false, true),
          getRedacoes(false, true),
          getTurmas(),
          getPropostas(),
        ])
        setPendentes(penResp || [])
        setCorrigidas(corrResp || [])
        setTurmas(turmasResp || [])
        setPropostas(propostasResp || [])
      } catch (e) {
        console.error("Erro ao carregar dados:", e)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const filtrar = (lista) => {
    return lista.filter((r) => {
      const textoBusca = busca.toLowerCase()
      const matchBusca =
        !busca ||
        r.titulo?.toLowerCase().includes(textoBusca) ||
        r?.usuario?.nome?.toLowerCase().includes(textoBusca)

      const matchTurma =
        !turmaFiltro || r?.usuario?.turmaId === turmaFiltro

      const data = r.data ? new Date(r.data) : null
      const matchInicio = !dataFiltroInicio || (data && data >= new Date(dataFiltroInicio))
      const matchFim = !dataFiltroFim || (data && data <= new Date(dataFiltroFim + "T23:59:59"))

      return matchBusca && matchTurma && matchInicio && matchFim
    })
  }

  const pendentesFiltradas = useMemo(() => filtrar(pendentes), [pendentes, busca, turmaFiltro, dataFiltroInicio, dataFiltroFim])
  const corrigidasFiltradas = useMemo(() => filtrar(corrigidas), [corrigidas, busca, turmaFiltro, dataFiltroInicio, dataFiltroFim])

  const penPaginadas = pendentesFiltradas.slice((pagePen - 1) * ITEMS_PER_PAGE, pagePen * ITEMS_PER_PAGE)
  const corrPaginadas = corrigidasFiltradas.slice((pageCorr - 1) * ITEMS_PER_PAGE, pageCorr * ITEMS_PER_PAGE)

  const limparFiltros = () => {
    setBusca("")
    setSituacao("todas")
    setTurmaFiltro("")
    setDataFiltroInicio("")
    setDataFiltroFim("")
    setPagePen(1)
    setPageCorr(1)
  }

  const totalRedacoes = pendentes.length + corrigidas.length

  return (
    <div className={styles.container}>
      <CorrecaoModal
        modalData={modalData}
        modalIsClicked={modalOpen}
        setModalIsClicked={setModalOpen}
      />

      <DownloadZipModal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        turmas={turmas}
        temas={temas}
      />
      <Title title="Correção" />

      <div className={styles.content_wrapper}>
        {/* ── Filtros Avançados ── */}
        <div className={styles.filtros_card}>
        <div className={styles.filtros_header}>
          <i className="fa-solid fa-filter" />
          <span>Filtros avançados</span>
        </div>

        <div className={styles.filtros_row}>
          <div className={styles.filtro_group} style={{ flex: 2 }}>
            <label className={styles.filtro_label}>Busca por tema ou aluno</label>
            <div className={styles.input_icon_wrap}>
              <input
                className={styles.filtro_input}
                type="text"
                placeholder="Digite o nome do tema ou aluno..."
                value={busca}
                onChange={(e) => { setBusca(e.target.value); setPagePen(1); setPageCorr(1) }}
              />
              <i className="fa-solid fa-magnifying-glass" />
            </div>
          </div>

          <div className={styles.filtro_group}>
            <label className={styles.filtro_label}>Período de publicação</label>
            <div className={styles.date_range}>
              <div className={styles.input_icon_wrap}>
                <input
                  className={styles.filtro_input}
                  type="date"
                  value={dataFiltroInicio}
                  onChange={(e) => { setDataFiltroInicio(e.target.value); setPagePen(1); setPageCorr(1) }}
                />
              </div>
              <span className={styles.date_sep}>até</span>
              <div className={styles.input_icon_wrap}>
                <input
                  className={styles.filtro_input}
                  type="date"
                  value={dataFiltroFim}
                  onChange={(e) => { setDataFiltroFim(e.target.value); setPagePen(1); setPageCorr(1) }}
                />
              </div>
            </div>
          </div>

          <div className={styles.filtro_group}>
            <label className={styles.filtro_label}>Situação</label>
            <select
              className={styles.filtro_select}
              value={situacao}
              onChange={(e) => setSituacao(e.target.value)}
            >
              <option value="todas">Todas</option>
              <option value="pendente">Pendentes</option>
              <option value="corrigida">Corrigidas</option>
            </select>
          </div>
        </div>

        <div className={styles.filtros_row}>
          <div className={styles.filtro_group}>
            <label className={styles.filtro_label}>Turma</label>
            <select
              className={styles.filtro_select}
              value={turmaFiltro}
              onChange={(e) => { setTurmaFiltro(e.target.value); setPagePen(1); setPageCorr(1) }}
            >
              <option value="">Todas as turmas</option>
              {turmas.map((t) => (
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </select>
          </div>

          <div className={styles.filtro_group} style={{ justifyContent: "flex-end" }}>
            <label className={`${styles.filtro_label} ${styles.desktop_only_label}`}>&nbsp;</label>
            <button className={styles.btn_limpar} onClick={limparFiltros}>
              <i className="fa-solid fa-rotate-left" /> Limpar filtros
            </button>
          </div>

          <div className={styles.filtro_group} style={{ flexShrink: 0 }}>
            <label className={`${styles.filtro_label} ${styles.desktop_only_label}`}>&nbsp;</label>
            <button
              className={styles.btn_download_all}
              onClick={() => setDownloadModalOpen(true)}
              disabled={isLoading}
            >
              <i className="fa-solid fa-file-zipper" />
              <div>
                <span className={styles.btn_download_title}>Baixar redações (.zip)</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ── Painéis ── */}
      <div className={styles.paineis}>

        {/* Pendentes */}
        {(situacao === "todas" || situacao === "pendente") && (
          <div className={`${styles.painel} ${styles.painel_pendente}`}>
            <div className={styles.painel_header}>
              <div className={styles.painel_title_row}>
                <i className="fa-regular fa-clock" style={{ color: "#f59e0b" }} />
                <h2 className={styles.painel_title}>Redações Pendentes</h2>
                <span className={styles.badge_count_pen}>{pendentesFiltradas.length}</span>
              </div>
              <p className={styles.painel_subtitle}>Redações aguardando correção</p>
            </div>

            <div className={styles.painel_body}>
              {isLoading ? (
                <div className={styles.loading_state}>
                  <i className="fa-solid fa-spinner fa-spin" />
                  <span>Carregando...</span>
                </div>
              ) : pendentesFiltradas.length === 0 ? (
                <div className={styles.empty_state}>
                  <i className="fa-regular fa-folder-open" />
                  <span>Nenhuma redação pendente encontrada.</span>
                </div>
              ) : (
                <div className={styles.cards_list}>
                  {penPaginadas.map((r) => (
                    <CardPendente
                      key={r.id}
                      redacao={r}
                      onClick={() => navigate(`/admin/correcao/${r.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>

            {pendentesFiltradas.length > 0 && (
              <Pagination
                current={pagePen}
                total={pendentesFiltradas.length}
                perPage={ITEMS_PER_PAGE}
                onChange={(p) => setPagePen(p)}
              />
            )}
          </div>
        )}

        {/* Corrigidas */}
        {(situacao === "todas" || situacao === "corrigida") && (
          <div className={`${styles.painel} ${styles.painel_corrigida}`}>
            <div className={styles.painel_header}>
              <div className={styles.painel_title_row}>
                <i className="fa-solid fa-circle-check" style={{ color: "#22c55e" }} />
                <h2 className={styles.painel_title}>Redações Corrigidas</h2>
                <span className={styles.badge_count_corr}>{corrigidasFiltradas.length}</span>
              </div>
              <p className={styles.painel_subtitle}>Redações já corrigidas e publicadas</p>
            </div>

            <div className={styles.painel_body}>
              {isLoading ? (
                <div className={styles.loading_state}>
                  <i className="fa-solid fa-spinner fa-spin" />
                  <span>Carregando...</span>
                </div>
              ) : corrigidasFiltradas.length === 0 ? (
                <div className={styles.empty_state}>
                  <i className="fa-regular fa-folder-open" />
                  <span>Nenhuma redação corrigida encontrada.</span>
                </div>
              ) : (
                <div className={styles.cards_list}>
                  {corrPaginadas.map((r) => (
                    <CardCorrigida
                      key={r.id}
                      redacao={r}
                      onView={(redacao) => {
                        setModalData(redacao)
                        setModalOpen(true)
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {corrigidasFiltradas.length > 0 && (
              <Pagination
                current={pageCorr}
                total={corrigidasFiltradas.length}
                perPage={ITEMS_PER_PAGE}
                onChange={(p) => setPageCorr(p)}
              />
            )}
          </div>
        )}
      </div>

      <p className={styles.rodape_nota}>
        <i className="fa-solid fa-circle-info" />
        O download reúne todas as redações corrigidas do tema filtrado e as compacta em um arquivo .zip
        <i className="fa-solid fa-circle-info" />
      </p>
      </div>
    </div>
  )
}

export default Correcao
