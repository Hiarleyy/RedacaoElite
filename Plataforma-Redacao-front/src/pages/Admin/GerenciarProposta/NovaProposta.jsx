import React, { useEffect, useState, useCallback } from "react";
import styles from "./styles.module.css";
import Title from "../../../components/Title/Title";
import Input from "../../../components/Input/Input";
import { PDFDocument } from "pdf-lib";
import imageCompression from "browser-image-compression";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import Pagination from "../../../components/Pagination/Pagination";
import Loading from "../../../components/Loading/Loading";
import Message from "../../../components/Message/Message";
import fetchData from "../../../utils/fetchData";
import { useNavigate } from "react-router-dom";
import RedacaoModal from "../../../components/RedacaoModal/RedacaoModal";
import DeleteModal from "../../../components/DeleteModal/DeleteModal";
import useUseful from "../../../utils/useUseful";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const NovaProposta = () => {
  const [propostas, setPropostas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formMessage, setFormMessage] = useState(null);

  // Modal Cadastrar Tema States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [tema, setTema] = useState("");
  const [fileName, setFilesName] = useState("Nenhum arquivo enviado");
  const [fileBlob, setFileBlob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Outros modais
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProposta, setSelectedProposta] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [propostaToDelete, setPropostaToDelete] = useState(null);

  // Paginação
  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const { getHeaders, brasilFormatData } = useUseful();

  const fetchPropostas = useCallback(async () => {
    setIsLoading(true);
    try {
      const { getPropostas } = fetchData();
      const response = await getPropostas();
      if (response) {
        const options = response.map(item => ({
          id: item.id,
          tema: item.tema,
          dataInicial: item.dataInicial,
          dataFinal: item.dataFinal,
          eixos: item.eixos || [],
          materiais: item.materiais || []
        })).sort((a, b) => new Date(b.dataInicial) - new Date(a.dataInicial));
        setPropostas(options);
      } else {
        setPropostas([]);
      }
    } catch (error) {
      console.error('Erro ao buscar propostas:', error.message);
      setPropostas([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPropostas();
  }, [fetchPropostas]);

  // Upload Handlers
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

  const handleSubmit = async () => {
    if (!fileBlob || !tema.trim()) {
      setFormMessage({
        type: "error",
        text: "Preencha o tema e envie um arquivo válido."
      });
      return;
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (fileBlob.size > MAX_FILE_SIZE) {
      setFormMessage({
        type: "error",
        text: "O arquivo é muito grande. O tamanho máximo permitido é 10MB."
      });
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("tema", tema);
    formData.append("file", fileBlob, fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);

    try {
      await axios.post(`${baseURL}/propostas`, formData, {
        headers: getHeaders(),
      });
      setFormMessage({
        type: "success",
        text: `Proposta enviada com sucesso!`,
      });
      setTema("");
      setFilesName("Nenhum arquivo enviado");
      setFileBlob(null);
      setIsUploadModalOpen(false);
      fetchPropostas();
    } catch (error) {
      console.error(error);
      setFormMessage({
        type: "error",
        text: "Erro ao enviar proposta.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatarData = (data) => {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  // Delete Actions
  const handleDeleteProposta = (proposta) => {
    setPropostaToDelete(proposta);
    setDeleteModalOpen(true);
  };

  const confirmDeleteProposta = async () => {
    if (!propostaToDelete) return;
    try {
      await axios.delete(`${baseURL}/propostas/${propostaToDelete.id}`, {
        headers: getHeaders()
      });
      fetchPropostas();
      window.location.reload();
    } catch (error) {
      console.error("Erro ao deletar proposta:", error);
    } finally {
      setDeleteModalOpen(false);
      setPropostaToDelete(null);
    }
  };

  const cancelDeleteProposta = () => {
    setDeleteModalOpen(false);
    setPropostaToDelete(null);
  };

  // View Actions
  const handlePropostaClick = (proposta) => {
    setSelectedProposta(proposta);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedProposta(null);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPropostas = propostas.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className={styles.container}>
      <Title title="Temas" />

      <div className={styles.mainLayout}>
        {/* Filters Bar */}
        <div className={styles.filtersBar}>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Buscar tema</span>
            <div className={styles.filterInputWrapper}>
              <i className={`fa-solid fa-search ${styles.filterIcon}`}></i>
              <input type="text" className={styles.filterInput} placeholder="Pesquise por título ou palavra-chave..." />
            </div>
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Período de disponibilização</span>
            <div className={styles.dateGroup}>
              <div className={styles.dateInputWrapper}>
                <input type="date" className={styles.dateInput} />
              </div>
              <span className={styles.dateSeparator}>até</span>
              <div className={styles.dateInputWrapper}>
                <input type="date" className={styles.dateInput} />
              </div>
            </div>
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Status</span>
            <select className={styles.filterSelect} defaultValue="Todos">
              <option value="Todos">Todos</option>
            </select>
          </div>

          <div className={styles.actionButtons}>
            <button className={styles.clearBtn}>
              <i className="fa-solid fa-filter-circle-xmark"></i> Limpar filtros
            </button>
            <button className={styles.newThemeBtn} onClick={() => navigate("/admin/cadastrar-proposta")}>
              Cadastrar novo tema
            </button>
          </div>
        </div>

        {formMessage && (
          <Message text={formMessage.text} type={formMessage.type} />
        )}

        {/* Table Section */}
        {isLoading ? (
          <div className={styles.loading}><Loading /></div>
        ) : (
          <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
              <div>TEMA</div>
              <div className={styles.colEixos}>EIXOS ASSOCIADOS</div>
              <div className={styles.colPeriodo}>PERÍODO</div>
              <div>STATUS</div>
              <div>AÇÕES</div>
            </div>

            <div className={styles.tableBody}>
              {currentPropostas.map((proposta) => (
                <div key={proposta.id} className={styles.tableRow}>
                  <div className={styles.colTema}>
                    <div className={styles.temaIcon}>
                      <i className="fa-regular fa-file-lines"></i>
                    </div>
                    <div className={styles.temaInfo}>
                      <h4 className={styles.temaTitle}>{proposta.tema}</h4>
                      <p className={styles.temaSubtitle}>Tema proposto para a semana.</p>
                    </div>
                  </div>

                  {/* Mocked Eixos */}
                  <div className={styles.colEixos}>
                    {proposta.eixos && proposta.eixos.length > 0 ? (
                      proposta.eixos.map(eixo => (
                        <span key={eixo} className={styles.eixoBadge}>{eixo}</span>
                      ))
                    ) : (
                      <span style={{ color: '#a0a0a0', fontSize: '12px' }}>Sem eixos</span>
                    )}
                  </div>

                  {/* Periodo with real data as start */}
                  <div className={styles.colPeriodo}>
                    <div className={styles.periodoDate}>
                      <i className="fa-regular fa-calendar"></i>
                      {formatarData(proposta.dataInicial)} a {formatarData(proposta.dataFinal)}
                    </div>
                  </div>

                  {/* Mocked Status */}
                  <div className={styles.colStatus}>
                    <span className={`${styles.statusBadge} ${styles.statusPublicado}`}>
                      <span className={styles.statusDot}></span> Publicado
                    </span>
                  </div>

                  <div className={styles.colAcoes}>
                    <button className={styles.actionBtn} onClick={() => navigate("/admin/cadastrar-proposta", { state: { proposta } })} title="Editar">
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDeleteProposta(proposta)} title="Deletar">
                      <i className="fa-regular fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              ))}

              {propostas.length === 0 && (
                <div style={{ padding: '32px', textAlign: 'center', color: '#a0a0a0' }}>Nenhum tema encontrado.</div>
              )}
            </div>
          </div>
        )}

        {!isLoading && propostas.length > 0 && (
          <div className={styles.paginationWrapper}>
            <Pagination
              currentPage={currentPage}
              totalItems={propostas.length}
              itemsPerPage={itemsPerPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}
      </div>



      {/* Delete Modal */}
      <DeleteModal
        message="Você tem certeza que deseja excluir esta proposta?"
        modalIsClicked={deleteModalOpen}
        deleteOnClick={confirmDeleteProposta}
        cancelOnClick={cancelDeleteProposta}
      />

      {/* View Proposta Modal */}
      <RedacaoModal
        redacao={selectedProposta}
        isOpen={modalOpen}
        onClose={closeModal}
        activeTab="minhas"
        brasilFormatData={formatarData}
      />
    </div>
  );
};

export default NovaProposta;