import styles from "./styles.module.css"
import Title from "../../../components/Title/Title"
import { useState, useEffect } from "react"
import RankingTabela from "../../../components/RankingTabela/RankingTabela"
import fetchData from "../../../utils/fetchData"
import defaultProfilePicture from '../../../images/Defalult_profile_picture.jpg';

const baseURL = import.meta.env.VITE_API_BASE_URL


const RankingAlunos = () => {
  const [ranking, setRanking] = useState([])
  const [turmas, setTurmas] = useState([])
  const [selectedTurma, setSelectedTurma] = useState("")
  const [selectedTipo, setSelectedTipo] = useState("redacoes_media")
  const [selectedEscopo, setSelectedEscopo] = useState("geral")
  const [currentUser, setCurrentUser] = useState(null)
  const [dbUser, setDbUser] = useState(null)

  // Custom dropdown states
  const [isTurmaDropdownOpen, setIsTurmaDropdownOpen] = useState(false)
  const [turmaSearchQuery, setTurmaSearchQuery] = useState("")

  const handleImageError = (e) => {
    e.target.src = defaultProfilePicture;
  }

  useEffect(() => {
    const stored = localStorage.getItem("user_access_data")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setCurrentUser(parsed)

        const getDbUserData = async (userId) => {
          try {
            const { getAlunoById } = fetchData()
            const response = await getAlunoById(userId)
            setDbUser(response)
          } catch (err) {
            console.error("Erro ao buscar dados do usuário logado:", err)
          }
        }
        getDbUserData(parsed.id)
      } catch (err) {
        console.error("Erro ao recuperar usuário logado:", err)
      }
    }

    const getTurmasData = async () => {
      try {
        const { getTurmas } = fetchData()
        const response = await getTurmas()
        setTurmas(response || [])
      } catch (err) {
        console.error("Erro ao buscar turmas:", err)
      }
    }

    getTurmasData()
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(`.${styles.custom_select_container}`)) {
        setIsTurmaDropdownOpen(false)
      }
    }
    document.addEventListener("click", handleOutsideClick)
    return () => document.removeEventListener("click", handleOutsideClick)
  }, [])

  useEffect(() => {
    const getData = async () => {
      const { getRanking } = fetchData()
      let response = []
      if (selectedEscopo === "geral") {
        response = await getRanking("", selectedTipo, "alunos")
      } else if (selectedEscopo === "minha_turma") {
        if (dbUser?.turmaId) {
          response = await getRanking(dbUser.turmaId, selectedTipo, "alunos")
        }
      } else if (selectedEscopo === "por_turma") {
        response = await getRanking(selectedTurma, selectedTipo, "alunos")
      } else if (selectedEscopo === "turmas") {
        response = await getRanking("", selectedTipo, "turmas")
      }
      setRanking(response || [])
    }

    getData()
  }, [selectedEscopo, selectedTurma, selectedTipo, dbUser])

  const isClassRanking = selectedEscopo === "turmas"

  const userIndex = !isClassRanking
    ? ranking.findIndex(item => item.id === currentUser?.id)
    : ranking.findIndex(item => item.id === dbUser?.turmaId)

  const userRank = userIndex !== -1 ? userIndex + 1 : null
  const userScore = userIndex !== -1 ? ranking[userIndex].ultima_nota : null

  const filteredTurmas = turmas.filter(t =>
    t.nome.toLowerCase().includes(turmaSearchQuery.toLowerCase())
  )

  const selectedTurmaObj = turmas.find(t => t.id === selectedTurma)
  const userTurmaName = turmas.find(t => t.id === dbUser?.turmaId)?.nome || "Sem Turma"

  const getRankBadgeClass = (rank) => {
    if (rank === 1) return styles.rank_badge_first;
    if (rank === 2) return styles.rank_badge_second;
    if (rank === 3) return styles.rank_badge_third;
    return styles.rank_badge_normal;
  }

  const getPerformanceMessage = (score) => {
    if (score >= 900) return { label: "Elite", color: "#FFD700" };
    if (score >= 700) return { label: "Muito Bom", color: "#C0C0C0" };
    if (score >= 500) return { label: "Em Evolução", color: "#CD7F32" };
    return { label: "Iniciante", color: "#a0a0a0" };
  }

  const performance = userScore !== null ? getPerformanceMessage(userScore) : null;

  return (
    <div className={styles.container}>
      <Title title="Ranking de Alunos" />

      <div className={styles.main_content}>
        {/* Card de Posição Atual do Usuário Premium */}
        {currentUser && (
          <div className={styles.user_rank_card_premium}>
            <div className={styles.user_rank_card_glow}></div>
            <div className={styles.user_rank_card_body}>
              <div className={styles.user_rank_profile}>
                <div className={styles.user_avatar_container}>
                  {isClassRanking ? (
                    <div className={styles.class_shield_container}>
                      <i className="fa-solid fa-shield-halved"></i>
                    </div>
                  ) : (
                    <img
                      className={styles.user_avatar}
                      src={dbUser?.caminho ? `${baseURL}/usuarios/${currentUser.id}/profile-image` : defaultProfilePicture}
                      alt="Sua foto de perfil"
                      onError={handleImageError}
                    />
                  )}
                  {userRank && (
                    <div className={`${styles.user_rank_badge} ${getRankBadgeClass(userRank)}`}>
                      {userRank}º
                    </div>
                  )}
                </div>
                <div className={styles.user_meta_info}>
                  <span className={styles.user_welcome_label}>
                    {isClassRanking ? "Classificação da Sua Turma" : "Sua Classificação"}
                  </span>
                  <h3 className={styles.user_name_display}>
                    {isClassRanking ? userTurmaName : (dbUser?.nome || "Carregando...")}
                  </h3>
                  {!isClassRanking && (
                    <span className={styles.user_turma_display}>
                      <i className="fa-solid fa-users"></i> {userTurmaName}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.user_rank_stats}>
                {userRank ? (
                  <>
                    <div className={styles.stat_item}>
                      <span className={styles.stat_label}>Nota/Média</span>
                      <span className={styles.stat_value}>{userScore}</span>
                    </div>
                    {performance && (
                      <div className={styles.stat_item}>
                      </div>
                    )}
                  </>
                ) : (
                  <div className={styles.no_rank_stats}>
                    <i className="fa-solid fa-circle-info"></i>
                    <p>
                      {isClassRanking ? (
                        `Sua turma (${userTurmaName}) ainda não possui dados suficientes para figurar no ranking.`
                      ) : (
                        `Você ainda não possui notas ${selectedTipo === 'simulados' ? 'em simulados' : 'de redações corrigidas'} ${selectedTurmaObj ? `na turma ${selectedTurmaObj.nome}` : ''} para figurar no ranking.`
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Painel Unificado de Filtros - Restilizado com base na imagem de referência */}
        <div className={styles.filter_panel}>
          {/* Seção 1: Escopo do Ranking */}
          <div className={styles.filter_section}>
            <div className={styles.section_title_wrapper}>
              <i className={`fa-solid fa-chart-simple ${styles.section_icon_gold}`}></i>
              <span className={styles.section_title}>ESCOPO DO RANKING</span>
            </div>

            <div className={styles.section_buttons_group}>
              <button
                type="button"
                className={`${styles.filter_btn} ${selectedEscopo === "geral" ? styles.active : ""}`}
                onClick={() => {
                  setSelectedEscopo("geral");
                  setIsTurmaDropdownOpen(false);
                }}
              >
                <i className="fa-solid fa-earth-americas"></i>
                <span>Ranking Geral</span>
              </button>

              {dbUser?.turmaId && (
                <button
                  type="button"
                  className={`${styles.filter_btn} ${selectedEscopo === "minha_turma" ? styles.active : ""}`}
                  onClick={() => {
                    setSelectedEscopo("minha_turma");
                    setIsTurmaDropdownOpen(false);
                  }}
                >
                  <i className="fa-regular fa-user"></i>
                  <span>Minha Turma</span>
                </button>
              )}

              {/* Combobox de Turma inline no painel de botões */}
              <div className={styles.custom_select_container}>
                <div
                  className={`${styles.filter_btn} ${selectedEscopo === "por_turma" ? styles.active : ""} ${styles.combobox_btn_trigger}`}
                  onClick={() => {
                    setSelectedEscopo("por_turma");
                    setIsTurmaDropdownOpen(!isTurmaDropdownOpen);
                  }}
                >
                  <i className="fa-solid fa-filter"></i>
                  <span>{selectedTurmaObj ? selectedTurmaObj.nome : "Filtrar por Turma"}</span>
                  <i className={`fa-solid fa-chevron-down ${styles.chevron_down}`}></i>
                </div>

                {isTurmaDropdownOpen && (
                  <div className={styles.custom_select_dropdown}>
                    <div className={styles.search_wrapper}>
                      <i className={`fa-solid fa-magnifying-glass ${styles.search_icon}`}></i>
                      <input
                        type="text"
                        placeholder="Pesquisar turma..."
                        value={turmaSearchQuery}
                        onChange={(e) => setTurmaSearchQuery(e.target.value)}
                        className={styles.dropdown_search_input}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    </div>
                    <div className={styles.options_list}>
                      <div
                        className={`${styles.option_item} ${selectedTurma === "" ? styles.selected : ""}`}
                        onClick={() => {
                          setSelectedTurma("");
                          setIsTurmaDropdownOpen(false);
                          setTurmaSearchQuery("");
                        }}
                      >
                        Todas as Turmas
                      </div>
                      {filteredTurmas.map(t => (
                        <div
                          key={t.id}
                          className={`${styles.option_item} ${selectedTurma === t.id ? styles.selected : ""}`}
                          onClick={() => {
                            setSelectedTurma(t.id);
                            setIsTurmaDropdownOpen(false);
                            setTurmaSearchQuery("");
                          }}
                        >
                          {t.nome}
                        </div>
                      ))}
                      {filteredTurmas.length === 0 && (
                        <div className={styles.no_options}>Nenhuma turma encontrada</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                className={`${styles.filter_btn} ${selectedEscopo === "turmas" ? styles.active : ""}`}
                onClick={() => {
                  setSelectedEscopo("turmas");
                  setIsTurmaDropdownOpen(false);
                }}
              >
                <i className="fa-solid fa-users"></i>
                <span>Ranking de Turmas</span>
              </button>
            </div>
          </div>

          {/* Separador Vertical */}
          <div className={styles.vertical_separator}></div>

          {/* Seção 2: Tipo de Ranking */}
          <div className={styles.filter_section}>
            <div className={styles.section_title_wrapper}>
              <i className={`fa-solid fa-trophy ${styles.section_icon_gold}`}></i>
              <span className={styles.section_title}>TIPO DE RANKING</span>
            </div>

            <div className={styles.section_buttons_group}>
              <button
                type="button"
                className={`${styles.filter_btn} ${selectedTipo === "redacoes_media" ? styles.active : ""}`}
                onClick={() => setSelectedTipo("redacoes_media")}
              >
                <i className="fa-regular fa-star"></i>
                <span>Média Geral</span>
              </button>

              <button
                type="button"
                className={`${styles.filter_btn} ${selectedTipo === "redacoes_ultima" ? styles.active : ""}`}
                onClick={() => setSelectedTipo("redacoes_ultima")}
              >
                <i className="fa-regular fa-file-lines"></i>
                <span>Última Redação</span>
              </button>

              <button
                type="button"
                className={`${styles.filter_btn} ${selectedTipo === "simulados" ? styles.active : ""}`}
                onClick={() => setSelectedTipo("simulados")}
              >
                <i className="fa-regular fa-calendar-days"></i>
                <span>Simulados</span>
              </button>
            </div>
          </div>
        </div>

        <div className={styles.podium} role="region" aria-label="Pódio dos três melhores alunos">
          <div className={styles.position_container}>
            <i className={`fa-solid fa-crown ${styles.crown_silver}`}></i>
            <h2>2º</h2>
            {isClassRanking ? (
              <div className={styles.class_shield_container}>
                <i className="fa-solid fa-shield-halved"></i>
              </div>
            ) : (
              <img
                className={styles.img_container}
                src={ranking[1] ? `${baseURL}/usuarios/${ranking[1].id}/profile-image` : defaultProfilePicture}
                alt="Segundo lugar"
                onError={handleImageError}
              />
            )}
            {ranking[1] && (
              <h3 title={ranking[1].nome}>
                {ranking[1].nome} {isClassRanking
                  ? (ranking[1].id === dbUser?.turmaId && <span className={styles.badge_you}>(Sua Turma)</span>)
                  : (ranking[1].id === currentUser?.id && <span className={styles.badge_you}>(Você)</span>)
                }
              </h3>
            )}
            {ranking[1] && <p title={`Média: ${ranking[1].ultima_nota}`}>{ranking[1].ultima_nota}</p>}
          </div>

          <div className={styles.position_container_first}>
            <i className={`fa-solid fa-crown ${styles.crown_gold}`}></i>
            <h2>1º</h2>
            {isClassRanking ? (
              <div className={styles.class_shield_container}>
                <i className="fa-solid fa-shield-halved"></i>
              </div>
            ) : (
              <img
                className={styles.img_container}
                src={ranking[0] ? `${baseURL}/usuarios/${ranking[0].id}/profile-image` : defaultProfilePicture}
                alt="Primeiro lugar"
                onError={handleImageError}
              />
            )}
            {ranking[0] && (
              <h3 title={ranking[0].nome}>
                {ranking[0].nome} {isClassRanking
                  ? (ranking[0].id === dbUser?.turmaId && <span className={styles.badge_you}>(Sua Turma)</span>)
                  : (ranking[0].id === currentUser?.id && <span className={styles.badge_you}>(Você)</span>)
                }
              </h3>
            )}
            {ranking[0] && <p title={`Média: ${ranking[0].ultima_nota}`}>{ranking[0].ultima_nota}</p>}
          </div>

          <div className={styles.position_container}>
            <i className={`fa-solid fa-crown ${styles.crown_bronze}`}></i>
            <h2>3º</h2>
            {isClassRanking ? (
              <div className={styles.class_shield_container}>
                <i className="fa-solid fa-shield-halved"></i>
              </div>
            ) : (
              <img
                className={styles.img_container}
                src={ranking[2] ? `${baseURL}/usuarios/${ranking[2].id}/profile-image` : defaultProfilePicture}
                alt="Terceiro lugar"
                onError={handleImageError}
              />
            )}
            {ranking[2] && (
              <h3 title={ranking[2].nome}>
                {ranking[2].nome} {isClassRanking
                  ? (ranking[2].id === dbUser?.turmaId && <span className={styles.badge_you}>(Sua Turma)</span>)
                  : (ranking[2].id === currentUser?.id && <span className={styles.badge_you}>(Você)</span>)
                }
              </h3>
            )}
            {ranking[2] && <p title={`Média: ${ranking[2].ultima_nota}`}>{ranking[2].ultima_nota}</p>}
          </div>
        </div>

        <RankingTabela
          ranking={ranking || []}
          currentUserId={currentUser?.id}
          isClassRanking={isClassRanking}
          userClassId={dbUser?.turmaId}
        />
      </div>
    </div>
  )
}

export default RankingAlunos
