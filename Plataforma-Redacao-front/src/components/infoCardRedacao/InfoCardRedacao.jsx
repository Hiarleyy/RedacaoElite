import styles from "./styles.module.css"
import { Link } from 'react-router-dom'

const InfoCard = ({ 
  img, 
  title, 
  subtitle, 
  link, 
  button_registrar = false, 
  button = true, 
  onClick = undefined,
  infoCardOnClick = undefined,
  text_size = {}
}) => {
  // Create style object with CSS custom properties for responsive font sizes
  const containerStyle = {
    '--title-font-size': text_size.default || '18px',
    '--subtitle-font-size': text_size.default || '12px',
    '--title-font-size-mobile': text_size.mobile || text_size.default || '16px',
    '--subtitle-font-size-mobile': text_size.mobile || text_size.default || '11px'
  };

  return (
    <Link className={styles.container} to={link} onClick={infoCardOnClick} style={containerStyle}>
      {img && <img src={img} alt="foto do aluno" />}

      <div className={styles.infos}>
        <p className={styles.title}>{title}</p>
        {subtitle === undefined ? null : <p className={styles.subtitle}>{subtitle}</p>}
      </div>

      {button === true ? (
        <button 
          className={styles.btn} 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onClick) onClick(e);
          }}
        >
          EXCLUIR
        </button>
      ) : null}
      {button_registrar === true ? (
        <button 
          className={styles.btn} 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onClick) onClick(e);
          }}
        >
          REGISTRAR NOTA
        </button>
      ) : null}
    </Link>
  )
}

export default InfoCard