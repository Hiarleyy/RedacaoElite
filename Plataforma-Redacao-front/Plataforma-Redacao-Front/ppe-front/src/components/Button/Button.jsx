import { useState, useEffect } from 'react';
import styles from "./styles.module.css"
import Loading from "../../components/Loading/Loading"

const Button = ({
  children, 
  text_color = "#E0E0E0", 
  text_size = "16px", 
  bg_color = "#000", 
  padding_sz = "40px", 
  radius = "6px",
  width_size = "100%",
  height_size = undefined,
  onClick = undefined,
  isLoading,
  className
}) => {  // HOOK PARA INTERFACE MOBILE
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Handle responsive properties
  const getFinalValue = (prop) => {
    if (typeof prop === 'object' && prop !== null) {
      return isMobile && prop.mobile ? prop.mobile : prop.default || prop;
    }
    // For text_size specifically, use 16px for mobile
    if (prop === text_size && isMobile) {
      return "16px";
    }
    return prop;
  };
  
  return (
    <button 
      className={`${styles.btn} ${className || ''}`} 
      type="submit"
      onClick={onClick} 
      style={{ 
        backgroundColor: bg_color, 
        color: text_color,
        fontSize: getFinalValue(text_size),
        padding: getFinalValue(padding_sz),
        borderRadius: getFinalValue(radius),
        width: getFinalValue(width_size),
        height: getFinalValue(height_size),
        "--text-color": text_color, 
      }}
    >
      {isLoading ? <Loading size={"20px"} /> : children}
    </button>
  )
}

export default Button