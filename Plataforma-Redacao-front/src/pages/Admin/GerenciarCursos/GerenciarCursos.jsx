import styles from "./styles.module.css";
import Title from "../../../components/Title/Title";
import axios from "axios";
import fetchData from "../../../utils/fetchData";
import useUseful from "../../../utils/useUseful";
import { useState, useEffect } from "react";
import Pagination from "../../../components/Pagination/Pagination";
import Message from "../../../components/Message/Message";
import Loading from "../../../components/Loading/Loading";
import DeleteModal from "../../../components/DeleteModal/DeleteModal";
import { useNavigate } from "react-router-dom";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const GerenciarCursos = () => {
  const [modulos, setModulos] = useState([]);
  const { brasilFormatData, getHeaders } = useUseful();
  const navigate = useNavigate();

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [modalIsClicked, setModalIsClicked] = useState(false);
  const [currentCursoId, setCurrentCursoId] = useState("");

  // Search filter state
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const getData = async () => {
    setIsLoadingData(true);
    try {
      const { getModulos } = fetchData();
      const response = await getModulos();
      setModulos(response || []);
    } catch (error) {
      console.error("Erro ao buscar cursos:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const deleteModulo = async (id) => {
    try {
      await axios.delete(`${baseURL}/modulos/${id}`, { headers: getHeaders() });
      await getData();
    } catch (error) {
      console.error("Erro ao excluir curso:", error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  // Reset page to 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDeleteClick = (id) => {
    setCurrentCursoId(id);
    setModalIsClicked(true);
  };

  // Filter logic
  const filteredModulos = modulos.filter(
    (modulo) =>
      modulo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (modulo.descricao && modulo.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentModulos = filteredModulos.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className={styles.container}>
      <DeleteModal
        message="Você tem certeza que deseja excluir esse(a) Curso(a)?"
        modalIsClicked={modalIsClicked}
        deleteOnClick={() => {
          deleteModulo(currentCursoId);
          setModalIsClicked(false);
        }}
        cancelOnClick={() => setModalIsClicked(false)}
      />

      <Title title="Gerenciar cursos" />

      <div className={styles.mainLayout}>
        {/* Filters Bar */}
        <div className={styles.filtersBar}>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Buscar curso</span>
            <div className={styles.filterInputWrapper}>
              <i className={`fa-solid fa-search ${styles.filterIcon}`}></i>
              <input
                type="text"
                className={styles.filterInput}
                placeholder="Pesquise por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.actionButtons}>
            {searchTerm && (
              <button
                className={styles.clearBtn}
                onClick={() => setSearchTerm("")}
              >
                <i className="fa-solid fa-filter-circle-xmark"></i> Limpar busca
              </button>
            )}
            <button
              className={styles.newThemeBtn}
              onClick={() => navigate("/admin/cadastrar-curso")}
            >
              Cadastrar novo curso
            </button>
          </div>
        </div>

        {/* Table Section */}
        {isLoadingData ? (
          <div className={styles.loading}>
            <Loading />
          </div>
        ) : filteredModulos.length === 0 ? (
          <div className={styles.tableContainer}>
            <div style={{ padding: "32px", textAlign: "center", color: "#a0a0a0" }}>
              Nenhum curso encontrado.
            </div>
          </div>
        ) : (
          <>
            <div className={styles.tableContainer}>
              <div className={styles.tableHeader}>
                <div>CURSO / MÓDULO</div>
                <div>PLAYLIST</div>
                <div className={styles.colData}>DATA DE CRIAÇÃO</div>
                <div className={styles.colAcoes}>AÇÕES</div>
              </div>

              <div className={styles.tableBody}>
                {currentModulos.map((modulo) => (
                  <div key={modulo.id} className={styles.tableRow}>
                    <div className={styles.colCurso}>
                      <div className={styles.cursoIcon}>
                        <i className="fa-solid fa-graduation-cap"></i>
                      </div>
                      <div className={styles.cursoInfo}>
                        <h4 className={styles.cursoTitle}>{modulo.nome}</h4>
                        <p className={styles.cursoSubtitle}>{modulo.descricao}</p>
                      </div>
                    </div>

                    <div className={styles.colPlaylist}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {modulo.playlistUrl ? (
                          <a
                            href={modulo.playlistUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.playlistLink}
                          >
                            <i className="fa-solid fa-square-arrow-up-right"></i> Playlist
                          </a>
                        ) : (
                          <span className={styles.noLink}>Sem playlist</span>
                        )}
                        {modulo.pdfUrl ? (
                          <a
                            href={modulo.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.playlistLink}
                            style={{ color: "#4ade80" }}
                          >
                            <i className="fa-solid fa-file-pdf"></i> PDF Resumo
                          </a>
                        ) : (
                          <span className={styles.noLink}>Sem PDF</span>
                        )}
                      </div>
                    </div>

                    <div className={styles.colData}>
                      <div className={styles.creationDate}>
                        <i className="fa-regular fa-calendar"></i>
                        {brasilFormatData(modulo.dataCriacao)}
                      </div>
                    </div>

                    <div className={styles.colAcoes}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => navigate(`/admin/modulo/${modulo.id}`)}
                        title="Ver módulo"
                      >
                        <i className="fa-solid fa-eye"></i>
                      </button>
                      <button
                        className={styles.actionBtn}
                        onClick={() => navigate("/admin/cadastrar-curso", { state: { modulo } })}
                        title="Editar"
                      >
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() => handleDeleteClick(modulo.id)}
                        title="Excluir"
                      >
                        <i className="fa-regular fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {filteredModulos.length > 0 && (
              <div className={styles.paginationWrapper}>
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredModulos.length}
                  itemsPerPage={itemsPerPage}
                  setCurrentPage={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GerenciarCursos;
