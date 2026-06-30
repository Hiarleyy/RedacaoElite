import styles from "./styles.module.css"
import { useNavigate } from "react-router-dom"

const Title = ({ title }) => {
  const navigate = useNavigate()
  
  const logout = () => {
    localStorage.removeItem("user_access_data")
    navigate("/")
  }

  return (
    <div className={styles.title}>
      <div className={styles.title_container}>
        <p className={styles.text}>{title}</p>

        <button className={styles.logout} onClick={logout}>
          <i class="fa-solid fa-right-from-bracket"></i>
          <p className={styles.logout_text}>Sair</p>
        </button>
      </div>
    </div>
  ) 
}

export default Title