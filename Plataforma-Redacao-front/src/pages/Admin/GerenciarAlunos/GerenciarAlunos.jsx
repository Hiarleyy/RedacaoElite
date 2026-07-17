import styles from "./styles.module.css"
import Title from "../../../components/Title/Title"
import Message from "../../../components/Message/Message"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import fetchData from "../../../utils/fetchData"
import Loading from "../../../components/Loading/Loading"
import defaultProfilePicture from '../../../images/Defalult_profile_picture.jpg';
import useUseful from "../../../utils/useUseful"
import DeleteModal from "../../../components/DeleteModal/DeleteModal"
import { gerarHistoricoPdf } from "../../../components/HistoricoPdf/HistoricoPdf"

const baseURL = import.meta.env.VITE_API_BASE_URL

const GerenciarAlunos = () => {
  const navigate = useNavigate()
  const { getHeaders } = useUseful()

  // ── Estados Principais ────────────────────────────────────────────────────
  const [alunos, setAlunos] = useState([])
  const [turmas, setTurmas] = useState([])
  const [search, setSearch] = useState("")
  
  // ── Painel de Filtros ─────────────────────────────────────────────────────
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTurma, setSelectedTurma] = useState("")
  const [dateStart, setDateStart] = useState("")
  const [dateEnd, setDateEnd] = useState("")

  // Filtros aplicados efetivamente
  const [appliedTurma, setAppliedTurma] = useState("")
  const [appliedDateStart, setAppliedDateStart] = useState("")
  const [appliedDateEnd, setAppliedDateEnd] = useState("")

  // ── Estados de UI ─────────────────────────────────────────────────────────
  const [isLoadingData, setIsLoadingData] = useState(false)    
  const [modalIsClicked, setModalIsClicked] = useState(false)
  const [currentAlunoId, setCurrentAlunoId] = useState("")
  const [activeMenuId, setActiveMenuId] = useState(null)
  const [downloadingId, setDownloadingId] = useState(null)

  // ── Paginação ─────────────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // ── Fechar menu de ações ao clicar fora ────────────────────────────────────
  useEffect(() => {
    const handleCloseMenu = () => setActiveMenuId(null)
    window.addEventListener("click", handleCloseMenu)
    return () => window.removeEventListener("click", handleCloseMenu)
  }, [])

  // ── Carregar Dados ────────────────────────────────────────────────────────
  const loadInitialData = async () => {
    setIsLoadingData(true)
    try {
      const { getAlunos, getTurmas } = fetchData() 
      const alunosResponse = await getAlunos()
      const turmasResponse = await getTurmas()
      setAlunos(alunosResponse || [])
      setTurmas(turmasResponse || [])
    } catch (error) {
      console.error("Erro ao carregar dados iniciais:", error)
    } finally {
      setIsLoadingData(false)
    }
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  const deleteAluno = async (id) => {
    await axios.delete(`${baseURL}/usuarios/${id}`, { headers: getHeaders() })
    await loadInitialData()
  }

  const handleDownloadHistorico = async (aluno) => {
    setDownloadingId(aluno.id)
    try {
      const { getNotasByUsuarioId, getRedacoesUser, getFrequencias } = fetchData()

      // Buscar notas de simulados
      let notasSimulados = []
      try {
        const notasResponse = await getNotasByUsuarioId(aluno.id)
        notasSimulados = notasResponse || []
      } catch (err) {
        console.warn("Erro ao buscar notas de simulados:", err)
      }

      // Buscar notas de redações
      let redacoesCorrigidas = []
      try {
        const redacoesResponse = await getRedacoesUser(aluno.id)
        redacoesCorrigidas = (redacoesResponse || []).filter(r => r.nota !== undefined && r.nota !== null)
      } catch (err) {
        console.warn("Erro ao buscar redações:", err)
      }

      // Buscar frequências
      let frequenciasAluno = []
      try {
        const frequenciasResponse = await getFrequencias()
        frequenciasAluno = (frequenciasResponse || []).filter(f => String(f.usuarioId) === String(aluno.id))
      } catch (err) {
        console.warn("Erro ao buscar frequências:", err)
      }

      // Calcular médias
      const totalSimulados = notasSimulados.reduce((acc, curr) => acc + (Number(curr.nota) || 0), 0)
      const totalRedacoes = redacoesCorrigidas.reduce((acc, curr) => acc + (Number(curr.nota) || 0), 0)
      
      let somaNotas = totalSimulados + totalRedacoes
      let qtdNotas = notasSimulados.length + redacoesCorrigidas.length
      let mediaGeral = qtdNotas > 0 ? (somaNotas / qtdNotas).toFixed(2) : "Sem notas"

      // Calcular frequência
      const totalAulas = frequenciasAluno.length
      const presencas = frequenciasAluno.filter(f => f.status === "PRESENTE" || f.status === "JUSTIFICADO").length
      const faltas = frequenciasAluno.filter(f => f.status === "FALTOU").length
      const percentualFrequencia = totalAulas > 0 ? ((presencas / totalAulas) * 100).toFixed(1) + "%" : "Sem registros"

      // Gerar PDF
      const safeNome = (aluno.nome || "Aluno").replace(/\s+/g, '_')
      
      const dadosHistorico = {
        nome: aluno.nome,
        email: aluno.email,
        turma: aluno.turma?.nome,
        dataMatricula: aluno.dataCriacao,
        simuladosRealizados: notasSimulados.length,
        redacoesCorrigidas: redacoesCorrigidas.length,
        mediaGeral,
        totalAulas,
        presencas,
        faltas,
        percentualFrequencia
      }

      await gerarHistoricoPdf(dadosHistorico, `Historico_${safeNome}`)
    } catch (error) {
      console.error("Erro ao gerar historico:", error)
      alert("Ocorreu um erro ao gerar o historico do aluno.")
    } finally {
      setDownloadingId(null)
    }
  }

  // ── Ações de Filtros ──────────────────────────────────────────────────────
  const handleApplyFilters = () => {
    setAppliedTurma(selectedTurma)
    setAppliedDateStart(dateStart)
    setAppliedDateEnd(dateEnd)
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setSearch("")
    setSelectedTurma("")
    setDateStart("")
    setDateEnd("")
    setAppliedTurma("")
    setAppliedDateStart("")
    setAppliedDateEnd("")
    setCurrentPage(1)
  }

  // ── Filtragem dos Alunos ──────────────────────────────────────────────────
  const filteredAlunos = alunos.filter((aluno) => {
    const matchesSearch =
      search === "" ||
      aluno.nome.toLowerCase().includes(search.toLowerCase()) ||
      aluno.email.toLowerCase().includes(search.toLowerCase())

    const matchesTurma = appliedTurma === "" || aluno.turmaId === appliedTurma

    let matchesDate = true
    if (appliedDateStart || appliedDateEnd) {
      const createdDate = new Date(aluno.dataCriacao)
      if (appliedDateStart) {
        const start = new Date(appliedDateStart + "T00:00:00")
        if (createdDate < start) matchesDate = false
      }
      if (appliedDateEnd) {
        const end = new Date(appliedDateEnd + "T23:59:59")
        if (createdDate > end) matchesDate = false
      }
    }

    return matchesSearch && matchesTurma && matchesDate
  })

  // ── Paginação Lógica ──────────────────────────────────────────────────────
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentAlunos = filteredAlunos.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredAlunos.length / itemsPerPage)

  const getPageNumbers = (current, total) => {
    const pages = []
    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i)
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, "...", total)
      } else if (current >= total - 2) {
        pages.push(1, "...", total - 2, total - 1, total)
      } else {
        pages.push(1, "...", current, "...", total)
      }
    }
    return pages
  }

  // ── Formatação de Datas e Badges ──────────────────────────────────────────
  const formatLocalDate = (dateString) => {
    if (!dateString) return "—"
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR")
  }

  const getTurmaBadgeStyle = (turmaName) => {
    if (!turmaName) return { backgroundColor: "#3a3a3a", color: "#ccc", border: "1px solid #444" }
    const name = turmaName.toLowerCase()
    if (name.includes("turma a") || name.includes("veterano")) {
      return { backgroundColor: "rgba(107, 70, 193, 0.2)", color: "#B794F4", border: "1px solid rgba(107, 70, 193, 0.4)" }
    } else if (name.includes("turma b") || name.includes("extensivo")) {
      return { backgroundColor: "rgba(49, 130, 206, 0.2)", color: "#63B3ED", border: "1px solid rgba(49, 130, 206, 0.4)" }
    } else if (name.includes("turma c") || name.includes("intensivo")) {
      return { backgroundColor: "rgba(49, 151, 149, 0.2)", color: "#4FD1C5", border: "1px solid rgba(49, 151, 149, 0.4)" }
    }
    return { backgroundColor: "rgba(221, 107, 32, 0.2)", color: "#F6AD55", border: "1px solid rgba(221, 107, 32, 0.4)" }
  }

  // Contador de filtros aplicados
  let activeFiltersCount = 0
  if (appliedTurma) activeFiltersCount++
  if (appliedDateStart || appliedDateEnd) activeFiltersCount++

  return (
    <div className={styles.container}>
      <DeleteModal
        message="Você tem certeza que deseja excluir esse(a) aluno(a)?"
        modalIsClicked={modalIsClicked}
        deleteOnClick={() => {
          deleteAluno(currentAlunoId)
          setModalIsClicked(false)
        }} 
        cancelOnClick={() => setModalIsClicked(false)} 
      />

      <Title title="Gerenciar alunos" />

      <div className={styles.main_content}>
        <div className={styles.card_wrapper}>
          
          {/* ── BARRA DE FERRAMENTAS PRINCIPAL ──────────────────────────────── */}
          <div className={styles.toolbar}>
            <div className={styles.search_wrapper}>
              <i className="fa-solid fa-magnifying-glass" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className={styles.shortcut}>⌘ K</span>
            </div>

            <div className={styles.toolbar_actions}>
              <button
                type="button"
                className={`${styles.btn_filter} ${activeFiltersCount > 0 ? styles.btn_filter_active : ""}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <i className="fa-solid fa-filter" />
                Filtros
                {activeFiltersCount > 0 && (
                  <span className={styles.filter_badge}>{activeFiltersCount}</span>
                )}
              </button>

              <button
                type="button"
                className={styles.btn_add_aluno}
                onClick={() => navigate("/admin/MatriculaAluno")}
              >
                <i className="fa-solid fa-circle-plus" />
                Adicionar aluno
              </button>
            </div>
          </div>

          {/* ── PAINEL DE FILTROS EXPANSÍVEL ────────────────────────────────── */}
          {showFilters && (
            <div className={styles.filter_panel}>
              <div className={styles.filter_grid}>
                <div className={styles.filter_item}>
                  <label>Turma</label>
                  <select
                    value={selectedTurma}
                    onChange={(e) => setSelectedTurma(e.target.value)}
                  >
                    <option value="">Todas as turmas</option>
                    {turmas.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.filter_item}>
                  <label>Cadastro (De)</label>
                  <input
                    type="date"
                    value={dateStart}
                    onChange={(e) => setDateStart(e.target.value)}
                  />
                </div>

                <div className={styles.filter_item}>
                  <label>Cadastro (Até)</label>
                  <input
                    type="date"
                    value={dateEnd}
                    onChange={(e) => setDateEnd(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.filter_panel_actions}>
                <button
                  type="button"
                  className={styles.btn_clear_filters}
                  onClick={handleClearFilters}
                >
                  Limpar filtros
                </button>
                <button
                  type="button"
                  className={styles.btn_apply_filters}
                  onClick={handleApplyFilters}
                >
                  Aplicar filtros
                </button>
              </div>
            </div>
          )}

          {/* ── TABELA DE ALUNOS ────────────────────────────────────────────── */}
          {isLoadingData ? (
            <div className={styles.loading_box}>
              <Loading />
            </div>
          ) : filteredAlunos.length === 0 ? (
            <Message
              text="Nenhum aluno encontrado."
              text_color="#E0E0E0"
              marginTop="40px"
            />
          ) : (
            <div className={styles.table_container}>
              <table className={styles.custom_table}>
                <thead>
                  <tr>
                    <th>ALUNO</th>
                    <th>TURMA</th>
                    <th>CADASTRO</th>
                    <th style={{ textAlign: "center" }}>AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAlunos.map((aluno) => (
                    <tr
                      key={aluno.id}
                      onClick={() => navigate(`/admin/gerenciar-alunos/${aluno.id}`)}
                    >
                      <td>
                        <div className={styles.aluno_info_cell}>
                          <img
                            src={aluno.caminho ? `${baseURL}/usuarios/${aluno.id}/profile-image` : defaultProfilePicture}
                            alt={aluno.nome}
                            className={styles.aluno_avatar}
                            onError={(e) => { e.target.src = defaultProfilePicture }}
                          />
                          <div>
                            <p className={styles.aluno_name}>{aluno.nome}</p>
                            <p className={styles.aluno_email}>{aluno.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={styles.turma_badge}
                          style={getTurmaBadgeStyle(aluno.turma?.nome)}
                        >
                          {aluno.turma?.nome || "Sem Turma"}
                        </span>
                      </td>
                      <td>
                        <span className={styles.cadastro_date}>
                          {formatLocalDate(aluno.dataCriacao)}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.action_menu_wrapper}>
                          <button
                            type="button"
                            className={styles.btn_action_menu}
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveMenuId(activeMenuId === aluno.id ? null : aluno.id)
                            }}
                          >
                            <i className="fa-solid fa-ellipsis-vertical" />
                          </button>

                          {activeMenuId === aluno.id && (
                            <div className={styles.action_dropdown}>
                              <button
                                type="button"
                                onClick={() => navigate(`/admin/gerenciar-alunos/${aluno.id}`)}
                              >
                                <i className="fa-solid fa-eye" /> Ver Detalhes
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handleDownloadHistorico(aluno)
                                  setActiveMenuId(null)
                                }}
                                disabled={downloadingId === aluno.id}
                              >
                                {downloadingId === aluno.id ? (
                                  <i className="fa-solid fa-spinner fa-spin" />
                                ) : (
                                  <i className="fa-solid fa-file-pdf" />
                                )}{" "}
                                {downloadingId === aluno.id ? "Gerando..." : "Baixar Histórico"}
                              </button>
                              <button
                                type="button"
                                className={styles.delete_action}
                                onClick={() => {
                                  setCurrentAlunoId(aluno.id)
                                  setModalIsClicked(true)
                                  setActiveMenuId(null)
                                }}
                              >
                                <i className="fa-solid fa-trash" /> Excluir
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── PAGINAÇÃO INTEGRADA DO RODAPÉ ───────────────────────────────── */}
          {!isLoadingData && filteredAlunos.length > 0 && (
            <div className={styles.footer_pagination}>
              <div className={styles.showing_count}>
                Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredAlunos.length)} de {filteredAlunos.length} alunos
              </div>

              <div className={styles.pagination_controls}>
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                >
                  «
                </button>
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  ‹
                </button>

                {getPageNumbers(currentPage, totalPages).map((num, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={currentPage === num ? styles.active_page : ""}
                    disabled={num === "..."}
                    onClick={() => num !== "..." && setCurrentPage(num)}
                  >
                    {num}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  ›
                </button>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                >
                  »
                </button>
              </div>

              <div className={styles.per_page_selector}>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                >
                  <option value={5}>5 por página</option>
                  <option value={10}>10 por página</option>
                  <option value={15}>15 por página</option>
                  <option value={20}>20 por página</option>
                </select>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default GerenciarAlunos

