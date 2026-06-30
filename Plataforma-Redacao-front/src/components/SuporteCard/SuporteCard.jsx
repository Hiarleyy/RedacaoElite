import styles from "./styles.module.css"
import Button from "../Button/Button"

const SuporteCard = () => {
  const handleWhatsAppSupport = () => {
    // Número do WhatsApp (substitua pelo número real)
    const phoneNumber = "559189653728"
    const message = "Olá! Preciso de ajuda com a Plataforma de Redação."
    
    // Redireciona para o WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className={styles.suporte}>
      <h1>Precisa de ajuda?</h1>
      <p>Entre em contato com nosso suporte</p>

      <Button
        bg_color="#DA9E00" 
        text_size="15px"
        padding_sz="10px"
        onClick={handleWhatsAppSupport}
      >
        Suporte WhatsApp
      </Button>
    </div>
  )
}

export default SuporteCard