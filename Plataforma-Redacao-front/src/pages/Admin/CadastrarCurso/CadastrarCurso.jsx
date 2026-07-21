import React, { useState, useEffect } from "react";
import styles from "./styles.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Message from "../../../components/Message/Message";
import Loading from "../../../components/Loading/Loading";
import Title from "../../../components/Title/Title";
import fetchData from "../../../utils/fetchData";
import useUseful from "../../../utils/useUseful";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const CadastrarCurso = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const moduloToEdit = location.state?.modulo;

  // Course main form states
  const [nome, setNome] = useState(moduloToEdit?.nome || "");
  const [descricao, setDescricao] = useState(moduloToEdit?.descricao || "");
  const [playlistUrl, setPlaylistUrl] = useState(moduloToEdit?.playlistUrl || "");

  // Materials states (PDF upload)
  const [materiais, setMateriais] = useState(() => {
    if (moduloToEdit?.pdfUrl) {
      return [
        {
          id: Date.now(),
          titulo: "PDF de Resumo do Módulo",
          tipo: "pdf",
          arquivo: null,
          nomeDisplay: moduloToEdit.pdfUrl,
          tamanho: "-",
          isExisting: true
        }
      ];
    }
    return [];
  });

  const [isModalMaterialOpen, setIsModalMaterialOpen] = useState(false);
  const [formMaterial, setFormMaterial] = useState({
    titulo: 'PDF de Resumo do Módulo',
    tipo: 'pdf',
    arquivo: null,
    link: ''
  });

  const [formMessage, setFormMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Videos states (Edit mode only)
  const [selectedModuloVideos, setSelectedModuloVideos] = useState([]);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState("");
  const [videoTitulo, setVideoTitulo] = useState("");
  const [videoDescricao, setVideoDescricao] = useState("");
  const [videoDuracao, setVideoDuracao] = useState("");
  const [videoNivel, setVideoNivel] = useState("Básico");
  const [videoMessage, setVideoMessage] = useState(null);
  const [isSavingVideo, setIsSavingVideo] = useState(false);

  const { getHeaders } = useUseful();

  const fetchModuloDetails = async () => {
    if (!moduloToEdit?.id) return;
    setIsLoadingData(true);
    try {
      const { getModuloById } = fetchData();
      const response = await getModuloById(moduloToEdit.id);
      if (response) {
        setNome(response.nome);
        setDescricao(response.descricao || "");
        setPlaylistUrl(response.playlistUrl || "");
        setSelectedModuloVideos(response.videos || []);

        if (response.pdfUrl) {
          setMateriais([
            {
              id: Date.now(),
              titulo: "PDF de Resumo do Módulo",
              tipo: "pdf",
              arquivo: null,
              nomeDisplay: response.pdfUrl,
              tamanho: "-",
              isExisting: true
            }
          ]);
        } else {
          setMateriais([]);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes do curso:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (moduloToEdit) {
      fetchModuloDetails();
    }
  }, [moduloToEdit]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMessage(null);

    try {
      const formData = new FormData();
      formData.append("nome", nome);
      formData.append("descricao", descricao);
      formData.append("playlistUrl", playlistUrl);

      // Handle PDF material
      const pdfMaterial = materiais.find(m => m.tipo === 'pdf');
      if (pdfMaterial) {
        const info = {
          tipo: 'pdf',
          titulo: pdfMaterial.titulo,
          isExisting: pdfMaterial.isExisting || false,
          caminho: pdfMaterial.isExisting ? pdfMaterial.nomeDisplay : (pdfMaterial.arquivo ? pdfMaterial.arquivo.name : pdfMaterial.link),
          nomeDisplay: pdfMaterial.nomeDisplay,
          arquivo: pdfMaterial.arquivo ? pdfMaterial.arquivo.name : undefined,
          link: pdfMaterial.link
        };
        formData.append("pdfInfo", JSON.stringify(info));

        if (pdfMaterial.arquivo) {
          formData.append("arquivos", pdfMaterial.arquivo);
        }
      } else {
        formData.append("pdfInfo", "");
      }

      if (moduloToEdit) {
        await axios.put(
          `${baseURL}/modulos/${moduloToEdit.id}`,
          formData,
          { headers: { ...getHeaders(), "Content-Type": "multipart/form-data" } }
        );

        setFormMessage({
          type: "success",
          text: "Curso atualizado com sucesso!",
        });
      } else {
        await axios.post(
          `${baseURL}/modulos`,
          formData,
          { headers: { ...getHeaders(), "Content-Type": "multipart/form-data" } }
        );

        setFormMessage({
          type: "success",
          text: "Curso cadastrado com sucesso!",
        });
      }

      setTimeout(() => {
        navigate("/admin/gerenciar-cursos");
      }, 1500);
    } catch (error) {
      setFormMessage({
        type: "error",
        text: error.response?.data?.error || `Erro ao salvar curso.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Materials Handlers
  const handleAbrirModal = () => {
    setFormMaterial({
      titulo: 'PDF de Resumo do Módulo',
      tipo: 'pdf',
      arquivo: null,
      link: ''
    });
    setIsModalMaterialOpen(true);
  };

  const handleFecharModal = () => {
    setIsModalMaterialOpen(false);
  };

  const handleSalvarMaterialModal = () => {
    if (formMaterial.tipo === 'pdf' && !formMaterial.arquivo && !formMaterial.link) {
      alert("Por favor, selecione um arquivo PDF ou informe um link.");
      return;
    }

    const novoMaterial = {
      id: Date.now(),
      titulo: formMaterial.titulo,
      tipo: formMaterial.tipo,
      arquivo: formMaterial.arquivo,
      nomeDisplay: formMaterial.arquivo ? formMaterial.arquivo.name : formMaterial.link,
      tamanho: formMaterial.arquivo ? (formMaterial.arquivo.size / (1024 * 1024)).toFixed(2) + ' MB' : '-',
      link: formMaterial.link
    };

    // Since we only want ONE pdf per module, we replace the existing materials list
    setMateriais([novoMaterial]);
    handleFecharModal();
  };

  const handleRemoverMaterial = (id) => {
    setMateriais([]);
  };

  // Video sub-modal handlers
  const handleOpenVideoModal = (video) => {
    setSelectedVideoId(video.id);
    setVideoTitulo(video.titulo);
    setVideoDescricao(video.descricao || "");
    setVideoDuracao(video.duracao || "");
    setVideoNivel(video.nivel || "Básico");
    setVideoMessage(null);
    setIsVideoModalOpen(true);
  };

  const handleCloseVideoModal = () => {
    setIsVideoModalOpen(false);
    setSelectedVideoId("");
    setVideoTitulo("");
    setVideoDescricao("");
    setVideoDuracao("");
    setVideoNivel("Básico");
    setVideoMessage(null);
  };

  const handleSaveVideo = async (e) => {
    e.preventDefault();
    setIsSavingVideo(true);
    setVideoMessage(null);

    try {
      await axios.put(
        `${baseURL}/videos/${selectedVideoId}`,
        {
          titulo: videoTitulo,
          descricao: videoDescricao,
          duracao: videoDuracao,
          nivel: videoNivel,
        },
        { headers: getHeaders() }
      );

      setVideoMessage({
        type: "success",
        text: "Aula atualizada com sucesso!",
      });

      // Refresh data
      await fetchModuloDetails();

      setTimeout(() => {
        handleCloseVideoModal();
      }, 1000);
    } catch (error) {
      setVideoMessage({
        type: "error",
        text: error.response?.data?.error || "Erro ao atualizar aula.",
      });
    } finally {
      setIsSavingVideo(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header Area */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => navigate("/admin/gerenciar-cursos")}>
            <i className="fa-solid fa-arrow-left"></i> Voltar
          </button>
          <div>
            <h2 className={styles.title}>
              {moduloToEdit ? "Editar Curso" : "Cadastrar Novo Curso"}
            </h2>
            <p className={styles.subtitle}>
              {moduloToEdit
                ? "Atualize as informações do módulo, envie o PDF de resumo e edite as aulas."
                : "Crie um novo módulo conectando uma playlist do YouTube e enviando o PDF de resumo."}
            </p>
          </div>
        </div>
        <button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={isSubmitting || isLoadingData}
        >
          <i className="fa-solid fa-floppy-disk"></i> {moduloToEdit ? "Salvar Alterações" : "Cadastrar Curso"}
        </button>
      </div>

      {isLoadingData ? (
        <div className={styles.loading}>
          <Loading />
        </div>
      ) : (
        <div className={styles.mainContent}>
          {/* Left Column: Main Form & Materials */}
          <div className={styles.leftColumn}>
            <div className={styles.formCard}>
              <h3 className={styles.formCardTitle}>Informações do Curso / Módulo</h3>
              <form onSubmit={handleSave} className={styles.courseForm}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Nome do Curso</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Ex: Redação Nota 1000"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Descrição do Curso</label>
                  <textarea
                    className={styles.formTextarea}
                    placeholder="Ex: Módulo completo abordando a estrutura do texto..."
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Link da Playlist do YouTube</label>
                  <input
                    type="url"
                    className={styles.formInput}
                    placeholder="Ex: https://youtube.com/playlist?list=..."
                    value={playlistUrl}
                    onChange={(e) => setPlaylistUrl(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {formMessage && (
                  <Message text={formMessage.text} type={formMessage.type} />
                )}
              </form>
            </div>

            {/* Materials Upload Card (from CadastrarProposta.jsx) */}
            <div className={styles.formCard} style={{ marginTop: "24px" }}>
              <h3 className={styles.formCardTitle}>
                <i className="fa-solid fa-paperclip" style={{ marginRight: "8px" }}></i> PDF de Resumo do Módulo
              </h3>
              <p className={styles.sectionSubtitle} style={{ color: "#a0a0a0", fontSize: "13px", margin: "-12px 0 20px 0" }}>
                Adicione o PDF contendo o resumo teórico unificado para todos os alunos deste módulo.
              </p>

              <div className={styles.materiaisGrid}>
                {/* Dynamically render the added PDF summary card */}
                {materiais.map((material) => (
                  <div key={material.id} className={styles.materialCard}>
                    <div className={styles.materialHeader}>
                      <i className="fa-solid fa-file-pdf styles.materialHeaderIcon"></i>
                      <h4 className={styles.materialTitle}>{material.titulo.toUpperCase()}</h4>
                    </div>
                    <p className={styles.materialDesc}>
                      {material.isExisting ? "PDF salvo anteriormente na plataforma." : "Material anexado para upload."}
                    </p>

                    <div className={styles.materialPreview}>
                      <i className="fa-regular fa-file-pdf" style={{ fontSize: "40px", color: "#f44336" }}></i>
                    </div>

                    <div className={styles.materialInfo}>
                      <div className={styles.materialInfoText}>
                        <p className={styles.materialName}>{material.nomeDisplay.split("/").pop()}</p>
                        <p className={styles.materialSize}>{material.isExisting ? "Salvo" : material.tamanho}</p>
                      </div>
                      <i
                        className="fa-solid fa-xmark"
                        style={{ cursor: "pointer", color: "#f87171" }}
                        onClick={() => handleRemoverMaterial(material.id)}
                        title="Remover material"
                      ></i>
                    </div>
                  </div>
                ))}

                {/* Card to add PDF (only if none is added yet) */}
                {materiais.length === 0 && (
                  <div className={styles.materialAddCard} onClick={handleAbrirModal}>
                    <i className="fa-solid fa-plus styles.materialAddIcon"></i>
                    <p className={styles.materialAddTitle}>Adicionar PDF</p>
                    <p className={styles.materialAddDesc}>Selecione um arquivo PDF local ou insira o link.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Classes list (Edit mode only) */}
          <div className={styles.rightColumn}>
            {moduloToEdit ? (
              <div className={styles.videosCard}>
                <div className={styles.videosCardHeader}>
                  <h3 className={styles.videosCardTitle}>Aulas deste Módulo</h3>
                  <span className={styles.videosCount}>{selectedModuloVideos.length} aulas</span>
                </div>

                <div className={styles.videosList}>
                  {selectedModuloVideos.length === 0 ? (
                    <p className={styles.noVideosText}>Nenhum vídeo importado para esta playlist.</p>
                  ) : (
                    selectedModuloVideos.map((video, vIndex) => (
                      <div key={video.id} className={styles.videoItem}>
                        <div className={styles.videoItemInfo}>
                          <span className={styles.videoItemTitle}>
                            Aula {String(video.ordem || vIndex + 1).padStart(2, "0")}: {video.titulo}
                          </span>
                          <div className={styles.videoItemMeta}>
                            <span className={styles.metaBadge}>{video.nivel || "Básico"}</span>
                            {video.duracao && (
                              <span className={styles.metaDuration}>
                                <i className="fa-regular fa-clock"></i> {video.duracao}
                              </span>
                            )}
                            {video.descricao && (
                              <span className={styles.metaDesc} title={video.descricao}>
                                • {video.descricao}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          className={styles.videoEditBtn}
                          onClick={() => handleOpenVideoModal(video)}
                        >
                          <i className="fa-solid fa-pen"></i> Editar
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className={styles.placeholderCard}>
                <div className={styles.placeholderIcon}>
                  <i className="fa-solid fa-tv"></i>
                </div>
                <h4 className={styles.placeholderTitle}>Importação Automática de Aulas</h4>
                <p className={styles.placeholderDesc}>
                  Ao cadastrar a playlist do YouTube, o sistema importará automaticamente todos os vídeos associados a ela. Após cadastrar o curso, você poderá acessar esta página de edição para configurar metadados específicos para cada aula (como duração e nível).
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Adicionar PDF */}
      {isModalMaterialOpen && (
        <div className={styles.modalOverlay} style={{ zIndex: 1100 }}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Adicionar PDF de Resumo</h3>
              <button className={styles.closeBtn} onClick={handleFecharModal}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tipo de Anexo</label>
                <select
                  value={formMaterial.tipo}
                  className={styles.modalInput}
                  onChange={(e) => setFormMaterial({ ...formMaterial, tipo: e.target.value })}
                >
                  <option value="pdf">PDF (Arquivo ou Link)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Selecione um Arquivo PDF Local</label>
                <input
                  type="file"
                  accept=".pdf"
                  className={styles.modalInput}
                  onChange={(e) => setFormMaterial({ ...formMaterial, arquivo: e.target.files[0], link: "" })}
                />
              </div>

              <div style={{ textAlign: "center", color: "#a0a0a0", fontSize: "12px", margin: "-8px 0" }}>ou insira um link externo</div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>URL do PDF Externo</label>
                <input
                  type="url"
                  className={styles.modalInput}
                  placeholder="https://drive.google.com/..."
                  value={formMaterial.link}
                  onChange={(e) => setFormMaterial({ ...formMaterial, link: e.target.value, arquivo: null })}
                />
              </div>

              <div className={styles.modalActions}>
                <button className={styles.modalCancelBtn} onClick={handleFecharModal}>
                  Cancelar
                </button>
                <button className={styles.modalSaveBtn} onClick={handleSalvarMaterialModal}>
                  Confirmar PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Modal Editar Detalhes da Aula */}
      {isVideoModalOpen && (
        <div className={styles.modalOverlay} style={{ zIndex: 1200 }}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Editar Detalhes da Aula</h3>
              <button className={styles.closeBtn} onClick={handleCloseVideoModal}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSaveVideo} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Título da Aula</label>
                <input
                  type="text"
                  className={styles.modalInput}
                  value={videoTitulo}
                  onChange={(e) => setVideoTitulo(e.target.value)}
                  required
                  disabled={isSavingVideo}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Descrição / Subtítulo</label>
                <textarea
                  className={styles.modalTextarea}
                  placeholder="Ex: Introdução aos conceitos fundamentais..."
                  value={videoDescricao}
                  onChange={(e) => setVideoDescricao(e.target.value)}
                  disabled={isSavingVideo}
                />
              </div>

              <div className={styles.formGroup} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label className={styles.formLabel}>Duração</label>
                  <input
                    type="text"
                    className={styles.modalInput}
                    placeholder="Ex: 28:45"
                    value={videoDuracao}
                    onChange={(e) => setVideoDuracao(e.target.value)}
                    disabled={isSavingVideo}
                  />
                </div>
                <div>
                  <label className={styles.formLabel}>Nível</label>
                  <select
                    className={styles.modalInput}
                    value={videoNivel}
                    onChange={(e) => setVideoNivel(e.target.value)}
                    disabled={isSavingVideo}
                  >
                    <option value="Básico">Básico</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Avançado">Avançado</option>
                  </select>
                </div>
              </div>

              {videoMessage && (
                <Message text={videoMessage.text} type={videoMessage.type} />
              )}

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.modalCancelBtn}
                  onClick={handleCloseVideoModal}
                  disabled={isSavingVideo}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.modalSaveBtn}
                  disabled={isSavingVideo}
                >
                  {isSavingVideo ? "Salvando..." : "Salvar Aula"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CadastrarCurso;
