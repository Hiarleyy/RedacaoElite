import styles from "./styles.module.css"
import { Outlet } from "react-router-dom"
import Header from "../../../components/Header/Header"
import Button from "../../../components/Button/Button"
import { Link, useNavigate, useLocation } from "react-router-dom"
import logo from "../../../images/logo02.png"
import { useState, useEffect } from "react"
import fetchData from "../../../utils/fetchData"

const links = [
  { name: "Dashboard", icon: "fa-solid fa-house", path: "" },
  { name: "Nova proposta", icon: "fa-solid fa-pen", path: "nova-proposta" },
  { name: "Correção", icon: "fa-solid fa-pen-to-square", path: "correcao" },
  { name: "Pagamentos", icon: "fa-solid fa-wallet", path: "pagamentos" },
  { name: "Gerenciar turmas", icon: "fa-solid fa-users", path: "gerenciar-turmas" },
  { name: "Gerenciar alunos", icon: "fa-solid fa-envelope", path: "gerenciar-alunos" },
  { name: "Gerenciar cursos", icon: "fa-solid fa-tv", path: "gerenciar-cursos" },
  { name: "Gerenciar Artigos", icon: "fa-solid fa-newspaper", path: "artigos" },
  { name: "Artigos (Blog)", icon: "fa-solid fa-blog", path: "blog" },
  { name: "Ranking", icon: "fa-solid fa-ranking-star", path: "ranking" },
  { name: "Cursos", icon: "fa-solid fa-tv", path: "cursos" },
  { name: "Frequência", icon: "fa-solid fa-user", path: "FrequenciaAlunos" },
  { name: "Simulados", icon: "fa-solid fa-bullseye", path: "Simulados" },
  { name: "Calendário acadêmico", icon: "fa-solid fa-calendar-days", path: "calendario" },
  { name: "Contador ENEM", icon: "fa-solid fa-stopwatch", path: "contador-enem" },
  { name: "Configuracoes", icon: "fa-solid fa-gear", path: "configuracoes" },
  { name: "Matrículas", icon: "fa-solid fa-graduation-cap", path: "MatriculaAluno" },
]

const AdminLayout = () => {
  const [isClicked, setIsClicked] = useState(false)
  const [modalIsClicked, setModalIsClicked] = useState(false)
  const location = useLocation()

  const isActive = (path) => {
    const segments = location.pathname.split("/").filter(Boolean)
    const lastSegment = segments[segments.length - 1] || ""
    if (path === "") {
      return segments.length <= 1 || lastSegment === segments[0]
    }
    return lastSegment === path || location.pathname.endsWith("/" + path)
  }

  const menuBtnClick = () => setIsClicked(prev => !prev)
  const navigate = useNavigate()

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

  useEffect(() => {
    verificandoSeExpirou()
  }, [])

  return (
    <div className={styles.container}>
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

      <aside className={styles.header_mobile}>
        <img src={logo} />

        {/* Overlay backdrop */}
        <div
          className={`${isClicked ? styles.overlay_active : styles.overlay_hidden}`}
          onClick={() => setIsClicked(false)}
        />

        <nav className={`${isClicked ? styles.active : styles.inactive}`}>
          <div className={styles.mobile_menu_logo}>
            <img src={logo} alt="logo" />
          </div>

          {links.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              className={`${styles.link_box} ${isActive(link.path) ? styles.link_active : ""}`}
              onClick={() => setIsClicked(false)}
              style={{ "--item-index": index }}
            >
              <div className={styles.link}>
                <i className={link.icon}></i>
                <p>{link.name}</p>
              </div>
            </Link>
          ))}

          <Link className={styles.link_box} style={{ "--item-index": links.length }}>
            <div className={styles.link}>
              <i className="fa-brands fa-whatsapp"></i>
              <p>Fale com o suporte</p>
            </div>
          </Link>
        </nav>

        <div className={styles.menu_btn} onClick={menuBtnClick}>
          {isClicked ? <i class="fa-solid fa-circle-xmark"></i> : <i class="fa-solid fa-bars"></i>}
        </div>
      </aside>

      <aside className={styles.sidebar}>
        <Header options={links} />
      </aside>

      <div className={styles.main_container}>
        <main className={styles.main_content}>
          <Outlet />
        </main>
      </div>

    </div>
  )
}

export default AdminLayout

