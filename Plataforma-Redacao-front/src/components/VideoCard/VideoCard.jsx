import styles from "./styles.module.css"
import { Link } from 'react-router-dom'

const VideoCard = ({ thumbnail, titulo, link }) => {
  return (
    <Link className={styles.card} to={link}>
      <img className={styles.imagem} src={thumbnail} />
    
      <div className={styles.info}>
        <p>{titulo}</p>
      <div className={styles.icone}><i class="fa-solid fa-play"></i></div>
      </div>
    </Link>
  )
}

export default VideoCard