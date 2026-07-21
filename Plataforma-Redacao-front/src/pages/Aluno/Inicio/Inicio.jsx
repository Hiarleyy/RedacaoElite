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

import Banner from "../../../images/bannerInicial.png"

const baseURL = import.meta.env.VITE_API_BASE_URL

const Inicio = () => {
  const [redacoes, setRedacoes] = useState([]);
  const [usuario, setUsuario] = useState([]);
  const [redacoesCorrigidas, setRedacoesCorrigidas] = useState([]);
  const [simulado, setSimulado] = useState([]);
  const [selectedSimulado, setSelectedSimulado] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingSimulados, setIsLoadingSimulados] = useState(true);
  const { brasilFormatData } = useUseful()
  const [TemaAtual, setTemaAtual] = useState([])
  const [imagemTema, setImagemTema] = useState(null)
  const [totalPropostas, setTotalPropostas] = useState(0);
  const [notasSimulados, setNotasSimulados] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [aulaSemana, setAulaSemana] = useState(null);
  const [isPlayingAulaSemana, setIsPlayingAulaSemana] = useState(false);

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

  const handleVerSimulado = () => {
    window.location.href = `/aluno/SimuladosAluno`;
  }


  useEffect(() => {
    const getData = async () => {
      const { getRedacoes, getSimulados, getNotasByUsuarioId, getPagamentosByUsuarioId } = fetchData()
      const alunoId = getAlunoId()
      const response = await getRedacoes(alunoId)
      const responseSimulados = await getSimulados()
      const responseCorrigidas = await getRedacoes(alunoId, true)
      let responseNotas = [];
      try {
        responseNotas = await getNotasByUsuarioId(alunoId);
      } catch (e) { }

      let responsePagamentos = [];
      try {
        responsePagamentos = await getPagamentosByUsuarioId(alunoId);
      } catch (e) { }
      console.log(responseSimulados)

      setSimulado(responseSimulados)
      setRedacoes(response)
      setRedacoesCorrigidas(responseCorrigidas)
      setNotasSimulados(responseNotas)
      setPagamentos(responsePagamentos)
      setIsLoadingSimulados(false)
    }
    getData()
  }, [])

  useEffect(() => {
    const getData = async () => {
      const { getAlunoById, getPropostas, getRanking, getModulos } = fetchData()
      const response = await getAlunoById(getAlunoId())
      setUsuario(response)

      try {
        const responseRanking = await getRanking(response?.turmaId || "");
        setRanking(responseRanking);
      } catch (e) { }

      const responseProposta = await getPropostas()
      setTotalPropostas(responseProposta.length)

      // Pegar a última proposta (última criada)
      const responseTemaAtual = responseProposta[responseProposta.length - 1];

      // Quero só o tema não o objeto inteiro
      const TemaAtual = responseTemaAtual.tema;
      setTemaAtual(TemaAtual);

      // Pegando a imagem (Material com nome 'Imagem de capa')
      const materiaisParsed = Array.isArray(responseTemaAtual.materiais) ? responseTemaAtual.materiais : [];
      const bannerMaterial = materiaisParsed?.find(m => m.nome === 'Imagem de capa');
      setImagemTema(bannerMaterial);

      // Buscar último módulo para AULA DA SEMANA
      try {
        const responseModulos = await getModulos();
        if (responseModulos && responseModulos.length > 0) {
          const ultimoModulo = responseModulos[responseModulos.length - 1];
          setAulaSemana(ultimoModulo);
        }
      } catch (e) {
        console.error("Erro ao buscar módulos:", e);
      }
    }
    getData()
  }, []);

  const getYoutubeId = (url) => {
    if (!url) return "";
    try {
      if (url.includes("youtu.be/")) {
        return url.split("youtu.be/")[1]?.split(/[?#]/)[0];
      } else if (url.includes("watch?v=")) {
        return new URL(url).searchParams.get("v");
      } else if (url.includes("embed/")) {
        return url.split("embed/")[1]?.split(/[?#]/)[0];
      } else {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
          return match[2];
        }
      }
    } catch (e) {
      console.error(e);
    }
    return "";
  };

  const getThumbnailUrl = (video) => {
    if (!video) return "";
    if (video.thumbnail) return video.thumbnail;
    const id = getYoutubeId(video.url);
    if (id) return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    return "";
  };

  const getResourceUrl = (material) => {
    if (!material) return null;
    const link = material.caminho || material.link;
    if (!link) return null;
    // Se for um link externo (YouTube, etc.), retorna direto
    if (link.startsWith('http://') || link.startsWith('https://')) return link;
    // Arquivos de upload ficam em /uploads/propostas/ no servidor
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    return `${baseURL}/uploads/propostas/${link}`;
  };

  const totalAtividades = totalPropostas + simulado.length;
  const atividadesConcluidas = redacoes.length + notasSimulados.length;
  const porcentagemProgresso = totalAtividades > 0 ? Math.round((atividadesConcluidas / totalAtividades) * 100) : 0;

  let maxNota = 0;
  if (redacoesCorrigidas && redacoesCorrigidas.length > 0) {
    const sorted = [...redacoesCorrigidas].sort((a, b) => new Date(b.data) - new Date(a.data));
    maxNota = Number(sorted[0].correcao?.nota ?? sorted[0].nota ?? 0);
  }
  const faltamPontos = 1000 - maxNota;
  const percentageJornada = (maxNota / 1000) * 100;

  let proximoPagamento = null;
  if (pagamentos && pagamentos.length > 0) {
    proximoPagamento = pagamentos.find(p => p.dataPagamento === null) || pagamentos[0];
  } else if (usuario?.matricula?.diaVencimento) {
    const day = parseInt(usuario.matricula.diaVencimento);
    if (!isNaN(day)) {
      const today = new Date();
      let year = today.getFullYear();
      let month = today.getMonth();

      if (today.getDate() > day) {
        month += 1;
        if (month > 11) {
          month = 0;
          year += 1;
        }
      }

      const nextPaymentDate = new Date(year, month, day, 12, 0, 0);
      proximoPagamento = {
        dataVencimento: nextPaymentDate.toISOString(),
        descricao: 'Mensalidade Elite'
      };
    }
  }

  let proximoSimulado = null;
  if (simulado && simulado.length > 0) {
    const now = new Date();
    proximoSimulado = simulado.find(s => new Date(s.data_inicio || s.dataInicio) > now) || simulado[simulado.length - 1];
  }

  let displayedRanking = [];
  if (ranking && ranking.length > 0) {
    const alunoId = getAlunoId();
    const userIndex = ranking.findIndex(item => item.id === alunoId);

    if (userIndex !== -1) {
      let start = userIndex - 2;
      let end = userIndex + 2;

      if (start < 0) {
        start = 0;
        end = Math.min(4, ranking.length - 1);
      }
      if (end >= ranking.length) {
        end = ranking.length - 1;
        start = Math.max(0, end - 4);
      }

      displayedRanking = ranking.slice(start, end + 1).map((item, idx) => ({
        ...item,
        position: start + idx + 1,
        isUser: item.id === alunoId
      }));
    } else {
      displayedRanking = ranking.slice(0, 5).map((item, idx) => ({
        ...item,
        position: idx + 1,
        isUser: false
      }));
    }
  }

  return (
    <div className={styles.container}>
      <Title title="Início" />
      <div className={styles.banner_wrapper}>
        <img src={Banner} alt="Banner Inicial" className={styles.banner_img} />
      </div>
      <div className={styles.main_content}>
        <div className={styles.content_esquerda}>
          {/* TEXTO DA SEMANA */}
          <div className={styles.tema_semana_container}>
            <div className={styles.tema_semana_content}>
              <div className={styles.tema_semana_header}>
                <i className="fa-solid fa-star"></i>
                Proposta de redação da semana
              </div>
              <div className={styles.tema_semana_title}>
                {TemaAtual}
              </div>
              <div className={styles.tema_semana_divider}></div>
              <div className={styles.tema_semana_description}>
                <button className={styles.btn_yellow} onClick={() => window.location.href = '/aluno/tema-semanal'}><i className="fa-solid fa-eye"></i> Ver detalhes</button>
              </div>
            </div>
            <div className={styles.tema_semana_image_wrapper}>
              {imagemTema && (
                <img
                  src={getResourceUrl(imagemTema)}
                  alt="Imagem da proposta"
                  className={styles.tema_semana_image}
                />
              )}
            </div>
          </div>

          {/* AULA DA SEMANA */}
          <div className={`${styles.card} ${styles.delay_1}`}>
            <div className={styles.card_header}>
              <i className="fa-brands fa-youtube"></i> AULA DA SEMANA
            </div>
            {aulaSemana && aulaSemana.videos && aulaSemana.videos.length > 0 ? (
              <div className={styles.aula_content}>
                <div className={styles.playerWrapper}>
                  {!isPlayingAulaSemana && (
                    <div 
                      className={styles.customThumbnailOverlay} 
                      onClick={() => setIsPlayingAulaSemana(true)}
                      style={{ backgroundImage: `url(${getThumbnailUrl(aulaSemana.videos[0])})` }}
                    >
                      <div className={styles.playIconCircle}>
                        <i className="fa-solid fa-play"></i>
                      </div>
                    </div>
                  )}
                  {isPlayingAulaSemana && (
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                      src={`https://www.youtube.com/embed/${getYoutubeId(aulaSemana.videos[0].url)}?rel=0&modestbranding=1&autoplay=1`}
                      title={aulaSemana.videos[0].titulo || "Aula da Semana"}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  )}
                </div>
                <button 
                  className={styles.btn_yellow} 
                  style={{ marginTop: '15px' }}
                  onClick={() => window.location.href = `/aluno/modulo/${aulaSemana.id}`}
                >
                  <i className="fa-solid fa-graduation-cap"></i> Ver detalhes
                </button>
              </div>
            ) : (
              <div style={{ color: '#aaaaaa', padding: '10px 0' }}>Ainda não tem aula da semana disponível.</div>
            )}
          </div>

          {/* SUA JORNADA ATÉ A NOTA 1000 */}
          <div className={`${styles.card} ${styles.delay_2}`}>
            <div className={styles.card_header}>
              <i className="fa-solid fa-bullseye"></i> SUA JORNADA ATÉ A NOTA 1000
            </div>
            {redacoesCorrigidas && redacoesCorrigidas.length > 0 ? (
              <div className={styles.jornada_content}>
                <div className={styles.jornada_header}>
                  <span>Progresso do Aluno</span>
                  <span className={styles.jornada_meta}>Meta: 1000</span>
                </div>
                <div className={styles.jornada_bar_container}>
                  <div className={styles.jornada_bar_fill} style={{ width: `${percentageJornada}%` }}>
                    <div className={styles.jornada_tooltip}>{maxNota}</div>
                  </div>
                </div>
                <div className={styles.jornada_labels}>
                  <span>0</span>
                  <span>1000</span>
                </div>
                <div className={styles.jornada_footer}>
                  Faltam <span>{faltamPontos} pontos</span> para alcançar sua meta!
                </div>
              </div>
            ) : (
              <div style={{ color: '#aaaaaa', padding: '10px 0' }}>Você ainda não tem redações corrigidas. Envie uma redação para iniciar sua jornada!</div>
            )}
          </div>

          {/* RANKING GERAL */}
          <div className={`${styles.card} ${styles.delay_3}`}>
            <div className={styles.card_header}>
              <i className="fa-solid fa-trophy"></i> RANKING GERAL
            </div>
            {displayedRanking && displayedRanking.length > 0 ? (
              <div className={styles.ranking_container}>
                <div className={styles.ranking_list} style={{ marginTop: '15px' }}>
                  {displayedRanking.map((item, index) => (
                    <div className={`${styles.ranking_row} ${item.isUser ? styles.highlight : ''}`} key={index}>
                      <span>{item.position}</span> <span>{item.isUser ? "Você" : (item.nome || "Aluno")}</span> <span>{item.ultima_nota || 0} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ color: '#aaaaaa', padding: '10px 0' }}>Ainda não tem ranking disponível.</div>
            )}
            <div className={styles.ranking_footer}>
              Continue evoluindo e <span>suba no ranking!</span>
            </div>
          </div>
        </div>

        <div className={styles.content_direita}>
          {/* PROGRESSO DO ALUNO */}
          <div className={`${styles.card} ${styles.delay_1}`}>
            <div className={styles.card_header}>
              <i className="fa-solid fa-chart-line"></i> PROGRESSO DO ALUNO
            </div>
            <div className={styles.progresso_content}>
              <div className={styles.progresso_circle_wrapper}>
                <div className={styles.progresso_circle}>
                  <div className={styles.progresso_inner}>
                    <span>{porcentagemProgresso}%</span>
                    <small>do caminho percorrido</small>
                  </div>
                </div>
              </div>
              <div className={styles.progresso_stats}>
                <div className={styles.stat_row}>
                  <span className={styles.stat_label}><i className="fa-solid fa-pencil"></i> Redações enviadas</span>
                  <span className={styles.stat_value}>{redacoes.length}/{totalPropostas}</span>
                </div>
                <div className={styles.stat_row}>
                  <span className={styles.stat_label}><i className="fa-regular fa-file-lines"></i> Simulados realizados</span>
                  <span className={styles.stat_value}>{notasSimulados.length}/{simulado.length}</span>
                </div>
              </div>
            </div>
            <div className={styles.progresso_footer}>
              <h4>Você está no caminho certo!</h4>
              <p>Continue firme e chegue ainda mais longe.</p>
            </div>
          </div>

          {/* PRÓXIMO PAGAMENTO */}
          <div className={`${styles.card} ${styles.delay_2}`}>
            <div className={styles.card_header}>
              <i className="fa-solid fa-wallet"></i> PRÓXIMO PAGAMENTO
            </div>
            {proximoPagamento ? (
              <div className={styles.info_block}>
                <div className={styles.info_icon}>
                  <i className="fa-regular fa-calendar"></i>
                </div>
                <div className={styles.info_details}>
                  <span className={styles.info_label}>Vencimento</span>
                  <span className={styles.info_value}>{brasilFormatData(proximoPagamento.dataVencimento || proximoPagamento.data_vencimento || new Date())}</span>
                  <div className={styles.info_actions}>
                    <span className={styles.info_sub}>{proximoPagamento.descricao || 'Mensalidade Elite'}</span>
                    <button className={styles.btn_yellow} onClick={() => window.location.href = '/aluno/pagamentos'}><i className="fa-solid fa-wallet"></i> Ver detalhes</button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ color: '#aaaaaa', padding: '10px 0' }}>Ainda não tem próximos pagamentos.</div>
            )}
          </div>

          {/* PRÓXIMO SIMULADO */}
          <div className={`${styles.card} ${styles.delay_3}`}>
            <div className={styles.card_header}>
              <i className="fa-solid fa-clipboard-list"></i> PRÓXIMO SIMULADO
            </div>
            {proximoSimulado ? (
              <div className={styles.info_details} style={{ marginTop: '10px' }}>
                <span className={styles.info_value}>{proximoSimulado.titulo || proximoSimulado.nome || 'Simulado Elite'}</span>
                <span className={styles.info_label} style={{ marginBottom: '15px' }}><i className="fa-regular fa-calendar"></i> {brasilFormatData(proximoSimulado.data_inicio || proximoSimulado.dataInicio || new Date())}</span>
                <div className={styles.info_actions}>
                  <span className={styles.info_sub}><strong>Tema:</strong> {proximoSimulado.tema || 'Verifique na plataforma'}</span>
                  <button className={styles.btn_yellow} onClick={() => handleVerSimulado(proximoSimulado.id)}>
                    <i className="fa-solid fa-graduation-cap"></i> Ver simulado
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ color: '#aaaaaa', padding: '10px 0' }}>Ainda não tem próximos simulados.</div>
            )}
          </div>

          {/* CONTATO DE SUPORTE */}
          <div className={`${styles.card} ${styles.delay_4}`}>
            <div className={styles.card_header}>
              <i className="fa-solid fa-headset"></i> CONTATO DE SUPORTE
            </div>
            <div className={styles.info_block}>
              <div className={styles.suporte_icon}>
                <i className="fa-solid fa-headset"></i>
              </div>
              <div className={styles.suporte_details}>
                <h4>Precisa de ajuda?</h4>
                <p>Nossa equipe está pronta para te atender!</p>
                <button className={styles.btn_yellow} style={{ marginTop: '10px' }}>
                  <i className="fa-brands fa-whatsapp"></i> Falar com suporte
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Inicio