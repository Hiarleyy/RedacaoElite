import { useState, useEffect } from "react"
import styles from "./styles.module.css"

const baseURL = import.meta.env.VITE_API_BASE_URL

/**
 * Modal para baixar redações corrigidas em .zip
 * com seleção de turma e tema vindos do banco de dados.
 *
 * Props:
 *  - isOpen   (bool)        : controla visibilidade
 *  - onClose  (fn)          : fecha o modal
 *  - turmas   (array)       : lista de turmas { id, nome }
 *  - temas    (array)       : lista de temas únicos (strings)
 */
const DownloadZipModal = ({ isOpen, onClose, turmas = [], temas = [] }) => {
  const [turmaSelecionada, setTurmaSelecionada] = useState("")
  const [temaSelecionado, setTemaSelecionado] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Reseta estado ao abrir/fechar
  useEffect(() => {
    if (isOpen) {
      setTurmaSelecionada("")
      setTemaSelecionado("")
      setError(null)
      setSuccess(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleDownload = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      let token = null
      try {
        const storedUser = localStorage.getItem("user_access_data")
        if (storedUser) {
          token = JSON.parse(storedUser)?.token
        }
      } catch (err) {
        console.error("Erro ao obter o token de acesso:", err)
      }

      const params = new URLSearchParams()
      if (turmaSelecionada) params.append("turmaId", turmaSelecionada)
      if (temaSelecionado)  params.append("titulo", temaSelecionado)
      const qs = params.toString() ? `?${params.toString()}` : ""

      const response = await fetch(`${baseURL}/redacoes/download-zip${qs}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || data.message || `Erro no servidor: ${response.status}`)
      }

      const blob = await response.blob()
      const url  = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href  = url

      // Nome do arquivo com filtros aplicados
      const turmaLabel = turmas.find((t) => t.id === turmaSelecionada)?.nome || "todas-turmas"
      const temaLabel  = temaSelecionado || "todos-temas"
      link.download = `redacoes_${turmaLabel}_${temaLabel}`
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w.-]/g, "_")
        .replace(/_+/g, "_")
        .slice(0, 80) + ".zip"

      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      setSuccess(true)
    } catch (err) {
      console.error("Erro ao gerar ZIP:", err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* Cabeçalho */}
        <div className={styles.modal_header}>
          <div className={styles.header_icon}>
            <i className="fa-solid fa-file-zipper" />
          </div>
          <div>
            <h2 className={styles.modal_title}>Baixar redações</h2>
            <p className={styles.modal_subtitle}>
              Selecione os filtros para compactar as redações corrigidas em um arquivo <strong>.zip</strong>
            </p>
          </div>
          <button className={styles.btn_close} onClick={onClose} title="Fechar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className={styles.divider} />

        {/* Campos */}
        <div className={styles.modal_body}>
          {/* Turma */}
          <div className={styles.field}>
            <label className={styles.field_label}>
              <i className="fa-solid fa-users" /> Turma
            </label>
            <select
              className={styles.field_select}
              value={turmaSelecionada}
              onChange={(e) => setTurmaSelecionada(e.target.value)}
              disabled={isLoading}
            >
              <option value="">Todas as turmas</option>
              {turmas.map((t) => (
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </select>
            <span className={styles.field_hint}>
              Filtra redações somente da turma selecionada.
            </span>
          </div>

          {/* Tema */}
          <div className={styles.field}>
            <label className={styles.field_label}>
              <i className="fa-solid fa-pen-clip" /> Tema
            </label>
            <select
              className={styles.field_select}
              value={temaSelecionado}
              onChange={(e) => setTemaSelecionado(e.target.value)}
              disabled={isLoading}
            >
              <option value="">Todos os temas</option>
              {temas.map((tema) => (
                <option key={tema} value={tema}>{tema}</option>
              ))}
            </select>
            <span className={styles.field_hint}>
              Apenas redações com esse título/tema serão incluídas.
            </span>
          </div>

          {/* Resumo do filtro */}
          <div className={styles.resumo}>
            <i className="fa-solid fa-circle-info" />
            <span>
              {!turmaSelecionada && !temaSelecionado
                ? "Todas as redações corrigidas serão incluídas."
                : `Serão incluídas redações corrigidas${turmaSelecionada
                    ? ` da turma "${turmas.find((t) => t.id === turmaSelecionada)?.nome}"`
                    : ""
                  }${temaSelecionado ? ` com o tema "${temaSelecionado}"` : ""}.`}
            </span>
          </div>

          {/* Feedback de sucesso */}
          {success && (
            <div className={styles.success_msg}>
              <i className="fa-solid fa-circle-check" />
              Download iniciado com sucesso!
            </div>
          )}

          {/* Feedback de erro */}
          {error && (
            <div className={styles.error_msg}>
              <i className="fa-solid fa-triangle-exclamation" />
              {error}
            </div>
          )}
        </div>

        <div className={styles.divider} />

        {/* Ações */}
        <div className={styles.modal_footer}>
          <button
            className={styles.btn_cancelar}
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            className={`${styles.btn_download} ${isLoading ? styles.btn_loading : ""}`}
            onClick={handleDownload}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin" />
                Gerando arquivo...
              </>
            ) : (
              <>
                <i className="fa-solid fa-download" />
                Baixar .zip
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}

export default DownloadZipModal
