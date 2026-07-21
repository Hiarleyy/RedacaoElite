import styles from "./styles.module.css";
import Title from "../../../components/Title/Title";
import { useEffect, useState } from "react";
import fetchData from "../../../utils/fetchData";
import Loading from "../../../components/Loading/Loading";
import Message from "../../../components/Message/Message";
import { Link } from "react-router-dom";

const Cursos = () => {
  const [modulos, setModulos] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [completedVideos, setCompletedVideos] = useState([]);

  useEffect(() => {
    const getData = async () => {
      setIsLoadingData(true);

      try {
        const { getModulos } = fetchData();
        const response = await getModulos();
        setModulos(response || []);
      } catch (error) {
        console.error("Erro ao carregar dados dos cursos:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    getData();

    // Load completed videos from localStorage
    const completed = JSON.parse(localStorage.getItem("completed_videos") || "[]");
    setCompletedVideos(completed);
  }, []);

  return (
    <div className={styles.container}>
      <Title title="Meus Cursos" />

      <div className={styles.main_content}>
        {isLoadingData ? (
          <div className={styles.loading}>
            <Loading />
          </div>
        ) : modulos.length === 0 ? (
          <Message text="Nenhum curso cadastrado." text_color="#E0E0E0" />
        ) : (
          <div className={styles.modulesGrid}>
            {modulos.map((modulo, index) => {
              const moduloIndexText = String(index + 1).padStart(2, "0");
              
              // Calculate progress percentage
              const totalVideos = modulo.videos ? modulo.videos.length : 0;
              const completedVideosInModulo = modulo.videos
                ? modulo.videos.filter((v) => completedVideos.includes(v.id)).length
                : 0;
              const progressPct =
                totalVideos > 0 ? Math.round((completedVideosInModulo / totalVideos) * 100) : 0;

              return (
                <div key={modulo.id} className={styles.moduloCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.iconWrapper}>
                      <i className="fa-solid fa-graduation-cap"></i>
                    </div>
                    <span className={styles.moduloBadge}>Módulo {moduloIndexText}</span>
                  </div>

                  <div className={styles.cardBody}>
                    <h3 className={styles.moduloTitle}>{modulo.nome}</h3>
                    <p className={styles.moduloDesc}>{modulo.descricao || "Nenhuma descrição disponível."}</p>
                  </div>

                  <div className={styles.cardFooter}>
                    <div className={styles.progressSection}>
                      <div className={styles.progressText}>
                        <span>Progresso</span>
                        <span className={styles.progressPct}>{progressPct}%</span>
                      </div>
                      <div className={styles.progressBarWrapper}>
                        <div className={styles.progressBar} style={{ width: `${progressPct}%` }}></div>
                      </div>
                    </div>

                    <Link to={`../modulo/${modulo.id}`} className={styles.verModuloBtn}>
                      Ver Módulo <i className="fa-solid fa-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cursos;