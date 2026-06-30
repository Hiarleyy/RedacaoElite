import styles from "./styles.module.css"
import Title from "../../../components/Title/Title"
import { useEffect, useState } from "react"
import fetchData from "../../../utils/fetchData"
import Carousel from "../../../components/Carousel/Carousel"
import Loading from "../../../components/Loading/Loading"
import Message from "../../../components/Message/Message"

const Cursos = () => {
  const [modulos, setModulos] = useState([])
  const [isLoadingData, setIsLoadingData] = useState(false)

  useEffect(() => {
    const getData = async () => {
      setIsLoadingData(true)

      try {
        const { getModulos } = fetchData() 
        const response = await getModulos()
        setModulos(response)
      } catch (error) {
        console.error("Erro ao carregar dados dos cursos:", error)
      } finally {
        setIsLoadingData(false)
      }
    }
  
    getData()
  }, [])

  return (
    <div className={styles.container}>
      <Title title="Cursos" />
      
      <div className={styles.main_content}>
        {isLoadingData ? (
          <Loading />
        ) : (
          modulos.length === 0 ? (
            <Message 
              text="Nenhum curso cadastrado." 
              text_color="#E0E0E0"
            />
          ) : (
            modulos.map((modulo) => (
              <Carousel key={modulo.id} array={modulo.videos} text={modulo.nome} />
            ))
          )
        )}
      </div>
    </div>
  )
}

export default Cursos