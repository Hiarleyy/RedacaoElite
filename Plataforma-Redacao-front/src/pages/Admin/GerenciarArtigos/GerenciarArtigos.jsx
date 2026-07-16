import styles from "./styles.module.css"
import Title from "../../../components/Title/Title"
import Message from "../../../components/Message/Message"
import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router-dom"
import fetchData from "../../../utils/fetchData"
import Loading from "../../../components/Loading/Loading"

const baseURL = import.meta.env.VITE_API_BASE_URL

// Modal renderizado diretamente no document.body via Portal
// Isso garante que o modal escape de qualquer overflow ou stacking context do layout
const ConfirmDeleteModal = ({ onConfirm, onCancel, isDeleting }) => {
  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
      }}
    >
      <div
        style={{
          background: "#242424",
          borderRadius: "12px",
          padding: "32px",
          width: "400px",
          maxWidth: "90vw",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          border: "1px solid #40444b",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ color: "#f59e0b", fontSize: "32px", marginBottom: "12px", display: "block" }}></i>
          <p style={{ color: "#fff", fontSize: "16px", lineHeight: "1.6", margin: 0 }}>
            Você tem certeza que deseja excluir este artigo?
            <br />
            <span style={{ color: "#a0a0a0", fontSize: "14px" }}>Esta ação não pode ser desfeita.</span>
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            style={{
              backgroundColor: "#B2433F",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "14px",
              fontSize: "15px",
              fontWeight: "700",
              cursor: isDeleting ? "not-allowed" : "pointer",
              opacity: isDeleting ? 0.7 : 1,
              transition: "opacity 0.2s",
            }}
          >
            <i className="fa-solid fa-trash" style={{ marginRight: "8px" }}></i>
            {isDeleting ? "Excluindo..." : "Sim, excluir"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              backgroundColor: "transparent",
              color: "#a0a0a0",
              border: "1px solid #40444b",
              borderRadius: "8px",
              padding: "14px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

const GerenciarArtigos = () => {
  const navigate = useNavigate()
  const { getArtigos, deleteArtigo } = fetchData()

  const [artigos, setArtigos] = useState([])
  const [isLoadingData, setIsLoadingData] = useState(false)

  // Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4

  const [showConfirm, setShowConfirm] = useState(false)
  const [currentArtigoId, setCurrentArtigoId] = useState("")
  const [activeMenuId, setActiveMenuId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [message, setMessage] = useState("")

  const loadArtigos = async () => {
    setIsLoadingData(true)
    try {
      const data = await getArtigos()
      setArtigos(data || [])
    } catch (error) {
      console.error("Erro ao carregar artigos:", error)
      setMessage("Erro ao carregar artigos.")
    } finally {
      setIsLoadingData(false)
    }
  }

  useEffect(() => {
    loadArtigos()
  }, [])

  useEffect(() => {
    const handleCloseMenu = () => setActiveMenuId(null)
    window.addEventListener("click", handleCloseMenu)
    return () => window.removeEventListener("click", handleCloseMenu)
  }, [])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteArtigo(currentArtigoId)
      setShowConfirm(false)
      setCurrentArtigoId("")
      setMessage("Artigo deletado com sucesso!")
      await loadArtigos()
    } catch (error) {
      console.error("Erro ao deletar:", error)
      setMessage("Erro ao deletar o artigo.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleMenuClick = (e, id) => {
    e.stopPropagation()
    setActiveMenuId(activeMenuId === id ? null : id)
  }

  const openDeleteConfirm = (e, id) => {
    e.stopPropagation()
    setActiveMenuId(null)
    setCurrentArtigoId(id)
    setShowConfirm(true)
  }

  // Paginação logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = artigos.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(artigos.length / itemsPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  return (
    <div className={styles.container}>
      <Title
        title="Gerenciar Artigos"
        subtitle="Visualize e gerencie todos os artigos cadastrados."
      />
      {message && <Message text={message} type="success" onClose={() => setMessage("")} />}

      <div className={styles.content_wrapper}>
        <div className={styles.header_actions}>
        <button
          className={styles.add_button}
          onClick={() => navigate("/admin/artigos/novo")}
        >
          <i className="fa-solid fa-plus"></i> Novo Artigo
        </button>
      </div>

      <div className={styles.table_container}>
        {isLoadingData ? (
          <div style={{ padding: "40px 0", margin: "20px" }}><Loading /></div>
        ) : artigos.length > 0 ? (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Categoria</th>
                  <th>Destaque</th>
                  <th></th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map(artigo => (
                  <tr key={artigo.id}>
                    <td data-label="Título" className={styles.title_cell}>
                      <div className={styles.artigo_info}>
                        {artigo.imagemCapa && (
                          <img
                            src={`${baseURL}/artigos/${artigo.id}/capa`}
                            alt={artigo.titulo}
                            className={styles.capa_thumb}
                          />
                        )}
                        <span>{artigo.titulo}</span>
                      </div>
                    </td>
                    <td data-label="Categoria">
                      <span className={styles.categoria_badge}>{artigo.categoria}</span>
                    </td>
                    <td data-label="Destaque">
                      {artigo.destaque === 'DESTAQUE_SEMANA' && <span className={styles.destaque_semana}><i className="fa-solid fa-star"></i> Semana</span>}
                      {artigo.destaque === 'DESTAQUE_RAPIDO' && <span className={styles.destaque_rapido}><i className="fa-solid fa-bolt"></i> Rápido</span>}
                      {artigo.destaque === 'NENHUM' && <span className={styles.sem_destaque}>-</span>}
                    </td>
                    <td data-label="Status">
                      {artigo.publicado ? (
                        <span className={styles.status_publicado}>
                          <span className={styles.dot_green}></span> Publicado
                        </span>
                      ) : (
                        <span className={styles.status_rascunho}>
                          <span className={styles.dot_gray}></span> Rascunho
                        </span>
                      )}
                    </td>
                    <td data-label="Data">
                      {new Date(artigo.criadoEm).toLocaleDateString("pt-BR")}
                    </td>
                    <td data-label="Ações">
                      <div className={styles.action_menu}>
                        <button
                          className={styles.menu_button}
                          onClick={(e) => handleMenuClick(e, artigo.id)}
                        >
                          <i className="fa-solid fa-ellipsis-vertical"></i>
                        </button>

                        {activeMenuId === artigo.id && (
                          <div className={styles.dropdown_menu}>
                            <button onClick={() => navigate(`/admin/artigos/${artigo.id}/editar`)}>
                              <i className="fa-solid fa-pen"></i> Editar
                            </button>
                            <button
                              className={styles.delete_action}
                              onClick={(e) => openDeleteConfirm(e, artigo.id)}
                            >
                              <i className="fa-solid fa-trash"></i> Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {artigos.length > 0 && (
              <div className={styles.pagination_container}>
                <span className={styles.pagination_info}>
                  Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, artigos.length)} de {artigos.length} artigos
                </span>
                <div className={styles.pagination_controls}>
                  <button
                    className={styles.page_btn}
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                    <button
                      key={number}
                      className={`${styles.page_btn} ${currentPage === number ? styles.active_page : ''}`}
                      onClick={() => handlePageChange(number)}
                    >
                      {number}
                    </button>
                  ))}

                  <button
                    className={styles.page_btn}
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={styles.empty_state}>
            <p>Nenhum artigo cadastrado.</p>
          </div>
        )}
      </div>
    </div>

    {showConfirm && (
        <ConfirmDeleteModal
          onConfirm={handleDelete}
          onCancel={() => { setShowConfirm(false); setCurrentArtigoId("") }}
          isDeleting={isDeleting}
        />
      )}
    </div>
  )
}

export default GerenciarArtigos
