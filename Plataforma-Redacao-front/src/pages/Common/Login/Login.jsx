import styles from "./styles.module.css"
import logo from "../../../images/logo01.png"
import Input from "../../../components/Input/Input"
import Button from "../../../components/Button/Button"
import Message from "../../../components/Message/Message"
const baseURL = import.meta.env.VITE_API_BASE_URL
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import axios from "axios"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [formMessage, setFormMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

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

      navigate(path)
    } catch (error) {
      setFormMessage({ 
        type: "error", 
        text: error.response.data.error
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
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