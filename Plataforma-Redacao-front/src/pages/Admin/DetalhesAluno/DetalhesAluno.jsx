import styles from "./styles.module.css"
import Title from "../../../components/Title/Title"
import Input from "../../../components/Input/Input"
import Button from "../../../components/Button/Button"
import Message from "../../../components/Message/Message"
import InputSelect from "../../../components/InputSelect/InputSelect"
import DetailsCard from "../../../components/DetailsCard/DetailsCard"
import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import axios from "axios"
import fetchData from "../../../utils/fetchData"
import useUseful from "../../../utils/useUseful"
import GraficoNotas from "../../../components/GraficoLinha/GraficoLinha"
import RedacoesTabela from "../../../components/RedacoesTabela/RedacoesTabela"
import Loading from "../../../components/Loading/Loading"
import DeleteModal from "../../../components/DeleteModal/DeleteModal"
import CorrecaoModal from "../../../components/CorrecaoModal/CorrecaoModal"

const baseURL = import.meta.env.VITE_API_BASE_URL

const DetalhesAluno = () => {
  const { aluno_id } = useParams()
  const [alunoData, setAlunoData] = useState(null)
  const [redacoes, setRedacoes] = useState([])
  const [notasRedacoes, setNotasRedacoes] = useState([])
  const [formMessage, setFormMessage] = useState(null)
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [tipoUsuario, setTipoUsuario] = useState("")
  const [turma, setTurma] = useState("")
  const [turmas, setTurmas] = useState([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isLoadingReset, setIsLoadingReset] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [modalIsClicked, setModalIsClicked] = useState(false)
  const [modalRedacaoIsClicked, setModalRedacaoIsClicked] = useState(false)
  const [modalData, setModalData] = useState({})

  const { brasilFormatData, avgNotes, getHeaders } = useUseful()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await axios.put(
        `${baseURL}/usuarios/${aluno_id}`, 
        { 
          nome,
          email,
          tipoUsuario,
          turmaId: turma 
        },
        { headers: getHeaders() }
      );

      setFormMessage({ 
        type: "success", 
        text: `Usuário(a) ${response.data.data.nome} atualizado(a) com sucesso.` 
      });
    } catch (error) {
      setFormMessage({
        type: "error",
        text: error.response.data.error
      });
    } finally {
      setIsLoading(false)
    }
  };

  const resetPassword = async () => {
    try {
      await axios.patch(`${baseURL}/usuarios/${aluno_id}/resetar-senha`, {}, { headers: getHeaders() })
      setFormMessage({
        type: "success",
        text: "Senha resetada com sucesso!"
      });
    } catch (error) {
      setFormMessage({
        type: "error",
        text: error.response.data.error
      });
    } finally {
      setIsLoadingReset(false)
    }
  }

  const deleteAluno = async () => {
    await axios.delete(`${baseURL}/usuarios/${aluno_id}`, { headers: getHeaders() })
    navigate("/admin/gerenciar-alunos")
  };

  useEffect(() => {
    const getData = async () => {
      setIsLoadingData(true)

      try {
        const { getTurmas, getAlunoById } = fetchData()
        const turmasResponse = await getTurmas();
        const alunoResponse = await getAlunoById(aluno_id)

        const options = turmasResponse.map(item => ({
          value: item.id,       
          label: item.nome
        }));

        setTurmas(options);
        setAlunoData(alunoResponse)
      } finally {
        setIsLoadingData(false)
      }
    }

    getData()
  }, [])

  useEffect(() => {
    const getData = async () => {
      setIsLoadingData(true)

      try {
        const { getRedacoes } = fetchData();
        const response = await getRedacoes(aluno_id, true);

        const notas = response.map(item => (
          { data: item.correcao.data, nota: item.correcao.nota }
        ));

        setRedacoes(response);
        setNotasRedacoes(notas);
      } finally {
        setIsLoadingData(false)
      }
    }

    getData()
  }, [])

  useEffect(() => {
    if (alunoData) {
      setNome(alunoData.nome || "");
      setEmail(alunoData.email || "");
      setTipoUsuario(alunoData.tipoUsuario || "");
      setTurma(alunoData.turmaId || "");
    }
  }, [alunoData]);

  return (
    <div className={styles.container}>
      <CorrecaoModal 
        modalData={modalData}
        modalIsClicked={modalRedacaoIsClicked} 
        setModalIsClicked={setModalRedacaoIsClicked}
      />

      <DeleteModal
        message="Você tem certeza que deseja excluir esse(a) aluno(a)?"
        modalIsClicked={modalIsClicked}
        deleteOnClick={() => {
          deleteAluno(aluno_id)
          setModalIsClicked(false)
        }} 
        cancelOnClick={() => setModalIsClicked(false)} 
      />

      <Title title={`Gerenciar alunos - ${alunoData && alunoData.nome ? alunoData.nome : ""}`} />

      <div className={styles.main_content}>
        <div className={styles.bg_left}>
          {isLoadingData ? (
            <div className={styles.loading}><Loading /></div>
          ) : (
            <>
              <DetailsCard  
                title="Nome"
                content={alunoData?.nome}
                bg_color="#1A1A1A"
                text_size="12px"
              />

              <div className={styles.infos}>
                <DetailsCard  
                  title="Email"
                  content={alunoData?.email}
                  bg_color="#1F1F1F"
                  text_size="12px"
                />
                <DetailsCard  
                  title="Data de matrícula"
                  content={brasilFormatData(alunoData?.dataCriacao)}
                  bg_color="#1F1F1F"
                  text_size="12px"
                />
                <DetailsCard  
                  title="Tipo de usuário"
                  content={alunoData?.tipoUsuario}
                  bg_color="#1F1F1F"
                  text_size="12px"
                />
                <DetailsCard  
                  title="Média das notas"
                  content={notasRedacoes?.length === 0 ? 0 : avgNotes(notasRedacoes).toFixed(2)}
                  bg_color="#1F1F1F"
                  text_size="12px"
                />
              </div>

              <RedacoesTabela 
                redacoes={redacoes} 
                onClick={() => {
                  console.log("aqui")
                  setModalRedacaoIsClicked(true)
                }}
                setModalData={setModalData}
              />

              <GraficoNotas array={notasRedacoes} height_size="300px" />

              <Button 
                text_size="15px" 
                text_color="#E0E0E0" 
                padding_sz="10px" 
                bg_color="#B2433F" 
                onClick={() => {
                  setModalIsClicked(true)
                }}
              >
                <i className="fa-solid fa-trash"></i> EXCLUIR ALUNO
              </Button>
            </>
          )}
        </div>

        <div className={styles.bg_right}>
          <p className={styles.form_title}>Atualize os dados do aluno</p>

          <form onSubmit={handleSubmit}>
            <Input
              type="text"
              placeholder="Nome"
              color="#1A1A1A"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            >
              <i className="fa-solid fa-user"></i>
            </Input>

            <Input
              type="email"
              placeholder="Email"
              color="#1A1A1A"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            >
              <i className="fa-solid fa-envelope"></i>
            </Input>

            <InputSelect 
              color="#1A1A1A"
              text="Selecione o tipo de usuário"
              value={tipoUsuario}
              onChange={(e) => setTipoUsuario(e.target.value)}
              options={[
                { value: "STANDARD", label: "STANDARD" },
                { value: "ADMIN", label: "ADMIN" }
              ]}
            />

            <InputSelect 
              color="#1A1A1A"
              text="Selecione a turma"
              value={turma}
              onChange={(e) => setTurma(e.target.value)}
              options={turmas}
            />

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
              ATUALIZAR
            </Button>
          </form>

          <Button 
            text_size="20px" 
            text_color="#E0E0E0" 
            padding_sz="10px" 
            bg_color="#B2433F"
            isLoading={isLoadingReset}
            onClick={resetPassword}
          >
            RESETAR SENHA
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DetalhesAluno

