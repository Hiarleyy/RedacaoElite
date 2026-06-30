import styles from "./styles.module.css"
import Title from "../../../components/Title/Title"
import Input from "../../../components/Input/Input"
import Button from "../../../components/Button/Button"
import Message from "../../../components/Message/Message"
import useUseful from "../../../utils/useUseful"
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import axios from "axios"
import fetchData from "../../../utils/fetchData";
import AlunosTabela from "../../../components/AlunosTabela/AlunosTabela"
import DetailsCard from "../../../components/DetailsCard/DetailsCard"
import Loading from "../../../components/Loading/Loading"
import DeleteModal from "../../../components/DeleteModal/DeleteModal"

const baseURL = import.meta.env.VITE_API_BASE_URL

const DetalhesTurma = () => {
  const { turma_id } = useParams()
  const [formMessage, setFormMessage] = useState(null)
  const [turmaData, setTurmaData] = useState({})
  const [turma, setTurma] = useState("")
  const { brasilFormatData, getHeaders } = useUseful()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [modalIsClicked, setModalIsClicked] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await axios.put(
        `${baseURL}/turmas/${turma_id}`, 
        { "nome": turma },
        { headers: getHeaders() }
      )

      setFormMessage({ 
        type: "success", 
        text: `Turma atualizada com sucesso para ${response.data.data.nome}.` 
      })
    } catch (error) {
      setFormMessage({
        type: "error",
        text: error.response.data.error
      });
    } finally {
      setIsLoading(false)
    }
  }

  const deleteTurma = async () => {
    await axios.delete(`${baseURL}/turmas/${turma_id}`, { headers: getHeaders() })
    navigate("/admin/gerenciar-turmas")
  }

  useEffect(() => {
    const getData = async () => {
      setIsLoadingData(true)

      try {
        const { getTurmaById } = fetchData() 
        const response = await getTurmaById(turma_id)
        setTurmaData(response)
      } finally {
        setIsLoadingData(false)
      }
    }
  
    getData()
  }, [])
  

  return (
    <div className={styles.container}>
      <DeleteModal
        message="Você tem certeza que deseja excluir essa turma?"
        modalIsClicked={modalIsClicked}
        deleteOnClick={() => {
          deleteTurma(turma_id)
          setModalIsClicked(false)
        }} 
        cancelOnClick={() => setModalIsClicked(false)} 
      />

      <Title title={`Gerenciar turmas - ${turmaData.nome && turmaData.nome}`} />

      <div className={styles.main_content}>
        <div className={styles.bg_left}>
          {isLoadingData ? (
            <div className={styles.loading}><Loading /></div>
          ) : (
            <>
              <DetailsCard  
                title="Nome"
                content={turmaData.nome && turmaData.nome}
                bg_color="#1A1A1A"
              />

              <DetailsCard  
                title="Total de alunos"
                content={turmaData.usuarios && turmaData.usuarios.length}
                bg_color="#1F1F1F"
              />

              <DetailsCard  
                title="Data de criação"
                content={turmaData.dataCriacao && brasilFormatData(turmaData.dataCriacao)}
                bg_color="#1F1F1F"
              />

              <div className={styles.divider}></div>

              {turmaData.usuarios && <AlunosTabela alunos={turmaData.usuarios} />}

              <div className={styles.delete_btn}>
                <Button 
                  text_size="20px" 
                  text_color="#E0E0E0" 
                  padding_sz="20px" 
                  bg_color="#B2433F" 
                  onClick={() => {
                    setModalIsClicked(true)
                  }}
                ><i className="fa-solid fa-trash"></i> EXCLUIR TURMA</Button>
              </div>
            </>
          )}
        </div>

        <div className={styles.bg_right}>
          <p className={styles.form_title}>Atualize o nome da turma</p>

          <form onSubmit={handleSubmit}>
            <Input
              type="text"
              placeholder="Novo nome da turma"
              color="#1A1A1A"
              value={turma}
              onChange={(e) => setTurma(e.target.value)}
            >
              <i className="fa-solid fa-users"></i>
            </Input>

            <Message 
              text={formMessage ? formMessage.text : ""} 
              type={formMessage ? formMessage.type : ""} 
            />

            <Button 
              text_size="20px" 
              text_color="#E0E0E0" 
              padding_sz="10px" 
              bg_color="#DA9E00"
              isLoading={isLoading}
            >
              ATUALIZAR</Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default DetalhesTurma