import React, { useEffect, useState } from "react";
import styles from "./styles.module.css";
import { useParams, useNavigate } from "react-router-dom";
import fetchData from "../../../utils/fetchData";
import Loading from "../../../components/Loading/Loading";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const ModuloPage = () => {
  const { modulo_id } = useParams();
  const navigate = useNavigate();

  const [modulo, setModulo] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [completedVideos, setCompletedVideos] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (activeVideo) {
      setIsPlaying(false);
    }
  }, [activeVideo]);

  useEffect(() => {
    const getModulo = async () => {
      setIsLoadingData(true);
      try {
        const { getModuloById } = fetchData();
        const response = await getModuloById(modulo_id);
        if (response) {
          setModulo(response);
          if (response.videos && response.videos.length > 0) {
            setActiveVideo(response.videos[0]);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar o módulo:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    getModulo();

    // Load completed videos from localStorage
    const completed = JSON.parse(localStorage.getItem("completed_videos") || "[]");
    setCompletedVideos(completed);
  }, [modulo_id]);

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

  const getEmbedUrl = (url) => {
    const id = getYoutubeId(url);
    if (!id) return "";
    return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&controls=1&fs=1&autoplay=1`;
  };

  const getThumbnailUrl = (video) => {
    if (video.thumbnail) return video.thumbnail;
    const id = getYoutubeId(video.url);
    if (id) return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    return "";
  };

  const getFullPdfUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${baseURL.replace("/api", "")}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const handleToggleComplete = () => {
    if (!activeVideo?.id) return;
    let completed = [...completedVideos];
    if (completed.includes(activeVideo.id)) {
      completed = completed.filter((id) => id !== activeVideo.id);
    } else {
      completed.push(activeVideo.id);
    }
    setCompletedVideos(completed);
    localStorage.setItem("completed_videos", JSON.stringify(completed));
  };

  const handleBack = () => {
    if (window.location.pathname.includes("/admin")) {
      navigate("/admin/cursos");
    } else {
      navigate("/aluno/cursos");
    }
  };

  if (isLoadingData || !modulo) {
    return (
      <div className={styles.loadingContainer}>
        <Loading />
      </div>
    );
  }

  // Progress calculations
  const totalVideos = modulo.videos ? modulo.videos.length : 0;
  const completedVideosInModulo = modulo.videos
    ? modulo.videos.filter((v) => completedVideos.includes(v.id)).length
    : 0;
  const progressPct = totalVideos > 0 ? Math.round((completedVideosInModulo / totalVideos) * 100) : 0;

  // Next classes horizontal list
  const getNextVideos = () => {
    if (!modulo.videos || modulo.videos.length === 0 || !activeVideo) return [];
    const currentIndex = modulo.videos.findIndex((v) => v.id === activeVideo.id);
    if (currentIndex === -1) return [];
    const nextList = modulo.videos.slice(currentIndex + 1);
    if (nextList.length === 0) {
      return modulo.videos.filter((v) => v.id !== activeVideo.id);
    }
    return nextList;
  };

  const nextVideos = getNextVideos();
  const isActiveCompleted = activeVideo ? completedVideos.includes(activeVideo.id) : false;

  const currentIndex = modulo.videos && activeVideo ? modulo.videos.findIndex((v) => v.id === activeVideo.id) : -1;
  const prevVideo = currentIndex > 0 ? modulo.videos[currentIndex - 1] : null;
  const nextVideo = currentIndex !== -1 && currentIndex < modulo.videos.length - 1 ? modulo.videos[currentIndex + 1] : null;

  const handlePrevVideo = () => {
    if (prevVideo) setActiveVideo(prevVideo);
  };

  const handleNextVideo = () => {
    if (nextVideo) setActiveVideo(nextVideo);
  };

  return (
    <div className={`${styles.container} ${isTheaterMode ? styles.theaterModeContainer : ""}`}>
      {/* Top Navigation Header */}
      <div className={styles.topHeader}>
        <div className={styles.topHeaderLeft}>
          <button className={styles.backBtn} onClick={handleBack}>
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div className={styles.breadcrumb}>
            <span className={styles.moduleName}>MÓDULO &bull; {modulo.nome}</span>
            {activeVideo && (
              <h2 className={styles.activeClassTitle}>
                AULA {String(activeVideo.ordem || 1).padStart(2, "0")} - {activeVideo.titulo}
              </h2>
            )}
          </div>
        </div>

        <div className={styles.topHeaderRight}>
          {activeVideo && (
            <button
              className={`${styles.completeBtn} ${isActiveCompleted ? styles.completed : ""}`}
              onClick={handleToggleComplete}
            >
              {isActiveCompleted ? (
                <>
                  <i className="fa-solid fa-circle-check"></i> Concluída
                </>
              ) : (
                <>
                  <i className="fa-regular fa-circle"></i> Marcar como concluída
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className={styles.mainLayout}>
        {/* Left Column: Player, PDF, Next Classes */}
        <div className={styles.leftColumn}>
          {activeVideo ? (
            <div className={styles.playerWrapper}>
              {!isPlaying && (
                <div 
                  className={styles.customThumbnailOverlay} 
                  onClick={() => setIsPlaying(true)}
                  style={{ backgroundImage: `url(${getThumbnailUrl(activeVideo)})` }}
                >
                  <div className={styles.playIconCircle}>
                    <i className="fa-solid fa-play"></i>
                  </div>
                </div>
              )}
              {isPlaying && (
                <iframe
                  src={getEmbedUrl(activeVideo.url)}
                  width="100%"
                  height="100%"
                  allowFullScreen={true}
                  webkitAllowFullScreen={true}
                  mozAllowFullScreen={true}
                  title="Video Aula"
                  frameBorder="0"
                  allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                />
              )}
            </div>
          ) : (
            <div className={styles.noVideoPlaceholder}>
              <i className="fa-solid fa-video-slash"></i> Nenhuma aula disponível.
            </div>
          )}

          {/* Player Controls (Custom) */}
          {activeVideo && (
            <div className={styles.playerControlsRow}>
              <div className={styles.playerControlsLeft}>
                <button 
                  className={styles.playerControlBtn} 
                  onClick={handlePrevVideo}
                  disabled={!prevVideo}
                >
                  <i className="fa-solid fa-backward-step"></i> Anterior
                </button>
                <button 
                  className={styles.playerControlBtn} 
                  onClick={handleNextVideo}
                  disabled={!nextVideo}
                >
                  Próxima <i className="fa-solid fa-forward-step"></i>
                </button>
              </div>
              <div className={styles.playerControlsRight}>
                <a 
                  href={activeVideo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.playerControlBtn}
                  style={{ textDecoration: 'none' }}
                >
                  <i className="fa-brands fa-youtube" style={{ color: '#ff0000' }}></i> Assistir no YouTube
                </a>
                <button 
                  className={`${styles.playerControlBtn} ${styles.theaterBtn}`} 
                  onClick={() => setIsTheaterMode(!isTheaterMode)}
                >
                  {isTheaterMode ? (
                    <><i className="fa-solid fa-compress"></i> Sair do Modo Teatro</>
                  ) : (
                    <><i className="fa-solid fa-expand"></i> Modo Teatro</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Material de Apoio Section */}
          <div className={styles.materialSection}>
            <h3 className={styles.sectionTitle}>MATERIAL DE APOIO</h3>
            {modulo.pdfUrl ? (
              <div className={styles.pdfCard}>
                <div className={styles.pdfCardLeft}>
                  <div className={styles.pdfIconCircle}>
                    <i className="fa-solid fa-file-pdf"></i>
                  </div>
                  <div className={styles.pdfTextInfo}>
                    <h4 className={styles.pdfTitle}>Resumo - {modulo.nome}</h4>
                    <span className={styles.pdfMeta}>PDF &bull; Resumo Teórico</span>
                  </div>
                </div>
                <a
                  href={getFullPdfUrl(modulo.pdfUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.pdfDownloadBtn}
                >
                  <i className="fa-solid fa-download"></i> Baixar PDF
                </a>
              </div>
            ) : (
              <div className={styles.noMaterialBox}>
                Nenhum material de apoio cadastrado para este módulo.
              </div>
            )}
          </div>

          {/* Próximas Aulas Section */}
          {nextVideos.length > 0 && (
            <div className={styles.nextClassesSection}>
              <h3 className={styles.sectionTitle}>PRÓXIMAS AULAS</h3>
              <div className={styles.nextClassesGrid}>
                {nextVideos.slice(0, 4).map((video, idx) => (
                  <div
                    key={video.id}
                    className={styles.nextClassCard}
                    onClick={() => setActiveVideo(video)}
                  >
                    <div className={styles.nextClassThumbnail}>
                      <img src={video.thumbnail} alt={video.titulo} />
                      <div className={styles.nextClassPlayOverlay}>
                        <i className="fa-solid fa-circle-play"></i>
                      </div>
                    </div>
                    <div className={styles.nextClassInfo}>
                      <span className={styles.nextClassLabel}>
                        Aula {String(video.ordem || idx + 2).padStart(2, "0")}
                      </span>
                      <h4 className={styles.nextClassTitle}>{video.titulo}</h4>
                      {video.duracao && (
                        <span className={styles.nextClassDuration}>
                          <i className="fa-regular fa-clock"></i> {video.duracao}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Module Header and Classes List */}
        <div className={styles.rightColumn}>
          <div className={styles.rightColumnHeader}>
            <span className={styles.rightColumnBadge}>MÓDULO &bull; {modulo.nome}</span>
            <p className={styles.rightColumnDesc}>
              {modulo.descricao || "Domínio completo do conteúdo deste módulo."}
            </p>
          </div>

          <div className={styles.progressBox}>
            <div className={styles.progressTextRow}>
              <span>Progresso do módulo</span>
              <span className={styles.progressPercent}>{progressPct}%</span>
            </div>
            <div className={styles.progressWrapper}>
              <div className={styles.progressBar} style={{ width: `${progressPct}%` }}></div>
            </div>
          </div>

          {/* Classes Vertical List */}
          <div className={styles.verticalClassesList}>
            {modulo.videos && modulo.videos.length > 0 ? (
              modulo.videos.map((video, vIdx) => {
                const isCurrent = activeVideo?.id === video.id;
                const isCompleted = completedVideos.includes(video.id);
                const classNumText = String(video.ordem || vIdx + 1).padStart(2, "0");

                return (
                  <div
                    key={video.id}
                    className={`${styles.classRow} ${isCurrent ? styles.activeClassRow : ""}`}
                    onClick={() => setActiveVideo(video)}
                  >
                    <div className={styles.classRowLeft}>
                      <div className={`${styles.indexBadge} ${isCurrent ? styles.activeBadge : ""}`}>
                        {isCompleted ? (
                          <i className="fa-solid fa-check"></i>
                        ) : (
                          classNumText
                        )}
                      </div>
                      <div className={styles.classRowInfo}>
                        <h4 className={styles.classRowTitle}>{video.titulo}</h4>
                        {video.duracao && (
                          <span className={styles.classRowDuration}>
                            {video.duracao}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={styles.classRowRight}>
                      {isCurrent ? (
                        <i className={`fa-solid fa-play ${styles.currentIcon}`}></i>
                      ) : isCompleted ? (
                        <i className={`fa-solid fa-circle-check ${styles.checkIcon}`}></i>
                      ) : (
                        <i className={`fa-solid fa-lock-open ${styles.lockIcon}`}></i>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={styles.noClassesVertical}>Nenhuma aula disponível.</div>
            )}
          </div>

          {/* Bottom Resumo Download Button */}
          {modulo.pdfUrl && (
            <a
              href={getFullPdfUrl(modulo.pdfUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.resumoModuleBtn}
            >
              <i className="fa-regular fa-file-pdf"></i> Ver resumo do módulo
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuloPage;
