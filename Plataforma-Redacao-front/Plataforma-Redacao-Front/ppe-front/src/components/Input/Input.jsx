import styles from "./styles.module.css"

const Input = ({ 
  type, 
  placeholder, 
  value, 
  onChange = undefined, 
  onKeyDown = undefined, 
  color = "#2E3238", 
  icon = null,
  children }) => {
  return (
    <div className={styles.input_card} style={{ backgroundColor: color }}>
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
      <input type={type} placeholder={placeholder} value={value} onChange={onChange} onKeyDown={onKeyDown} required />
    </div>
  )
}

export default Input