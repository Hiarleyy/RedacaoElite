import { useState } from "react"
import styles from "./styles.module.css"

const baseURL = import.meta.env.VITE_API_BASE_URL

/**
 * Componente para baixar um ZIP com todas as redações corrigidas.
 * Passa filtros opcionais via props para refinar o download.
 *
 * Props:
 *  - turmaId    (string) : filtrar por turma
 *  - busca      (string) : filtrar por título/aluno
 *  - disabled   (bool)   : desabilitar o botão
 */
const BaixarRedacoesZip = ({ turmaId = "", busca = "", disabled = false }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleDownload = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("token")

      // Monta query string com filtros ativos
      const params = new URLSearchParams()
      if (turmaId) params.append("turmaId", turmaId)
      if (busca)   params.append("busca", busca)
      const qs = params.toString() ? `?${params.toString()}` : ""

      const response = await fetch(`${baseURL}/redacoes/download-zip${qs}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        const msg = response.status === 404
          ? "Nenhuma redação corrigida encontrada para os filtros aplicados."
          : `Erro no servidor: ${response.status}`
        throw new Error(msg)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `redacoes_corrigidas${turmaId ? `_turma` : ""}.zip`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Erro ao baixar ZIP:", err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <button
        className={`${styles.btn} ${isLoading ? styles.btn_loading : ""}`}
        onClick={handleDownload}
        disabled={disabled || isLoading}
        title="Baixar todas as redações corrigidas como .zip"
      >
        {isLoading ? (
          <>
            <i className="fa-solid fa-spinner fa-spin" />
            <div>
              <span className={styles.btn_title}>Gerando arquivo...</span>
              <span className={styles.btn_sub}>Aguarde, isso pode levar alguns segundos</span>
            </div>
          </>
        ) : (
          <>
            <i className="fa-solid fa-file-zipper" />
            <div>
              <span className={styles.btn_title}>Baixar redações (.zip)</span>
              <span className={styles.btn_sub}>Todas as corrigidas com os filtros ativos</span>
            </div>
          </>
        )}
      </button>

      {error && (
        <p className={styles.error_msg}>
          <i className="fa-solid fa-triangle-exclamation" /> {error}
        </p>
      )}
    </div>
  )
}

export default BaixarRedacoesZip
