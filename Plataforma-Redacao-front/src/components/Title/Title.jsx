import styles from "./styles.module.css"
import { useNavigate } from "react-router-dom"

const Title = ({ title, subtitle }) => {
  const navigate = useNavigate()
  
  const logout = () => {
    localStorage.removeItem("user_access_data")
    navigate("/")
  }

  return (
    <div className={styles.title}>
      <div className={styles.title_container}>
        <div className={styles.title_text_container}>
          <p className={styles.text}>{title}</p>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>

        <button className={styles.logout} onClick={logout}>
          <i class="fa-solid fa-right-from-bracket"></i>
          <p className={styles.logout_text}>Sair</p>
        </button>
      </div>
    </div>
  ) 
}

export default Title