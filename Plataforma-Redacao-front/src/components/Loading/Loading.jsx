import styles from "./styles.module.css"

const Loading = ({ size = "40px", color = "#fff" }) => {
  return <div className={styles.loading} style={{ width: size, height: size, borderTop: `4px solid ${color}` }}></div>
}

export default Loading