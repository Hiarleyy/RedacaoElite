import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './styles.module.css';

const extractHeadings = (markdownText) => {
  const headings = [];
  if (!markdownText) return headings;
  const lines = markdownText.split('\n');
  let idCounter = 0;
  lines.forEach(line => {
    const match = line.match(/^(#{1,6})\s+(.*)/);
    if (match) {
      headings.push({ level: match[1].length, text: match[2].trim(), id: `heading-${idCounter++}` });
    }
  });
  return headings;
};

const MarkdownReader = ({ artigo, onBack, baseURL }) => {
  const headings = useMemo(() => extractHeadings(artigo.conteudo), [artigo.conteudo]);

  // Track heading IDs for rendering
  let renderIdCounter = 0;

  return (
    <>
      {/* --- DESKTOP VIEW --- */}
      <div className={styles.desktop_reader}>
        <div className={styles.reading_container}>
          <button className={styles.back_button} onClick={onBack}>
            <i className="fa-solid fa-arrow-left"></i> Voltar para os artigos
          </button>

          <div className={styles.reader_grid}>
            {/* Main Content (Left) */}
            <article className={styles.full_article_left}>
              {artigo.imagemCapa && (
                <div className={styles.full_article_cover}>
                  <img src={`${baseURL}/artigos/${artigo.id}/capa`} alt={artigo.titulo} />
                </div>
              )}

              <div className={styles.full_article_content}>
                <span className={styles.badge}>{artigo.categoria.toUpperCase()}</span>
                <h1 className={styles.reader_main_title}>{artigo.titulo}</h1>
                {artigo.subtitulo && (
                  <div className={styles.reader_subtitle}>
                    <ReactMarkdown>{artigo.subtitulo}</ReactMarkdown>
                  </div>
                )}

                <div className={styles.article_meta}>
                  <span><i className="fa-regular fa-calendar"></i> {new Date(artigo.criadoEm).toLocaleDateString("pt-BR")}</span>
                  {artigo.tempoLeitura && (
                    <span><i className="fa-regular fa-clock"></i> {artigo.tempoLeitura} min de leitura</span>
                  )}
                  <span><i className="fa-solid fa-user"></i> Admin</span>
                </div>

                <div className={styles.article_body}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => <h1 id={`heading-${renderIdCounter++}`}>{children}</h1>,
                      h2: ({ children }) => <h2 id={`heading-${renderIdCounter++}`}>{children}</h2>,
                      h3: ({ children }) => <h3 id={`heading-${renderIdCounter++}`}>{children}</h3>,
                      h4: ({ children }) => <h4 id={`heading-${renderIdCounter++}`}>{children}</h4>,
                      blockquote: ({ children }) => {
                        const textContent = extractText(children);
                        if (textContent.includes("💡") || textContent.toLowerCase().includes("dica importante")) {
                          return (
                            <div className={styles.dica_box}>
                              <div className={styles.dica_icon}><i className="fa-regular fa-lightbulb"></i></div>
                              <div className={styles.dica_content}>
                                {children}
                              </div>
                            </div>
                          );
                        }
                        return (
                          <blockquote className={styles.custom_blockquote}>
                            {children}
                          </blockquote>
                        );
                      }
                    }}
                  >
                    {artigo.conteudo}
                  </ReactMarkdown>
                </div>

                <div className={styles.article_actions}>
                  <p>Gostou deste artigo?</p>
                  <div className={styles.action_buttons}>
                    <button><i className="fa-solid fa-thumbs-up"></i> Curtir</button>
                    <button><i className="fa-solid fa-share-nodes"></i> Compartilhar</button>
                    <button><i className="fa-solid fa-link"></i> Copiar link</button>
                  </div>
                </div>
              </div>
            </article>

            {/* Sidebar (Right) */}
            <aside className={styles.reader_sidebar}>
              <div className={styles.toc_card}>
                <h3>ÍNDICE</h3>
                <ul>
                  {headings.map((h, i) => (
                    <li key={i} className={styles[`toc_level_${h.level}`]}>
                      <span className={styles.toc_bullet}></span>
                      <a href={`#${h.id}`}>{h.text}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* --- MOBILE VIEW --- */}
      <div className={styles.mobile_reader}>
        {artigo.imagemCapa ? (
          <div className={styles.mobile_cover_wrapper}>
            <img src={`${baseURL}/artigos/${artigo.id}/capa`} alt={artigo.titulo} className={styles.mobile_cover} />
            <button className={styles.mobile_back_overlay} onClick={onBack}>
              <i className="fa-solid fa-arrow-left"></i>
            </button>
          </div>
        ) : (
          <div className={styles.mobile_no_cover_header}>
            <button className={styles.mobile_back_plain} onClick={onBack}>
              <i className="fa-solid fa-arrow-left"></i> Voltar
            </button>
          </div>
        )}

        <div className={styles.mobile_content}>
          <span className={styles.badge}>{artigo.categoria.toUpperCase()}</span>
          <h1 className={styles.mobile_title}>{artigo.titulo}</h1>
          {artigo.subtitulo && (
            <div className={styles.mobile_subtitle}>
              <ReactMarkdown>{artigo.subtitulo}</ReactMarkdown>
            </div>
          )}
          
          <div className={styles.mobile_meta}>
            <span><i className="fa-regular fa-calendar"></i> {new Date(artigo.criadoEm).toLocaleDateString("pt-BR")}</span>
            {artigo.tempoLeitura && <span><i className="fa-regular fa-clock"></i> {artigo.tempoLeitura} min</span>}
          </div>

          <div className={styles.article_body}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                blockquote: ({ children }) => {
                  const textContent = extractText(children);
                  if (textContent.includes("💡") || textContent.toLowerCase().includes("dica importante")) {
                    return (
                      <div className={styles.dica_box}>
                        <div className={styles.dica_icon}><i className="fa-regular fa-lightbulb"></i></div>
                        <div className={styles.dica_content}>{children}</div>
                      </div>
                    );
                  }
                  return <blockquote className={styles.custom_blockquote}>{children}</blockquote>;
                }
              }}
            >
              {artigo.conteudo}
            </ReactMarkdown>
          </div>

          <div className={styles.article_actions}>
            <p>Gostou deste artigo?</p>
            <div className={styles.action_buttons}>
              <button><i className="fa-solid fa-thumbs-up"></i></button>
              <button><i className="fa-solid fa-share-nodes"></i></button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Helper to extract plain text from React nodes
function extractText(node) {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node && node.props && node.props.children) {
    return extractText(node.props.children);
  }
  return '';
}

export default MarkdownReader;
