import styles from './styles.module.css'
import Button from '../Button/Button'
import useUseful from '../../utils/useUseful'
import { useState } from 'react'

const baseURL = import.meta.env.VITE_API_BASE_URL

const CorrecaoModal = ({ modalData, modalIsClicked, setModalIsClicked }) => {
  const { brasilFormatData } = useUseful()
  const [downloading, setDownloading] = useState({ redacao: false, correcao: false })

  const handleDownload = async (url, filename, type) => {
    try {
      setDownloading(prev => ({ ...prev, [type]: true }))
      
      const token = localStorage.getItem('token')
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Arquivo não encontrado')
        } else if (response.status === 401) {
          throw new Error('Não autorizado. Faça login novamente.')
        } else {
          throw new Error(`Erro no servidor: ${response.status}`)
        }
      }

      // Obter o tipo de conteúdo do cabeçalho
      const contentType = response.headers.get('content-type')
      const blob = await response.blob()

      // Determinar a extensão do arquivo baseada no tipo de conteúdo
      let extension = '.pdf'
      if (contentType) {
        if (contentType.includes('application/pdf')) extension = '.pdf'
        else if (contentType.includes('application/msword')) extension = '.doc'
        else if (contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) extension = '.docx'
        else if (contentType.includes('text/plain')) extension = '.txt'
      }

      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename + extension
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(downloadUrl)
      
    } catch (error) {
      console.error('Erro no download:', error)
      alert(`Erro ao baixar arquivo: ${error.message}`)
    } finally {
      setDownloading(prev => ({ ...prev, [type]: false }))
    }
  }
  
  return (
    <div className={`${modalIsClicked ? styles.modal_details_bg : styles.modal_details_bg_closed}`}>
      <div className={styles.modal_details}>

        <div className={styles.header}>
          <p className={styles.title}>{modalData?.titulo}</p>
          <div className={styles.modal_button} onClick={() => setModalIsClicked(false)}>
            <i className="fa-solid fa-circle-xmark"></i>
          </div>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.infos}>
          <p className={styles.author}>{`Autor: ${modalData?.usuario?.nome}`}</p>
          <p className={styles.data}>{`Data de envio: ${brasilFormatData(modalData?.data)}`}</p>
          <p className={styles.data}>{`Data da correção: ${brasilFormatData(modalData?.correcao?.data)}`}</p>
        </div>

        <div className={styles.notes_box}>
          <p className={styles.notes_title}>Notas:</p>
          <div className={styles.notes}>
            <p>{`Competência 01: ${modalData?.correcao?.competencia01}`}</p>
            <p>{`Competência 02: ${modalData?.correcao?.competencia02}`}</p>
            <p>{`Competência 03: ${modalData?.correcao?.competencia03}`}</p>
            <p>{`Competência 04: ${modalData?.correcao?.competencia04}`}</p>
            <p>{`Competência 05: ${modalData?.correcao?.competencia05}`}</p>
          </div>
        </div>

        <div className={styles.final_note}>{`Nota final: ${modalData?.correcao?.nota}`}</div>

        <div className={styles.feedback}>
          <p className={styles.feedback_text}>Feedback:</p>
          <div className={styles.feedback_content}>
            <p>{modalData?.correcao?.feedback}</p>
          </div>
        </div>

        <div className={styles.buttons}>
          <Button 
            text_size="20px" 
            text_color="#E0E0E0" 
            padding_sz="10px" 
            bg_color="#DA9E00"
            isLoading={downloading.redacao}
            onClick={() => handleDownload(
              `${baseURL}/redacoes/download/${modalData?.id}`,
              `redacao_${modalData?.titulo?.replace(/[^a-z0-9]/gi, '_') || modalData?.id}`,
              'redacao'
            )}
          >
            <i className="fa-solid fa-download"></i> BAIXAR REDAÇÃO
          </Button>
          
          <Button 
            text_size="20px" 
            text_color="#E0E0E0" 
            padding_sz="10px" 
            bg_color="#DA9E00"
            isLoading={downloading.correcao}
            onClick={() => handleDownload(
              `${baseURL}/correcoes/download/${modalData?.correcao?.id}`,
              `correcao_${modalData?.titulo?.replace(/[^a-z0-9]/gi, '_') || modalData?.id}`,
              'correcao'
            )}
          >
            <i className="fa-solid fa-download"></i> BAIXAR CORREÇÃO
          </Button>
        </div>

      </div>
    </div>
  )
}

export default CorrecaoModal