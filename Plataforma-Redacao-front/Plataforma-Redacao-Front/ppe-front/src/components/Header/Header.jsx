import styles from "./styles.module.css"
import { Link } from "react-router-dom"
import logo from "../../images/logo02.png"
import SuporteCard from "../SuporteCard/SuporteCard"

const Header = ({ options = [] }) => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <img src={logo} alt="logo" />
      </div>

      <nav className={styles.menu_options}>
        {options.map((option, index) => (
          <Link key={index} to={option.path} className={styles.link}>
            <i className={option.icon}></i>
            <p>{option.name}</p>
          </Link>
        ))}
      </nav>

      <div className={styles.suporte_container}>
        <SuporteCard />
      </div>
    </header>
  )
}

export default Header