import styles from "./styles.module.css"

const InputSelect = ({ 
  text,
  value, 
  onChange = undefined, 
  color = "#2E3238", 
  options = [], 
}) => {
  return (
    <div className={styles.input_card} style={{ backgroundColor: color }}>
      <select 
        value={value} 
        onChange={onChange} 
        style={{ backgroundColor: color }}
        required
      >
        <option value="" disabled>{text}</option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default InputSelect
