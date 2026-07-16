import styles from "./styles.module.css"
import Title from "../../../components/Title/Title"
import Message from "../../../components/Message/Message"
import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { useNavigate, useParams } from "react-router-dom"
import fetchData from "../../../utils/fetchData"

const NovoArtigo = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id
  const { getArtigoById, createArtigo, updateArtigo, deleteArtigo } = fetchData()

  const [formData, setFormData] = useState({
    titulo: "",
    subtitulo: "",
    conteudo: "",
    categoria: "",
    destaque: "NENHUM",
    publicado: false,
    tempoLeitura: ""
  })
  
  const [file, setFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const textareaRef = useRef(null)

  const insertMarkdown = (prefix, suffix = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = formData.conteudo
    const before = text.substring(0, start)
    const selected = text.substring(start, end)
    const after = text.substring(end)

    const insertedText = prefix + selected + suffix
    const newText = before + insertedText + after

    setFormData(prev => ({ ...prev, conteudo: newText }))

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, end + prefix.length)
    }, 0)
  }
  
  const [categorias] = useState([
    "Educação",
    "Tecnologia",
    "Sociedade",
    "Política",
    "Economia",
    "Saúde",
    "Direitos Humanos",
    "Meio Ambiente"
  ])

  useEffect(() => {
    if (isEditing) {
      loadArtigo()
    }
  }, [id])

  const loadArtigo = async () => {
    try {
      const data = await getArtigoById(id)
      setFormData({
        titulo: data.titulo || "",
        subtitulo: data.subtitulo || "",
        conteudo: data.conteudo || "",
        categoria: data.categoria || "",
        destaque: data.destaque || "NENHUM",
        publicado: data.publicado || false,
        tempoLeitura: data.tempoLeitura || ""
      })
    } catch (error) {
      console.error("Erro ao carregar artigo:", error)
      setMessage({ text: "Erro ao carregar os dados do artigo.", type: "error" })
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }))
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const data = new FormData()
      data.append("titulo", formData.titulo)
      data.append("subtitulo", formData.subtitulo)
      data.append("conteudo", formData.conteudo)
      data.append("categoria", formData.categoria)
      data.append("destaque", formData.destaque)
      data.append("publicado", formData.publicado)
      if (formData.tempoLeitura) {
        data.append("tempoLeitura", formData.tempoLeitura)
      }
      if (file) {
        data.append("file", file)
      }

      if (isEditing) {
        await updateArtigo(id, data)
        setMessage({ text: "Artigo atualizado com sucesso!", type: "success" })
      } else {
        await createArtigo(data)
        setMessage({ text: "Artigo criado com sucesso!", type: "success" })
        setTimeout(() => navigate("/admin/artigos"), 1500)
      }
    } catch (error) {
      console.error("Erro ao salvar artigo:", error)
      const errorMsg = error.response?.data?.error || "Erro ao salvar o artigo. Verifique os limites de destaque."
      setMessage({ text: errorMsg, type: "error" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteArtigo(id)
      setShowConfirm(false)
      navigate("/admin/artigos")
    } catch (error) {
      console.error("Erro ao deletar:", error)
      setMessage({ text: "Erro ao deletar o artigo.", type: "error" })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className={styles.container}>
      <Title title={isEditing ? "Editar Artigo" : "Novo Artigo"} />
      
      {message && (
        <Message 
          text={message.text} 
          type={message.type} 
          onClose={() => setMessage(null)} 
        />
      )}

      <form className={styles.form_container} onSubmit={handleSubmit}>
        <div className={styles.form_group}>
          <label>Título *</label>
          <input 
            type="text" 
            name="titulo" 
            value={formData.titulo} 
            onChange={handleChange} 
            required 
            maxLength={200}
            placeholder="Ex: Inteligência Artificial na Educação"
          />
        </div>

        <div className={styles.form_row}>
          <div className={styles.form_group}>
            <label>Subtítulo</label>
            <input 
              type="text" 
              name="subtitulo" 
              value={formData.subtitulo} 
              onChange={handleChange} 
              maxLength={255}
              placeholder="Ex: Como a IA está transformando as salas de aula"
            />
          </div>
          <div className={styles.form_group}>
            <label>Tempo de Leitura (Minutos)</label>
            <input 
              type="number" 
              name="tempoLeitura" 
              value={formData.tempoLeitura} 
              onChange={handleChange} 
              placeholder="Ex: 5"
              min="1"
            />
          </div>
        </div>

        <div className={styles.form_row}>
          <div className={styles.form_group}>
            <label>Categoria *</label>
            <select 
              name="categoria" 
              value={formData.categoria} 
              onChange={handleChange}
              required
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.form_group}>
            <label>Destaque</label>
            <select 
              name="destaque" 
              value={formData.destaque} 
              onChange={handleChange}
            >
              <option value="NENHUM">Nenhum</option>
              <option value="DESTAQUE_RAPIDO">Destaque Rápido (Máx 3)</option>
              <option value="DESTAQUE_SEMANA">Destaque da Semana (Máx 1)</option>
            </select>
          </div>
        </div>

        <div className={styles.form_group}>
          <label>Imagem de Capa {isEditing ? "(Opcional, preencha para alterar)" : "*"}</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            required={!isEditing && !file}
          />
        </div>

        <div className={styles.form_group}>
          <label>Conteúdo *</label>
          <div className={styles.markdown_editor}>
            <div className={styles.markdown_toolbar}>
              <button type="button" onClick={() => insertMarkdown('**', '**')} title="Negrito"><i className="fa-solid fa-bold"></i></button>
              <button type="button" onClick={() => insertMarkdown('*', '*')} title="Itálico"><i className="fa-solid fa-italic"></i></button>
              <div className={styles.toolbar_divider}></div>
              <button type="button" onClick={() => insertMarkdown('## ')} title="Título 2" className={styles.text_btn}>H2</button>
              <button type="button" onClick={() => insertMarkdown('### ')} title="Título 3" className={styles.text_btn}>H3</button>
              <div className={styles.toolbar_divider}></div>
              <button type="button" onClick={() => insertMarkdown('> ')} title="Citação"><i className="fa-solid fa-quote-right"></i></button>
              <button type="button" onClick={() => insertMarkdown('> 💡 **Dica importante:**\n> ')} title="Dica Importante"><i className="fa-regular fa-lightbulb"></i></button>
              <div className={styles.toolbar_divider}></div>
              <button type="button" onClick={() => insertMarkdown('[', '](https://)')} title="Link"><i className="fa-solid fa-link"></i></button>
              <button type="button" onClick={() => insertMarkdown('- ')} title="Lista"><i className="fa-solid fa-list"></i></button>
            </div>
            <textarea 
              ref={textareaRef}
              name="conteudo" 
              value={formData.conteudo} 
              onChange={handleChange}
              required
              rows="15"
              placeholder="Escreva o conteúdo do artigo aqui... (Aceita Markdown)"
            ></textarea>
          </div>
        </div>

        <div className={styles.form_group_checkbox}>
          <input 
            type="checkbox" 
            id="publicado" 
            name="publicado"
            checked={formData.publicado}
            onChange={handleChange}
          />
          <label htmlFor="publicado">Publicar imediatamente (ficará visível para os alunos)</label>
        </div>

        <div className={styles.form_actions}>
          <button 
            type="button" 
            className={styles.cancel_button}
            onClick={() => navigate("/admin/artigos")}
          >
            Cancelar
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              style={{
                backgroundColor: "transparent",
                color: "#f44336",
                border: "1px solid #f44336",
                borderRadius: "8px",
                padding: "12px 24px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s",
              }}
            >
              <i className="fa-solid fa-trash"></i> Excluir Artigo
            </button>
          )}
          <button 
            type="submit" 
            className={styles.submit_button}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Salvando..." : "Salvar Artigo"}
          </button>
        </div>
      </form>

      {showConfirm && createPortal(
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
                onClick={handleDelete}
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
                }}
              >
                <i className="fa-solid fa-trash" style={{ marginRight: "8px" }}></i>
                {isDeleting ? "Excluindo..." : "Sim, excluir"}
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
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
      )}
    </div>
  )
}

export default NovoArtigo
