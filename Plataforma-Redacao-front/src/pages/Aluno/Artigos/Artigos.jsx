import styles from "./styles.module.css"
import Title from "../../../components/Title/Title"
import { useState, useEffect } from "react"
import fetchData from "../../../utils/fetchData"
import Loading from "../../../components/Loading/Loading"
import MarkdownReader from "./MarkdownReader"

const baseURL = import.meta.env.VITE_API_BASE_URL

const Artigos = () => {
  const { getArtigos } = fetchData()

  const [artigos, setArtigos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategoria, setSelectedCategoria] = useState("TODAS")
  const [readingArtigo, setReadingArtigo] = useState(null)

  useEffect(() => {
    loadArtigos()
  }, [])

  const loadArtigos = async () => {
    setIsLoading(true)
    try {
      const data = await getArtigos()
      // Apenas artigos publicados e ordenados do mais novo para o mais antigo
      const publicados = (data || []).filter(a => a.publicado)
      const ordenados = publicados.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))
      setArtigos(ordenados)
    } catch (error) {
      console.error("Erro ao carregar artigos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Agrupamentos
  // Agrupamentos
  const destaqueSemana = artigos.find(a => a.destaque === "DESTAQUE_SEMANA")
  const destaquesRapidos = artigos.filter(a => a.destaque === "DESTAQUE_RAPIDO" && a.id !== destaqueSemana?.id).slice(0, 3)
  
  // O feed de últimas publicações deve mostrar todos os artigos recentes, sem esconder os destaques
  const outrasPublicacoes = artigos

  // Lista de categorias com contagem
  const categoriasContagem = artigos.reduce((acc, curr) => {
    acc[curr.categoria] = (acc[curr.categoria] || 0) + 1
    return acc
  }, {})

  const handleOpenArtigo = (artigo) => {
    setReadingArtigo(artigo)
  }

  const handleCloseArtigo = () => {
    setReadingArtigo(null)
  }

  if (isLoading) {
    return <div className={styles.loading_container}><Loading /></div>
  }

  if (readingArtigo) {
    return (
      <div className={styles.container}>
        <Title title="Blog e Notícias" />
        <MarkdownReader artigo={readingArtigo} onBack={handleCloseArtigo} baseURL={baseURL} />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Title title="Blog e Notícias" />

      <div className={styles.main_content}>
        {/* Menu Superior - Estilo Navegação */}
        <nav className={styles.top_nav}>
        <button 
          className={selectedCategoria === "TODAS" ? styles.active : ""}
          onClick={() => setSelectedCategoria("TODAS")}
        >
          TODAS AS PUBLICAÇÕES
        </button>
        {Object.keys(categoriasContagem).slice(0, 4).map(cat => (
          <button 
            key={cat}
            className={selectedCategoria === cat ? styles.active : ""}
            onClick={() => setSelectedCategoria(cat)}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </nav>

      {/* Grid Principal */}
      <div className={styles.main_grid}>
        
        {/* Coluna Esquerda - Destaque da Semana */}
        <div className={styles.left_column}>
          {destaqueSemana && selectedCategoria === "TODAS" && (
            <div className={styles.hero_article}>
              {destaqueSemana.imagemCapa && (
                <img src={`${baseURL}/artigos/${destaqueSemana.id}/capa`} alt={destaqueSemana.titulo} />
              )}
              <div className={styles.hero_overlay}>
                <span className={styles.hero_badge}>DESTAQUE DA SEMANA</span>
              </div>
              
              <div className={styles.hero_content}>
                <span className={styles.category_text}>{destaqueSemana.categoria.toUpperCase()}</span>
                <h2>{destaqueSemana.titulo}</h2>
                {destaqueSemana.subtitulo && <p>{destaqueSemana.subtitulo}</p>}
                
                <div className={styles.hero_meta}>
                  <span><i className="fa-regular fa-calendar"></i> {new Date(destaqueSemana.criadoEm).toLocaleDateString("pt-BR", { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  {destaqueSemana.tempoLeitura && <span><i className="fa-regular fa-clock"></i> {destaqueSemana.tempoLeitura} min de leitura</span>}
                </div>
                
                <button className={styles.read_more_btn} onClick={() => handleOpenArtigo(destaqueSemana)}>
                  Ler artigo completo <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          )}

          <div className={styles.section_header}>
            <h3>ÚLTIMAS PUBLICAÇÕES</h3>
          </div>

          <div className={styles.articles_grid}>
            {outrasPublicacoes.filter(a => selectedCategoria === "TODAS" || a.categoria === selectedCategoria).length > 0 ? (
              outrasPublicacoes
                .filter(a => selectedCategoria === "TODAS" || a.categoria === selectedCategoria)
                .map(artigo => (
                <div className={styles.article_card} key={artigo.id} onClick={() => handleOpenArtigo(artigo)}>
                  {artigo.imagemCapa && (
                    <div className={styles.card_image}>
                      <img src={`${baseURL}/artigos/${artigo.id}/capa`} alt={artigo.titulo} />
                    </div>
                  )}
                  <div className={styles.card_content}>
                    <span className={styles.card_category}>{artigo.categoria.toUpperCase()}</span>
                    <h4>{artigo.titulo}</h4>
                    {artigo.subtitulo && <p>{artigo.subtitulo}</p>}
                    
                    <div className={styles.card_meta}>
                      <span><i className="fa-regular fa-calendar"></i> {new Date(artigo.criadoEm).toLocaleDateString("pt-BR")}</span>
                      {artigo.tempoLeitura && <span><i className="fa-regular fa-clock"></i> {artigo.tempoLeitura} min</span>}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: "2rem 0", color: "#6c757d", gridColumn: "1 / -1" }}>
                <p>Nenhuma outra publicação encontrada para esta categoria.</p>
              </div>
            )}
          </div>
        </div>

        {/* Coluna Direita - Destaques Rápidos & Categorias */}
        <div className={styles.right_column}>
          
          {selectedCategoria === "TODAS" && (
            <div className={styles.sidebar_box}>
              <h3 className={styles.sidebar_title}>DESTAQUES RÁPIDOS</h3>
              <div className={styles.quick_highlights}>
                {destaquesRapidos.map(artigo => (
                  <div className={styles.quick_card} key={artigo.id} onClick={() => handleOpenArtigo(artigo)}>
                    {artigo.imagemCapa && (
                      <img src={`${baseURL}/artigos/${artigo.id}/capa`} alt={artigo.titulo} />
                    )}
                    <div className={styles.quick_content}>
                      <h4>{artigo.titulo}</h4>
                      <div className={styles.quick_meta}>
                        <span className={styles.card_category}>{artigo.categoria.toUpperCase()}</span>
                        <span>{new Date(artigo.criadoEm).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.sidebar_box}>
            <h3 className={styles.sidebar_title}>CATEGORIAS</h3>
            <ul className={styles.category_list}>
              <li onClick={() => setSelectedCategoria("TODAS")} className={selectedCategoria === "TODAS" ? styles.cat_active : ""}>
                <span>Todas</span>
                <span className={styles.cat_count}>{artigos.length}</span>
              </li>
              {Object.entries(categoriasContagem).map(([cat, count]) => (
                <li key={cat} onClick={() => setSelectedCategoria(cat)} className={selectedCategoria === cat ? styles.cat_active : ""}>
                  <span>{cat}</span>
                  <span className={styles.cat_count}>{count}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
      </div>
    </div>
  )
}

export default Artigos
