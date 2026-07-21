import styles from "../NovaRedacao/styles.module.css";
import Title from "../../../components/Title/Title";
import Button from "../../../components/Button/Button";
import Input from "../../../components/Input/Input";
import { useEffect, useState, useCallback, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import imageCompression from "browser-image-compression";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import InfoCard from "../../../components/infoCardRedacao/InfoCardRedacao";
import Pagination from "../../../components/Pagination/Pagination";
import Loading from "../../../components/Loading/Loading";
import Message from "../../../components/Message/Message";
import fetchData from "../../../utils/fetchData";
import { useNavigate } from "react-router-dom";
import CorrecaoModal from "../../../components/CorrecaoModal/CorrecaoModal";
import DeleteModal from "../../../components/DeleteModal/DeleteModal";
import useUseful from "../../../utils/useUseful";
const baseURL = import.meta.env.VITE_API_BASE_URL

const Novaredacao = () => {
  const [fileName, setFilesName] = useState("Nenhum arquivo enviado");


  const [tema, setTema] = useState("");
  const [propostas, setPropostas] = useState([]);
  const [formMessage, setFormMessage] = useState(null);
  const [fileBlob, setFileBlob] = useState(null);
  const [redacao, setRedacao] = useState([])

  // Estados para controlar o envio
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  // Ref para evitar múltiplos cliques
  const isSubmittingRef = useRef(false);
  const cooldownRef = useRef(false);
  const lastClickTimeRef = useRef(0);
  const submissionInProgressRef = useRef(null); // Promise para controlar submissão única
  const cooldownTimeoutRef = useRef(null); // Ref para controlar timeout

  // Limpeza quando componente desmonta
  useEffect(() => {
    return () => {
      if (cooldownTimeoutRef.current) {
        clearTimeout(cooldownTimeoutRef.current);
      }
      isSubmittingRef.current = false;
      cooldownRef.current = false;
      submissionInProgressRef.current = null;
    };
  }, []);

  const { brasilFormatData } = useUseful();
  const { getHeaders } = useUseful();

  const getAlunoId = useCallback(() => {
    try {
      const aluno = localStorage.getItem('user_access_data')
      if (!aluno) {
        console.error('Dados do usuário não encontrados no localStorage');
        return null;
      }
      const userData = JSON.parse(aluno)
      if (!userData || !userData.id) {
        console.error('ID do usuário não encontrado nos dados:', userData);
        return null;
      }
      return userData.id;
    } catch (error) {
      console.error('Erro ao obter ID do aluno:', error);
      return null;
    }
  }, []);

  // Função para cancelar evento se necessário
  const preventMultipleClicks = useCallback((event) => {
    if (isSubmittingRef.current || cooldownRef.current || submissionInProgressRef.current) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      console.log("Evento cancelado - submissão em progresso");
      return true;
    }
    return false;
  }, []);

  // Função principal de envio com controle único
  const handleSubmit = useCallback(async () => {
    // Verificação tripla de segurança
    if (isSubmittingRef.current || cooldownRef.current || submissionInProgressRef.current) {
      console.log("Requisição bloqueada - já está processando");
      return;
    }

    // Verificar se já está enviando ou em cooldown (verificação de estado também)
    if (isSubmitting || cooldown) {
      console.log("Requisição bloqueada - estado ativo");
      return;
    }

    if (!tema.trim()) {
      alert("Por favor, selecione o tema da redação.");
      return;
    }

    if (!fileBlob) {
      alert("Por favor, faça o upload do arquivo da redação.");
      return;
    }

    // Verificar tamanho do arquivo (limite de 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB em bytes
    if (fileBlob.size > MAX_FILE_SIZE) {
      setFormMessage({
        type: "error",
        text: "O arquivo é muito grande. O tamanho máximo permitido é 10MB."
      });
      return;
    }

    const alunoId = getAlunoId();
    console.log("AlunoId:", alunoId);
    console.log("BaseURL:", baseURL);

    if (!alunoId) {
      setFormMessage({
        type: "error",
        text: "Erro: ID do aluno não encontrado. Faça login novamente."
      });
      return;
    }

    // Criar promise de controle para submissão única
    const submissionPromise = new Promise(async (resolve, reject) => {
      try {
        // Bloquear imediatamente todas as referencias
        isSubmittingRef.current = true;
        setIsSubmitting(true);
        setFormMessage(null);
        console.log("Iniciando envio da redação - BLOQUEADO");

        const uploadURL = `${baseURL}/redacoes/${alunoId}/upload`;
        console.log("URL de upload:", uploadURL);

        const formData = new FormData();
        formData.append("titulo", tema);
        formData.append("file", fileBlob, fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);
        formData.append("usuarioId", alunoId);

        const response = await axios.post(uploadURL, formData, {
          headers: getHeaders(),
        });

        console.log("Redação enviada com sucesso!");
        setFormMessage({
          type: "success",
          text: `Redação enviada com sucesso!`,
        });

        // Limpar formulário
        setTema("");
        setFilesName("Nenhum arquivo enviado");
        setFileBlob(null);

        // Iniciar cooldown de 5 segundos
        cooldownRef.current = true;
        setCooldown(true);

        // Limpar timeout anterior se existir
        if (cooldownTimeoutRef.current) {
          clearTimeout(cooldownTimeoutRef.current);
        }

        cooldownTimeoutRef.current = setTimeout(() => {
          cooldownRef.current = false;
          setCooldown(false);
          cooldownTimeoutRef.current = null;
          console.log("Cooldown finalizado");
        }, 5000);

        resolve(response);
      } catch (error) {
        console.error("Erro ao enviar redação:", error);
        let errorMessage = "Erro ao enviar redação.";

        setFormMessage({
          type: "error",
          text: errorMessage,
        });
        reject(error);
      } finally {
        // Liberar todos os bloqueios
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        submissionInProgressRef.current = null;
        console.log("Processo de envio finalizado - DESBLOQUEADO");
      }
    });

    // Armazenar a promise de controle
    submissionInProgressRef.current = submissionPromise;

    return submissionPromise;
  }, [tema, fileBlob, fileName, isSubmitting, cooldown, getAlunoId, getHeaders]);

  // Função para verificar se pode submeter
  const canSubmit = useCallback(() => {
    return !isSubmittingRef.current &&
      !cooldownRef.current &&
      !submissionInProgressRef.current &&
      !isSubmitting &&
      !cooldown;
  }, [isSubmitting, cooldown]);

  // Função com debounce e controle rigoroso
  const handleSubmitWithDebounce = useCallback(async (event) => {
    // Cancelar evento se necessário
    if (preventMultipleClicks(event)) {
      return;
    }

    // Verificação final de integridade
    if (!canSubmit()) {
      console.log("Botão bloqueado - condições não atendidas");
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const now = Date.now();
    const timeSinceLastClick = now - lastClickTimeRef.current;

    // Debounce de 2 segundos entre cliques (aumentado)
    if (timeSinceLastClick < 2000) {
      console.log("Clique muito rápido - ignorado");
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    lastClickTimeRef.current = now;
    await handleSubmit();
  }, [handleSubmit, preventMultipleClicks, canSubmit]);

  const navigate = useNavigate()

  const itemsPerPage = 5
  const [currentPage, setCurrentPage] = useState(1)

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage

  const currentredacaos = redacao.slice(indexOfFirstItem, indexOfLastItem)

  const [usuario, setUsuario] = useState([]);
  // Estado para o modal de redação
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRedacao, setSelectedRedacao] = useState(null);

  // Estados para o modal de delete
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [redacaoToDelete, setRedacaoToDelete] = useState(null);

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    setFilesName(file.name);

    if (!file) return;

    if (file.type.startsWith("image/")) {
      try {
        const compressedImage = await imageCompression(file, {
          maxSizeMB: 5,
          useWebWorker: true,
        });

        const imageData = await compressedImage.arrayBuffer();
        const pdfDoc = await PDFDocument.create();
        const imageExit = file.type.includes("png")
          ? await pdfDoc.embedPng(imageData)
          : await pdfDoc.embedJpg(imageData);

        const page = pdfDoc.addPage([
          imageExit.width * 0.7,
          imageExit.height * 0.7,
        ]);
        page.drawImage(imageExit, {
          x: 0,
          y: 0,
          width: imageExit.width * 0.7,
          height: imageExit.height * 0.7,
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });

        setFileBlob(blob);
      } catch (error) {
        console.error("Erro ao processar imagem:", error);
      }
    } else if (file.type === "application/pdf") {
      setFileBlob(file);
    } else {
      alert("Formato de arquivo não aceito");
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  const formatarData = (data) => {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }; useEffect(() => {
    const getData = async () => {
      try {
        const alunoId = getAlunoId();
        const { getRedacoesUser } = fetchData();
        const redacoesData = await getRedacoesUser(alunoId);
        if (redacoesData) {
          const options = redacoesData.map(item => ({
            id: item.id,
            titulo: item.titulo,
            status: item.status,
            data: item.data,
            usuarioId: item.usuarioId,
            correcao: item.correcao
          })).sort((a, b) => new Date(b.data) - new Date(a.data));
          setRedacao(options);
        } else {
          console.error('Nenhuma redação encontrada');
          setRedacao([]);
        }
      } catch (error) {
        console.error('Erro ao buscar redações:', error.message);
        setRedacao([]);
      }
    }
    getData()
  }, [formMessage]) // Atualizar quando enviar uma nova redação
  useEffect(() => {
    const getData = async () => {
      const { getAlunoById, getPropostas } = fetchData()
      const alunoId = getAlunoId();
      const response = await getAlunoById(alunoId)
      setUsuario(response)

      try {
        const responsePropostas = await getPropostas();
        setPropostas(responsePropostas);
      } catch (e) {
        console.error("Erro ao buscar propostas", e);
      }
    }
    getData()
  }, [])

  // Função para abrir o modal com a redação selecionada
  const handleRedacaoClick = (redacao) => {
    setSelectedRedacao({ ...redacao, usuario: usuario });
    setModalOpen(true);
  };

  // Função para fechar o modal
  const closeModal = () => {
    setModalOpen(false);
    setSelectedRedacao(null);
  };

  // Função para abrir o modal de delete
  const handleDeleteRedacao = (redacao) => {
    setRedacaoToDelete(redacao);
    setDeleteModalOpen(true);
  };

  // Função para confirmar o delete da redação
  const confirmDeleteRedacao = async () => {
    if (!redacaoToDelete) return;

    try {
      await axios.delete(`${baseURL}/redacoes/${redacaoToDelete.id}`, {
        headers: getHeaders()
      });

      setFormMessage({
        type: "success",
        text: "Redação deletada com sucesso!"
      });

      // Atualizar a lista de redações
      const alunoId = getAlunoId();
      const { getRedacoesUser } = fetchData();
      const redacoesData = await getRedacoesUser(alunoId);
      if (redacoesData) {
        const options = redacoesData.map(item => ({
          id: item.id,
          titulo: item.titulo,
          status: item.status,
          data: item.data,
          usuarioId: item.usuarioId,
          correcao: item.correcao
        })).sort((a, b) => new Date(b.data) - new Date(a.data));
        setRedacao(options);
      }

    } catch (error) {
      console.error("Erro ao deletar redação:", error);
      setFormMessage({
        type: "error",
        text: "Erro ao deletar redação. Tente novamente."
      });
    } finally {
      setDeleteModalOpen(false);
      setRedacaoToDelete(null);
    }
  };

  // Função para cancelar o delete
  const cancelDeleteRedacao = () => {
    setDeleteModalOpen(false);
    setRedacaoToDelete(null);
  };



  return (
    <div className={styles.container}>
      <Title title="Nova Redação" />
      <div className={styles.main_content}>
        <div className={styles.bg_left}>
          <div className={styles.section_header}>
            <div className={styles.icon_yellow_large}>
              <i className="fa-solid fa-cloud-arrow-up"></i>
            </div>
            <div>
              <h3 className={styles.section_title}>ENVIAR <span>NOVA REDAÇÃO</span></h3>
              <p className={styles.section_subtitle}>Faça o upload do seu arquivo em PDF, JPG ou PNG</p>
            </div>
          </div>

          <div className={styles.upload_container}>
            <div className={styles.select_container}>
              <select
                className={styles.tema_select}
                value={tema}
                onChange={(e) => setTema(e.target.value)}
              >
                <option value="">Selecione o tema da redação</option>
                {propostas && propostas.map((prop) => {
                  const dataFinal = prop.data_final || prop.dataFinal;
                  const isExpired = dataFinal ? new Date(dataFinal) < new Date() : false;

                  return (
                    <option
                      key={prop.id}
                      value={prop.tema || prop.titulo}
                      disabled={isExpired}
                    >
                      {prop.tema || prop.titulo} {isExpired ? '(Prazo encerrado)' : ''}
                    </option>
                  )
                })}
              </select>
            </div>

            <div {...getRootProps()} className={styles.desktop_upload_area}>
              <input {...getInputProps()} />
              <div className={styles.upload_icon_wrapper}>
                <i className="fa-solid fa-cloud-arrow-up"></i>
              </div>
              <p className={styles.desktop_upload_title}>
                <span>ARRASTE E SOLTE SEU ARQUIVO AQUI</span><br />
                ou clique para selecionar
              </p>
              <div className={styles.accepted_formats}>
                Formatos aceitos: PDF, JPG ou PNG
              </div>
            </div>

            {fileBlob && (
              <div className={styles.desktop_file_selected}>
                <i className={`fa-solid fa-file-pdf ${styles.desktop_file_icon}`}></i>
                <span className={styles.desktop_file_name}>{fileName}</span>
                <i
                  className={`fa-solid fa-times ${styles.desktop_file_remove}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilesName("Nenhum arquivo enviado");
                    setFileBlob(null);
                  }}
                ></i>
              </div>
            )}

            <div className={styles.info_container}>
              <Message
                text={formMessage ? formMessage.text : ""}
                type={formMessage ? formMessage.type : ""}
              />
            </div>

            <div className={styles.important_warning}>
              <i className="fa-solid fa-circle-info"></i>
              <div>
                <strong>IMPORTANTE</strong>
                <p>Verifique se seu arquivo está legível e completo antes do envio.<br />Após o envio, não será possível realizar alterações.</p>
              </div>
            </div>

            <div className={styles.submit_button}>
              <button
                className={`${styles.desktop_button_full} ${(!fileBlob || !tema.trim() || isSubmitting || cooldown) ? styles.disabled : ''}`}
                onClick={handleSubmitWithDebounce}
                disabled={isSubmitting || cooldown}
              >
                {isSubmitting ? (
                  <>
                    Enviando...
                    <i className={`fa-solid fa-spinner fa-spin ${styles.desktop_button_icon}`}></i>
                  </>
                ) : cooldown ? (
                  <>
                    Aguarde...
                    <i className={`fa-solid fa-clock ${styles.desktop_button_icon}`}></i>
                  </>
                ) : (
                  <>
                    <i className={`fa-solid fa-paper-plane`} style={{ marginRight: '8px' }}></i>
                    ENVIAR REDAÇÃO
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.bg_right}>
          <div className={styles.section_header}>
            <div className={styles.icon_yellow_outline}>
              <i className="fa-regular fa-file-lines"></i>
            </div>
            <div>
              <h3 className={styles.section_title}>REDAÇÕES <span>ENVIADAS</span></h3>
              <p className={styles.section_subtitle}>Acompanhe todas as suas redações enviadas</p>
            </div>
          </div>

          {redacao.length === 0 ? <div className={styles.loading}><Loading /></div> :
            <>
              <div className={styles.redacao_container}>
                {currentredacaos.map((redacao, index) => (
                  <div key={redacao.id} className={styles.card_wrapper}>
                    <div className={styles.sent_card} onClick={(e) => {
                      e.preventDefault();
                      handleRedacaoClick(redacao);
                    }}>
                      <div className={styles.sent_card_left}>
                        <div className={styles.sent_icon_box}>
                          <i className="fa-solid fa-file-pdf"></i>
                          <span>PDF</span>
                        </div>
                        <div className={styles.sent_info}>
                          {index === 0 && currentPage === 1 && (
                            <span className={styles.most_recent}>MAIS RECENTE</span>
                          )}
                          <h4>{redacao.titulo}</h4>
                          <p><i className="fa-regular fa-calendar"></i> {formatarData(redacao.data)}</p>
                        </div>
                      </div>
                      <div className={styles.sent_card_right}>
                        <span className={styles.status_enviado}>ENVIADO <i className="fa-solid fa-check"></i></span>
                        <button className={styles.btn_options} onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteRedacao(redacao);
                        }}>
                          <i className="fa-solid fa-ellipsis-vertical"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.pagination}>
                <Pagination
                  currentPage={currentPage}
                  totalItems={redacao.length}
                  itemsPerPage={itemsPerPage}
                  setCurrentPage={setCurrentPage}
                />
              </div>
            </>
          }
        </div>
      </div>

      {/* Modal para confirmação de delete */}
      <DeleteModal
        message="Você tem certeza que deseja excluir esta redação?"
        modalIsClicked={deleteModalOpen}
        deleteOnClick={confirmDeleteRedacao}
        cancelOnClick={cancelDeleteRedacao}
      />

      {/* Modal para visualização da redação/correção */}
      <CorrecaoModal
        modalData={selectedRedacao}
        modalIsClicked={modalOpen}
        setModalIsClicked={setModalOpen}
      />
    </div>
  );
};

export default Novaredacao;