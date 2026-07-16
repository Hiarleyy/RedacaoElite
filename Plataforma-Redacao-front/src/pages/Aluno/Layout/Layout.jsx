import styles from "./styles.module.css"
import { Outlet } from "react-router-dom"
import Header from "../../../components/Header/Header"
import { Link, useNavigate } from "react-router-dom"
import logo from "../../../images/logo02.png"
import { useState, useEffect } from "react"
import fetchData from "../../../utils/fetchData"
import Button from "../../../components/Button/Button"
import CountdownEnem from "../../../components/CountdownEnem/CountdownEnem"

const links = [
  { name: "Início", icon: "fa-solid fa-house", path: "" },
  { name: "Perfil", icon: "fa-solid fa-user", path: "perfil" },
  { name: "Pomodoro", icon: "fa-solid fa-clock", path: "pomodoro" },
  { name: "Tema semanal", icon: "fa-solid fa-calendar-week", path: "tema-semanal" },
  { name: "Nova redação", icon: "fa-solid fa-pen", path: "nova-redacao" },
  { name: "Ranking", icon: "fa-solid fa-ranking-star", path: "ranking" },
  { name: "Cursos", icon: "fa-solid fa-tv", path: "cursos" },
  { name: "Simulados", icon: "fa-solid fa-bullseye", path: "SimuladosAluno" },
  { name: "Pagamentos", icon: "fa-solid fa-credit-card", path: "pagamentos" },
  { name: "Blog e Artigos", icon: "fa-solid fa-newspaper", path: "artigos" },
  { name: "Configurações", icon: "fa-solid fa-gear", path: "configuracoes" },

]

const META_NOTA = 1000

const AlunoLayout = () => {
  const [isClicked, setIsClicked] = useState(false)
  const [modalIsClicked, setModalIsClicked] = useState(false)
  const [metaData, setMetaData] = useState(null)

  const menuBtnClick = () => setIsClicked(prev => !prev)
  const navigate = useNavigate()

  const getAlunoId = () => {
    try {
      const data = localStorage.getItem('user_access_data')
      return data ? JSON.parse(data).id : null
    } catch { return null }
  }

  const verificandoSeExpirou = async () => {
    const data = localStorage.getItem('user_access_data')
    if (!data) return
    const { id } = JSON.parse(data)
    try {
      const { getAlunoById } = fetchData()
      await getAlunoById(id)
    } catch (error) {
      if (error.response?.data?.message === "Token expirado.") {
        setModalIsClicked(true)
      } else {
        console.error("Erro ao buscar os dados:", error)
      }
    }
  }

  // Busca última nota do aluno para a META
  const carregarMeta = async () => {
    const alunoId = getAlunoId()
    if (!alunoId) return
    try {
      const { getRedacoes } = fetchData()
      const corrigidas = await getRedacoes(alunoId, true)
      if (corrigidas && corrigidas.length > 0) {
        // Ordena por data de correção e pega a mais recente
        const sorted = [...corrigidas].sort((a, b) =>
          new Date(b.correcao?.updatedAt || b.updatedAt) - new Date(a.correcao?.updatedAt || a.updatedAt)
        )
        const ultimaNota = sorted[0]?.correcao?.nota ?? 0
        setMetaData({ ultimaNota, meta: META_NOTA })
      }
    } catch (err) {
      console.error("Erro ao carregar meta:", err)
    }
  }

  useEffect(() => {
    verificandoSeExpirou()
    carregarMeta()
  }, [])

  return (
    <div className={styles.container}>
      {/* Modal sessão expirada */}
      <div className={`${modalIsClicked ? styles.modal_container : styles.modal_container_closed}`}>
        <div className={styles.modal}>
          <p className={styles.modal_text}>Sua sessão expirou, faça login novamente para acessar nossos serviços.</p>
          <Button
            text_size="16px"
            padding_sz="15px"
            bg_color="#1A1A1A"
            onClick={() => {
              localStorage.removeItem('user_access_data')
              navigate("/", { replace: true })
            }}
          >
            <i class="fa-solid fa-circle-check"></i>
            Ok
          </Button>
        </div>
      </div>

      {/* Banner countdown ENEM — full width */}
      <CountdownEnem />

      <div className={styles.content_row}>
        {/* Header mobile */}
        <aside className={styles.header_mobile}>
          <img src={logo} />

          <nav className={`${isClicked ? styles.active : styles.inactive}`}>
            {links.map((link, index) => (
              <Link key={index} to={link.path} className={styles.link_box} onClick={() => setIsClicked(false)}>
                <div className={styles.link}>
                  <i className={link.icon}></i>
                  <p>{link.name}</p>
                </div>
              </Link>
            ))}

            <Link className={styles.link_box}>
              <div className={styles.link}>
                <i class="fa-brands fa-whatsapp"></i>
                <p>Fale com o suporte</p>
              </div>
            </Link>
          </nav>

          <div className={styles.menu_btn} onClick={menuBtnClick}>
            {isClicked ? <i class="fa-solid fa-circle-xmark"></i> : <i class="fa-solid fa-bars"></i>}
          </div>
        </aside>

        {/* Sidebar desktop */}
        <aside className={styles.sidebar}>
          <Header options={links} metaData={metaData} />
        </aside>

        <div className={styles.main_container}>
          <main className={styles.main_content}>
            <Outlet />
          </main>
        </div>
      </div>

    </div>
  )
}

export default AlunoLayout
