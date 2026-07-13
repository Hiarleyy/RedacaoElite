import styles from "./styles.module.css"
import { Link, useLocation } from "react-router-dom"
import logo from "../../images/logo02.png"

// Calcula o arco do SVG circular
const CircularProgress = ({ percent }) => {
  const radius = 34
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <svg className={styles.progress_svg} viewBox="0 0 80 80">
      {/* Trilha */}
      <circle
        cx="40" cy="40" r={radius}
        fill="none"
        stroke="#2e2e2e"
        strokeWidth="6"
      />
      {/* Progresso */}
      <circle
        cx="40" cy="40" r={radius}
        fill="none"
        stroke="#DA9E00"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 40 40)"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      {/* Percentual */}
      <text
        x="40" y="44"
        textAnchor="middle"
        fontSize="14"
        fontWeight="800"
        fill="#DA9E00"
      >
        {Math.round(percent)}%
      </text>
    </svg>
  )
}

const Header = ({ options = [], metaData = null }) => {
  const location = useLocation()

  const isActive = (path) => {
    const segments = location.pathname.split("/").filter(Boolean)
    const lastSegment = segments[segments.length - 1] || ""
    if (path === "") {
      return segments.length <= 1 || lastSegment === segments[0]
    }
    return lastSegment === path || location.pathname.endsWith("/" + path)
  }

  const metaPercent = metaData
    ? Math.min(100, Math.round((metaData.ultimaNota / 1000) * 100))
    : 0

  const motivacional = (p) => {
    if (p >= 90) return "Excelente! Continue assim! 🏆"
    if (p >= 75) return "Você está no caminho certo!"
    if (p >= 50) return "Bom progresso, continue!"
    return "Vamos melhorar juntos! 💪"
  }

  return (
    <header className={styles.header}>
      {/* Logo */}
      <div className={styles.logo}>
        <img src={logo} alt="logo" />
      </div>

      {/* Navegação */}
      <nav className={styles.menu_options}>
        {options.map((option, index) => (
          <Link
            key={index}
            to={option.path}
            className={`${styles.link} ${isActive(option.path) ? styles.link_active : ""}`}
          >
            <span className={styles.link_icon_wrap}>
              <i className={option.icon}></i>
            </span>
            <p>{option.name}</p>
          </Link>
        ))}
      </nav>

      {/* Seção META — só para alunos */}
      {metaData && (
        <div className={styles.meta_section}>
          <div className={styles.meta_header}>
            <i className="fa-solid fa-bullseye" />
            <span>META: NOTA {metaData.meta}</span>
          </div>

          <div className={styles.meta_progress}>
            <CircularProgress percent={metaPercent} />
          </div>

          <p className={styles.meta_motivacional}>
            {motivacional(metaPercent)}
          </p>

          <Link to="perfil" className={styles.meta_btn}>
            <i className="fa-solid fa-chart-line" />
            Ver meu progresso
          </Link>
        </div>
      )}
    </header>
  )
}

export default Header