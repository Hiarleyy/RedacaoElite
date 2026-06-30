"use client"

import styles from "./styles.module.css"
import { useState, useEffect, use } from 'react';
import Card from '../../../components/Card/Card';
import useUseful from '../../../utils/useUseful';
import Title from '../../../components/Title/Title';
import BTN from '../../../components/Button/Button';
import InfoCard from '../../../components/infoCardRedacao/InfoCardRedacao';
import fetchData from "../../../utils/fetchData";
import SimuladoModal from '../../../components/SimuladoModal/SimuladoModal';
import Loading from '../../../components/Loading/Loading';

const baseURL = import.meta.env.VITE_API_BASE_URL

const Inicio = () => {  const [redacoes, setRedacoes] = useState([]);
  const [usuario, setUsuario] = useState([]);
  const [redacoesCorrigidas, setRedacoesCorrigidas] = useState([]);
  const [simulado,setSimulado] = useState([]);
  const [selectedSimulado, setSelectedSimulado] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingSimulados, setIsLoadingSimulados] = useState(true);
  const { brasilFormatData } = useUseful()


  const getAlunoId = () => {
    const aluno = localStorage.getItem('user_access_data')
    const { id } = JSON.parse(aluno)
    return id
  }
  
  const handleRedacaoClick = (redacao) => {
    // Navegar para a página de detalhes da redação
    window.location.href = `/aluno/redacao/${redacao.id}`;
  };

  const handleSimuladoClick = (simulado) => {
    setSelectedSimulado(simulado);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSimulado(null);
  };


  useEffect(() => {
    const getData = async () => {
      const { getRedacoes,getSimulados } = fetchData()
      const alunoId = getAlunoId()
      const response = await getRedacoes(alunoId)
      const responseSimulados = await getSimulados()
      const responseCorrigidas = await getRedacoes(alunoId, true)
      setSimulado(responseSimulados)
      setRedacoes(response)
      setRedacoesCorrigidas(responseCorrigidas)
      setIsLoadingSimulados(false)
    }
    getData()
  }, [])

  useEffect(() => {
    const getData = async () => {
      const { getAlunoById } = fetchData()
      const response = await getAlunoById(getAlunoId())
      setUsuario(response)
    }
    getData()
  }, [])

  return (
    <div className={styles.container}>
      <Title title="Início" />
      <div className={styles.main_content}>
        <Card
          title={`Olá, ${usuario.nome} !`}
          content="Aprimore suas habilidades de redação com feedback personalizado"
          variant="default"
          actions={
            <>
              <div className={styles.button}>            <BTN
                bg_color="#FFF5CC"
                text_size={{ default: "20px", mobile: "20px" }}
                text_color="#DA9E00"
                padding_sz={{ default: "10px", mobile: "8px" }}
                onClick={() => window.location.href = '/aluno/nova-redacao'}
                className={styles.responsive_button}
              >
                <span className={styles.button_text}>  Criar Nova Redação <i class="fa-solid fa-pencil"></i></span>
              </BTN>

              </div>
            </>
          }
        />
        {/*STATUS DAS REDACOES*/}
        <div className={styles.status_container}>

          <Card
            title="Total de redações"
            content={redacoes.length}
            variant="default"
            icon={
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="44" height="44" rx="10" fill="#FFF5CC" />
                <path d="M26.1831 12.7332L24.2904 14.6257L29.3741 19.709L31.2668 17.8164C32.2444 16.8389 32.2444 15.2552 31.2668 14.2777L29.726 12.7332C28.7484 11.7556 27.1647 11.7556 26.187 12.7332H26.1831ZM23.4067 15.5094L14.2913 24.628C13.8846 25.0346 13.5874 25.5391 13.4232 26.0904L12.0388 30.7944C11.9411 31.1267 12.031 31.4826 12.2735 31.725C12.5159 31.9674 12.8718 32.0574 13.2003 31.9635L17.9046 30.5793C18.456 30.4151 18.9604 30.1179 19.3671 29.7112L28.4903 20.5927L23.4067 15.5094Z" fill="#DA9E00" />
              </svg>

            }
          />
          <Card
            title="Avaliadas"
            content={redacoesCorrigidas.length}
            variant="default"
            icon={
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="44" height="44" rx="10" fill="#DCFCE7" />
                <path d="M22 32C24.6522 32 27.1957 30.9464 29.0711 29.0711C30.9464 27.1957 32 24.6522 32 22C32 19.3478 30.9464 16.8043 29.0711 14.9289C27.1957 13.0536 24.6522 12 22 12C19.3478 12 16.8043 13.0536 14.9289 14.9289C13.0536 16.8043 12 19.3478 12 22C12 24.6522 13.0536 27.1957 14.9289 29.0711C16.8043 30.9464 19.3478 32 22 32ZM26.4141 20.1641L21.4141 25.1641C21.0469 25.5312 20.4531 25.5312 20.0898 25.1641L17.5898 22.6641C17.2227 22.2969 17.2227 21.7031 17.5898 21.3398C17.957 20.9766 18.5508 20.9727 18.9141 21.3398L20.75 23.1758L25.0859 18.8359C25.4531 18.4688 26.0469 18.4688 26.4102 18.8359C26.7734 19.2031 26.7773 19.7969 26.4102 20.1602L26.4141 20.1641Z" fill="#16A34A" />
              </svg>
            }
          />

          <Card
            title="Média de Notas"
            content={redacoesCorrigidas.length > 0
              ? (redacoesCorrigidas.reduce((acc, redacao) => acc + (redacao.correcao?.nota || 0), 0) / redacoesCorrigidas.length).toFixed(1)
              : "0.0"}
            variant="default"
            icon={
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="44" height="44" rx="10" fill="#FFF5CC" />
                <path d="M23.0881 12.703C22.8873 12.2734 22.4631 12 21.9973 12C21.5314 12 21.111 12.2734 20.9065 12.703L18.4711 17.8704L13.0323 18.6985C12.5778 18.7688 12.1991 19.0969 12.0589 19.546C11.9188 19.9952 12.0324 20.4912 12.3582 20.8232L16.3047 24.8501L15.373 30.5409C15.2972 31.0096 15.4866 31.4861 15.8616 31.7634C16.2365 32.0407 16.7327 32.0759 17.1417 31.8532L22.0011 29.1778L26.8604 31.8532C27.2694 32.0759 27.7656 32.0446 28.1406 31.7634C28.5155 31.4822 28.7049 31.0096 28.6291 30.5409L27.6936 24.8501L31.6402 20.8232C31.9659 20.4912 32.0833 19.9952 31.9394 19.546C31.7955 19.0969 31.4205 18.7688 30.966 18.6985L25.5234 17.8704L23.0881 12.703Z" fill="#DA9E00" />
              </svg>
            }
          />
        </div>

        <div className={styles.status_container}>
          <Card
            title="Proposta da semana"
            content="Escreva uma redação dissertativa-argumentativa sobre o tema:"
            variant="default"            actions={
              <>
                <div className={styles.button}>
                  <a 
                    href={`${baseURL}/propostas/download`} 
                    download="proposta-da-semana.pdf"
                    style={{ textDecoration: 'none' }}
                  >
                    <BTN
                      bg_color="#FFF5CC"
                      text_size={{ default: "20px", mobile: "20px" }}
                      text_color="#DA9E00"
                      padding_sz={{ default: "10px", mobile: "8px" }}
                      className={styles.responsive_button}
                    >
                      <span className={styles.button_text} style={{ color: "#DA9E00" }}>
                        Baixar detalhes da Proposta <i className="fa-solid fa-download"></i>
                      </span>
                    </BTN>
                  </a>
                </div>
              </>
            }
          />
        </div>          <div className={styles.simulados_container}>    
          <h3>Simulados Recentes</h3>
          {isLoadingSimulados ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <Loading size="40px"/>
            </div>
          ) : (
            <div className={styles.cards_container}>
              {simulado.slice(-4).map((simulado) => (
                <div key={simulado.id} onClick={() => handleSimuladoClick(simulado)} className={styles.card_clickable}>
                  <InfoCard
                    text_size={{default: "14px", mobile: "14px" }}
                    title={simulado.titulo}
                    subtitle={brasilFormatData(simulado.data)}
                    button={false}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal do Simulado */}
      <SimuladoModal
        simulado={selectedSimulado}
        isOpen={isModalOpen}
        onClose={closeModal}
        brasilFormatData={brasilFormatData}
      />
    </div>
  )
}

export default Inicio