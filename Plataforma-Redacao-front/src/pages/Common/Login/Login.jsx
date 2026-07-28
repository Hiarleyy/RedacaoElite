import styles from "./styles.module.css"
import logo from "../../../images/logo01.png"
import Input from "../../../components/Input/Input"
import Button from "../../../components/Button/Button"
import Message from "../../../components/Message/Message"
const baseURL = import.meta.env.VITE_API_BASE_URL
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [formMessage, setFormMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallModal, setShowInstallModal] = useState(false)
  const [redirectPath, setRedirectPath] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
  }, [])

  const isIos = () => {
    const userAgent = window.navigator.userAgent.toLowerCase()
    return /iphone|ipad|ipod/.test(userAgent)
  }

  const isInStandaloneMode = () => ('standalone' in window.navigator) && window.navigator.standalone

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      setDeferredPrompt(null)
      if (outcome === "accepted") {
        console.log("User accepted the install prompt")
      }
    }
    navigate(redirectPath)
  }

  const handleSkip = () => {
    navigate(redirectPath)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await axios.post(`${baseURL}/usuarios/login`, { email, password })

      localStorage.setItem("user_access_data", JSON.stringify({
        id: response.data.data.id,
        token: response.data.data.token,
        role: response.data.data.role
      }))

      const userRole = response.data.data.role
      const path = userRole === "ADMIN" ? "/admin" : "/aluno"

      if (deferredPrompt || (isIos() && !isInStandaloneMode())) {
        setRedirectPath(path)
        setShowInstallModal(true)
      } else {
        navigate(path)
      }
    } catch (error) {
      setFormMessage({ 
        type: "error", 
        text: error.response?.data?.error || "Erro de conexão com o servidor. Verifique se o backend está ativo."
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      {showInstallModal && (
        <div className={styles.modal_container}>
          <div className={styles.modal}>
            <h2>Instale nosso Aplicativo</h2>
            {deferredPrompt ? (
              <>
                <p>Instale o Redação Elite na sua tela inicial para uma melhor experiência e acesso rápido!</p>
                <div className={styles.modal_buttons}>
                  <Button 
                    text_size="16px" 
                    text_color="#1A1A1A" 
                    padding_sz="12px 20px" 
                    bg_color="#DA9E00"
                    onClick={handleInstall}
                  >
                    Instalar Aplicativo
                  </Button>
                  <Button 
                    text_size="16px" 
                    text_color="#E0E0E0" 
                    padding_sz="12px 20px" 
                    bg_color="#333333"
                    onClick={handleSkip}
                  >
                    Agora Não
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p>Para instalar o Redação Elite no seu dispositivo iOS:</p>
                <ol className={styles.ios_instructions}>
                  <li>Toque no botão <strong>Compartilhar</strong> (quadrado com seta para cima) na barra inferior do Safari.</li>
                  <li>Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>.</li>
                </ol>
                <div className={styles.modal_buttons}>
                  <Button 
                    text_size="16px" 
                    text_color="#1A1A1A" 
                    padding_sz="12px 20px" 
                    bg_color="#DA9E00"
                    onClick={handleSkip}
                  >
                    Continuar para o app
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className={styles.bg_left}>
        <img src={logo} alt="logo" />

        <p className={styles.credits}>&copy; 2025 Redação Elite</p>
      </div>
      
      <div className={styles.bg_right}>
        <p>Acesse sua conta e aproveite nossos serviços</p>

        <form onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="Seu email"
            color="#242424"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          >
            <i className="fa-solid fa-envelope"></i>
          </Input>

          <Input
            type="password"
            placeholder="Sua senha"
            color="#242424"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          >
            <i className="fa-solid fa-lock"></i>
          </Input>

          <Message 
            text={formMessage ? formMessage.text : ""} 
            type={formMessage ? formMessage.type : ""} 
          />

          <Button 
            text_size="20px" 
            text_color="#E0E0E0" 
            padding_sz="12px 20px" 
            bg_color="#DA9E00"
            isLoading={isLoading}
          >Entrar</Button>

        </form>

        <p>Não possui uma conta? <a href="/" className={styles.signup_link}>Clique aqui e Cadastre-se!</a></p>
      </div>
    </div>
  )
}

export default Login