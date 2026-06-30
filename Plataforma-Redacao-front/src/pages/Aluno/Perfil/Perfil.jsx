"use client";

import { useState, useEffect } from 'react';
import useUseful from '../../../utils/useUseful';
import styles from "./styles.module.css";
import Title from "../../../components/Title/Title";
import fetchData from '../../../utils/fetchData';
import Pagination from '../../../components/Pagination/Pagination';
import InfoCard from '../../../components/infoCardRedacao/InfoCardRedacao';
import GraficoRedacoes from '../../../components/GraficoRedacoes/GraficoRedacoes';
import defaultProfilePicture from '../../../images/Defalult_profile_picture.jpg';
import RedacaoModal from '../../../components/RedacaoModal/RedacaoModal';
import Loading from '../../../components/Loading/Loading';

const baseURL = import.meta.env.VITE_API_BASE_URL

const Perfil = () => {  const [usuario, setUsuario] = useState([]);
  const [activeTab, setActiveTab] = useState('minhas');
  const [redacoes, setRedacoes] = useState([]);
  const [redacoesCorrigidas, setRedacoesCorrigidas] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(true);
  // Estados para o modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRedacao, setSelectedRedacao] = useState(null);

  const { brasilFormatData } = useUseful()

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentRedacoes = redacoes.slice(indexOfFirstItem, indexOfLastItem)
  const currentRedacoesCorrigidas = redacoesCorrigidas.slice(indexOfFirstItem, indexOfLastItem)

  const getAlunoId = () => {
      const aluno = localStorage.getItem('user_access_data')
      const {id} = JSON.parse(aluno)
      return id
  }

  // Função para abrir o modal com a redação selecionada
  const handleRedacaoClick = (redacao) => {
    setSelectedRedacao(redacao);
    setModalOpen(true);
  };

  // Função para fechar o modal
  const closeModal = () => {
    setModalOpen(false);
    setSelectedRedacao(null);
  };

  // Responsividade para mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
    useEffect(() => {
    const getData = async () => {
      const { getRedacoes, getAlunoById, getCorrecoes} = fetchData() 
      const alunoId = getAlunoId()
      
      try {
        // Buscar todas as redações do usuário pendentes
        const response = await getRedacoes(alunoId,false,true)
        setRedacoes(response)
        
        // Buscar redações corrigidas do usuário
        const responseCorrigidas = await getRedacoes(alunoId, true)
        setRedacoesCorrigidas(responseCorrigidas)

        
        // Buscar dados do aluno
        const responseAluno = await getAlunoById(alunoId)
        setUsuario(responseAluno)
      } finally {
        setLoading(false)
      }
    }

    getData()
  }, [])


  return (
    <div className={styles.container}>
      <Title title="Perfil" />
      <div className={styles.main_content}>
        <div className={styles.perfil}>
          <div>
            <div className={styles.header_container}>
              <img className={styles.img_container} 
              src={usuario.caminho ? `${baseURL}/usuarios/${usuario.id}/profile-image` : defaultProfilePicture} alt="" />
              <h3>{usuario.nome && usuario.nome}</h3>
              <p>Entrou em 24/04/2025</p>
            </div>
          </div>

          {/* Métricas */}
          <div className={styles.metrics}>
            <span className={styles.metrics_status}>Total de redações: <a>{redacoes.length}</a></span>
            <span className={styles.metrics_status}>Avaliadas: <a>{redacoesCorrigidas.length}</a></span>
            <span className={styles.metrics_status}>Redações Nota 1000: <a>
              {redacoesCorrigidas.filter(redacao => redacao.correcao?.nota === 1000).length}
            </a></span>
            <span className={styles.metrics_status}>Média de Notas: <a>
              {redacoesCorrigidas.length > 0 
              ? (redacoesCorrigidas.reduce((acc, redacao) => acc + (redacao.correcao?.nota || 0), 0) / redacoesCorrigidas.length).toFixed(1)
              : '0'}
            </a></span>
          </div>
          
          {/* Gráfico de notas */}
          <div className={styles.chart_container}>
            <GraficoRedacoes
              data={redacoesCorrigidas.map(redacao => ({
                data: redacao.data,
                nota: redacao.correcao?.nota || 0,
                titulo: redacao.titulo
              }))}
              xKey="data"
              yKey="nota"
              title="Evolução das Notas"
              height_size={isMobile ? "250px" : "300px"}
            />
          </div>
        </div>

        {/* Aba de redações */}
        <div className={styles.aba_redacoes}>
          <div className={styles.menu_redacoes}>
            <div className={styles.tab_buttons}>
              <button 
                className={`${styles.tab_button} ${activeTab === 'minhas' ? styles.active_tab : ''}`}
                onClick={() => setActiveTab('minhas')}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M14 0H2C0.9 0 0 0.9 0 2V14C0 15.1 0.9 16 2 16H14C15.1 16 16 15.1 16 14V2C16 0.9 15.1 0 14 0ZM12 10H4V8H12V10ZM12 6H4V4H12V6Z" fill={activeTab === 'minhas' ? '#DA9E00' : '#666666'}/>
                </svg>
                Minhas redações
              </button>
              <button 
                className={`${styles.tab_button} ${activeTab === 'avaliadas' ? styles.active_tab : ''}`}
                onClick={() => setActiveTab('avaliadas')}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 10.7L3.3 8L2 9.3L6 13.3L14 5.3L12.7 4L6 10.7Z" fill={activeTab === 'avaliadas' ? '#DA9E00' : '#666666'}/>
                </svg>
                Redações Avaliadas
              </button>
            </div>            <div className={styles.tab_content}>
              {loading ? (
                <div className={styles.loading_container}>
                  <Loading size="50px"/>
                </div>
              ) : activeTab === 'minhas' ? (
                <div className={styles.minhas_redacoes}>
                  <div className={styles.cards_container}>
                    {currentRedacoes.map((redacao) => (
                      <div key={redacao.id} onClick={() => handleRedacaoClick(redacao)} className={styles.card_clickable}>
                        <InfoCard 
                          title={redacao.titulo} 
                          subtitle={brasilFormatData(redacao.data)}
                          button={false}
                          img="https://static.vecteezy.com/system/resources/previews/028/049/250/non_2x/terms-icon-design-vector.jpg"
                        />
                      </div>
                    ))}
                  </div>
                  <div className={styles.pagination_container}>
                    <Pagination
                      currentPage={currentPage}
                      totalItems={redacoes.length}
                      itemsPerPage={itemsPerPage}
                      setCurrentPage={setCurrentPage}
                    />
                  </div>
                </div>
              ) : (
                <div className={styles.redacoes_avaliadas}>
                  <div className={styles.cards_container}>
                    {currentRedacoesCorrigidas.map((redacao) => (
                      <div key={redacao.id} onClick={() => handleRedacaoClick(redacao)} className={styles.card_clickable}>
                        <InfoCard 
                          title={redacao.titulo} 
                          subtitle={brasilFormatData(redacao.data)}
                          button={false}
                          img="https://static.vecteezy.com/system/resources/previews/028/049/250/non_2x/terms-icon-design-vector.jpg"
                        />
                      </div>
                    ))}
                  </div>
                  <div className={styles.pagination_container}>
                    <Pagination
                      currentPage={currentPage}
                      totalItems={redacoesCorrigidas.length}
                      itemsPerPage={itemsPerPage}
                      setCurrentPage={setCurrentPage}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>      {/* Modal para exibir detalhes da redação */}
      <RedacaoModal 
        redacao={selectedRedacao} 
        isOpen={modalOpen} 
        onClose={closeModal}
        activeTab={activeTab}
        brasilFormatData={brasilFormatData}
      />
    </div>
  );
};

export default Perfil;
