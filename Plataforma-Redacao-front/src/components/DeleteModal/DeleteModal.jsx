import styles from "./styles.module.css"
import Button from "../Button/Button"

const DeleteModal = ({ message, modalIsClicked, deleteOnClick, cancelOnClick }) => {
  return (
    <div className={`${modalIsClicked ? styles.modal_container : styles.modal_container_closed}`}>
      <div className={styles.modal}>
        <p className={styles.modal_text}>{message}</p>
        <div className={styles.btns}>
          <Button 
            text_size="16px" 
            padding_sz="15px" 
            bg_color="#B2433F"
            onClick={deleteOnClick}
          >
            <i class="fa-solid fa-trash"></i>
            DELETAR
          </Button>
          <Button 
            text_size="16px" 
            padding_sz="15px" 
            bg_color="#1A1A1A"
            onClick={cancelOnClick}
          >
            <i class="fa-solid fa-ban"></i>
            CANCELAR
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DeleteModal