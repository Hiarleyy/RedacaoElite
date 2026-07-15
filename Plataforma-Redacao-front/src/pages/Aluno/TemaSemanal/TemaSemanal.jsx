import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import Title from "../../../components/Title/Title";
import fetchData from "../../../utils/fetchData";
import folhaRedacaoPdf from "../../../config/Folha Redacao.pdf";
import Loading from "../../../components/Loading/Loading";
import { useNavigate } from "react-router-dom";
import logo from "../../../images/logo02.png"; // Assuming standard logo path

const pad = (n) => String(n).padStart(2, "0");

const calcularTempo = (dataAlvo) => {
    if (!dataAlvo) return null;
    const diff = new Date(dataAlvo).getTime() - Date.now();
    if (diff <= 0) return { dias: 0, horas: 0, minutos: 0, segundos: 0, expirado: true };
    return {
        dias: Math.floor(diff / (1000 * 60 * 60 * 24)),
        horas: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutos: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        segundos: Math.floor((diff % (1000 * 60)) / 1000),
        expirado: false,
    };
};

const TemaSemanal = () => {
    const [proposta, setProposta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tempo, setTempo] = useState(null);
    const [showVideoLink, setShowVideoLink] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTema = async () => {
            try {
                const { getPropostas } = fetchData();
                const propostas = await getPropostas();
                if (propostas && propostas.length > 0) {
                    // Pega a proposta mais recente (última criada)
                    const latestProposta = propostas[propostas.length - 1];

                    // Trata os eixos se vierem como string JSON
                    let eixosParsed = [];
                    if (latestProposta.eixos) {
                        try {
                            eixosParsed = typeof latestProposta.eixos === 'string' ? JSON.parse(latestProposta.eixos) : latestProposta.eixos;
                        } catch {
                            eixosParsed = [];
                        }
                    }
                    latestProposta.eixosParsed = eixosParsed;

                    // Os materiais vêm do campo 'materiais' (relação do Prisma)
                    const materiaisParsed = Array.isArray(latestProposta.materiais) ? latestProposta.materiais : [];
                    latestProposta.materiaisParsed = materiaisParsed;
                    console.log('[TemaSemanal] proposta carregada:', latestProposta);
                    console.log('[TemaSemanal] materiais:', materiaisParsed);

                    setProposta(latestProposta);
                }
            } catch (error) {
                console.error("Erro ao buscar propostas:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTema();
    }, []);

    useEffect(() => {
        if (!proposta?.dataFinal) return;
        const tick = () => setTempo(calcularTempo(proposta.dataFinal));
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [proposta]);

    if (loading) {
        return (
            <div className={styles.container}>
                <Title title="Tema Semanal" />
                <div className={styles.loading}>
                    <Loading />
                </div>
            </div>
        );
    }

    if (!proposta) {
        return (
            <div className={styles.container}>
                <Title title="Tema Semanal" />
                <div style={{ textAlign: "center", marginTop: "50px", color: "#ccc" }}>
                    <p>Nenhum tema disponível no momento.</p>
                </div>
            </div>
        );
    }

    // Helper para extrair o material de apoio
    const bannerMaterial = proposta.materiaisParsed?.find(m => m.nome === 'Imagem de capa');
    const pdfMaterial = proposta.materiaisParsed?.find(m => m.nome === 'Tema da Proposta');
    const videoMaterial = proposta.materiaisParsed?.find(m => m.tipo === 'video' || m.nome?.toLowerCase().includes('vídeo') || m.nome?.toLowerCase().includes('video'));
    const dicasMaterial = proposta.materiaisParsed?.find(m => m.nome === 'Material de Apoio');

    const getResourceUrl = (material) => {
        if (!material) return null;
        const link = material.caminho || material.link;
        if (!link) return null;
        // Se for um link externo (YouTube, etc.), retorna direto
        if (link.startsWith('http://') || link.startsWith('https://')) return link;
        // Arquivos de upload ficam em /uploads/propostas/ no servidor
        const baseURL = import.meta.env.VITE_API_BASE_URL;
        return `${baseURL}/uploads/propostas/${link}`;
    };

    return (
        <div className={styles.container}>
            <Title title="Tema Semanal" />
            <div className={styles.topSection}>
                {/* Lado Esquerdo: Banner */}
                <div className={styles.bannerCard}>
                    {/* Se a proposta tiver uma imagem no banco, podemos usar ela. Senão fallback */}
                    {bannerMaterial ? (
                        <img src={getResourceUrl(bannerMaterial)} alt="Banner do Tema" className={styles.bannerImage} />
                    ) : (
                        <div className={styles.bannerContent} style={{ background: '#111' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '14px', letterSpacing: '2px' }}>PESQUISA ELITE</span>
                                <i className="fa-solid fa-magnifying-glass" style={{ color: '#DA9E00' }}></i>
                            </div>
                            <h2 className={styles.bannerTitle}>
                                TEMA DA SEMANA
                            </h2>
                            <p className={styles.bannerSubtitle}>
                                Baseado na pesquisa realizada com<br />
                                mais de 1.217 estudantes
                            </p>
                            <div className={styles.bannerHighlight}>
                                entre os dias 10 e 15 de junho de 2024.
                            </div>
                            <div style={{ marginTop: '30px' }}>
                                <img src={logo} alt="Redação Elite" style={{ height: '50px' }} />
                                <p style={{ fontSize: '10px', marginTop: '5px', letterSpacing: '1px', opacity: 0.7 }}>O CURSO QUE APROVA</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Lado Direito: Tema Proposto e Ações */}
                <div className={styles.temaPropostoCard}>
                    <div className={styles.sectionHeader}>
                        <i className="fa-solid fa-bullseye" style={{ color: '#DA9E00' }}></i>
                        <span style={{ color: '#DA9E00' }}>Tema Proposto</span>
                    </div>

                    <div className={styles.temaTextoContainer}>
                        <p className={styles.temaTexto}>
                            "{proposta.tema}"
                        </p>
                    </div>

                    <div>
                        <h4 className={styles.eixosTitle} style={{ color: '#DA9E00' }}>Eixos Associados</h4>
                        <div className={styles.eixosContainer}>
                            {proposta.eixosParsed && proposta.eixosParsed.length > 0 ? (
                                proposta.eixosParsed.map((eixo, index) => (
                                    <span key={index} className={styles.eixoTag}>{eixo}</span>
                                ))
                            ) : (
                                <span className={styles.eixoTag}>Nenhum eixo</span>
                            )}
                        </div>
                    </div>

                    {/* Seção de Ação com Countdown e Botão Enviar */}
                    <div className={styles.actionSection}>
                        <div className={styles.countdownContainer}>
                            <h4 style={{ color: '#DA9E00', fontSize: '12px', marginBottom: '10px' }}>
                                <i className="fa-regular fa-clock" style={{ color: '#dfd10fff' }}></i> PRAZO DE ENVIO
                            </h4>

                            {tempo && !tempo.expirado ? (
                                <div className={styles.countdownFlex}>
                                    <div className={styles.countdownItem}>
                                        <span className={styles.countdownValue}>{pad(tempo.dias)}</span>
                                        <span className={styles.countdownLabel}>Dias</span>
                                    </div>
                                    <span className={styles.countdownColon}>:</span>
                                    <div className={styles.countdownItem}>
                                        <span className={styles.countdownValue}>{pad(tempo.horas)}</span>
                                        <span className={styles.countdownLabel}>Horas</span>
                                    </div>
                                    <span className={styles.countdownColon}>:</span>
                                    <div className={styles.countdownItem}>
                                        <span className={styles.countdownValue}>{pad(tempo.minutos)}</span>
                                        <span className={styles.countdownLabel}>Min</span>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ color: '#ff4444', fontWeight: 'bold' }}>Prazo Expirado</div>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <button className={styles.btnEnviar} onClick={() => navigate('/aluno/nova-redacao')}>
                                <i className="fa-solid fa-paper-plane"></i>
                                Enviar Redação
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cards Inferiores */}
            <div className={styles.bottomCards}>

                {/* PDF DO TEMA */}
                <div className={styles.materialCard}>
                    <div className={styles.sectionHeader}>
                        <i className="fa-regular fa-file-lines" style={{ color: '#C28C00' }}></i>
                        <span style={{ color: '#C28C00' }}>PDF DO TEMA</span>
                    </div>
                    <p className={styles.materialDesc}>
                        {pdfMaterial?.descricao || "Baixe o PDF com a proposta completa do tema da semana."}
                    </p>
                    <div className={styles.materialPreview}>
                        <i className="fa-solid fa-file-pdf" style={{ color: '#f44336' }}></i>
                        {pdfMaterial && <span style={{ fontSize: '16px', marginLeft: '10px', color: '#fff', fontWeight: 'bold' }}>PDF</span>}
                    </div>
                    {pdfMaterial ? (
                        <a href={getResourceUrl(pdfMaterial)} target="_blank" rel="noopener noreferrer" className={styles.materialBtn}>
                            <i className="fa-solid fa-download"></i> Baixar PDF
                        </a>
                    ) : (
                        <button className={styles.materialBtn} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                            Indisponível
                        </button>
                    )}
                </div>

                {/* VÍ­DEO AULA */}
                <div className={styles.materialCard}>
                    <div className={styles.sectionHeader}>
                        <i className="fa-brands fa-youtube" style={{ color: '#C28C00' }}></i>
                        <span style={{ color: '#C28C00' }}>VÍ­DEO AULA</span>
                    </div>
                    <p className={styles.materialDesc}>
                        {videoMaterial?.descricao || "Assista à videoaula com análise completa do tema e repertórios."}
                    </p>
                    <div className={styles.materialPreview} style={{ background: '#000' }}>
                        <i className="fa-brands fa-youtube" style={{ color: '#f44336' }}></i>
                    </div>
                    {videoMaterial ? (
                        <>
                            <a
                                href={getResourceUrl(videoMaterial)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.materialBtn}
                                onClick={() => setShowVideoLink(true)}
                            >
                                <i className="fa-solid fa-play"></i> Assistir agora
                            </a>
                            {showVideoLink && (
                                <div style={{ marginTop: '8px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', padding: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <input
                                        readOnly
                                        value={getResourceUrl(videoMaterial)}
                                        style={{ flex: 1, background: 'transparent', border: 'none', color: '#ccc', fontSize: '11px', outline: 'none' }}
                                    />
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(getResourceUrl(videoMaterial));
                                        }}
                                        style={{ background: '#DA9E00', border: 'none', color: '#000', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                                    >
                                        <i className="fa-regular fa-copy"></i> Copiar
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <button className={styles.materialBtn} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                            Indisponível
                        </button>
                    )}
                </div>

                {/* DICAS DE PROJETO DE TEXTO */}
                <div className={styles.materialCard}>
                    <div className={styles.sectionHeader}>
                        <i className="fa-regular fa-lightbulb" style={{ color: '#C28C00' }}></i>
                        <span style={{ color: '#C28C00' }}>DICAS DE PROJETO DE TEXTO</span>
                    </div>
                    <p className={styles.materialDesc}>
                        {dicasMaterial?.descricao || "Baixe as dicas para estruturar seu texto com excelência."}
                    </p>
                    <div className={styles.materialPreview}>
                        <i className="fa-solid fa-list-check" style={{ color: '#4CAF50' }}></i>
                    </div>
                    {dicasMaterial ? (
                        <a href={getResourceUrl(dicasMaterial)} target="_blank" rel="noopener noreferrer" className={styles.materialBtn}>
                            <i className="fa-solid fa-download"></i> Baixar PDF
                        </a>
                    ) : (
                        <button className={styles.materialBtn} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                            Indisponível
                        </button>
                    )}
                </div>

                {/* FOLHA DE PRODUÇÃO */}
                <div className={styles.materialCard}>
                    <div className={styles.sectionHeader}>
                        <i className="fa-solid fa-file-signature" style={{ color: '#C28C00' }}></i>
                        <span style={{ color: '#C28C00' }}>FOLHA DE PRODUÇÃO</span>
                    </div>
                    <p className={styles.materialDesc}>
                        Baixe a folha oficial para produzir seu texto.
                    </p>
                    <div className={styles.materialPreview}>
                        <i className="fa-regular fa-file-pdf" style={{ color: '#2196F3' }}></i>
                    </div>
                    <a href={folhaRedacaoPdf} target="_blank" rel="noopener noreferrer" className={styles.materialBtn}>
                        <i className="fa-solid fa-download"></i> Baixar
                    </a>
                </div>
            </div>

            <div className={styles.quoteSection}>
                <span className={styles.quoteText}>"Pratique com foco, escreva com propósito e conquiste a sua melhor versão."</span>
                <span className={styles.quoteAuthor}>- Prof. Daniel Vieira</span>
            </div>

        </div>
    );
};

export default TemaSemanal;