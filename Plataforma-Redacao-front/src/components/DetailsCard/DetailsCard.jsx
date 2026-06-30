import styles from "./styles.module.css"

const DetailsCard = ({ 
  title, 
  content = undefined, 
  text_color = "#E0E0E0",
  text_size = "15px",
  bg_color = "#1F1F1F"
}) => {
  return (
    <div className={styles.card} style={{ color: text_color, fontSize: text_size, backgroundColor: bg_color }}>
      <p>{title}: {content}</p>
    </div>
  )
}

export default DetailsCard