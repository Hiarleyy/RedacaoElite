import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Title from "../../../components/Title/Title";
import fetchData from '../../../utils/fetchData';

import { 
    FileText, 
    Brain, 
    PenLine, 
    Search, 
    CheckSquare, 
    Star, 
    Target, 
    Clock, 
    Flame, 
    Trophy, 
    TrendingUp, 
    File, 
    Upload, 
    Play, 
    Pause, 
    RotateCcw,
    Quote
} from 'lucide-react';
import styles from './styles.module.css';

const Pomodoro = () => {
    const navigate = useNavigate();
    const [isPlaying, setIsPlaying] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const timerRef = useRef(null);

    const [propostaAtual, setPropostaAtual] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [toastMessage, setToastMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchProposta = async () => {
            try {
                const { getPropostas } = fetchData();
                const propostas = await getPropostas();
                if (propostas && propostas.length > 0) {
                    setPropostaAtual(propostas[propostas.length - 1]);
                }
            } catch (error) {
                console.error("Erro ao buscar propostas", error);
            }
        };
        fetchProposta();
    }, []);

    const fetchHistory = async () => {
        try {
            const data = localStorage.getItem("user_access_data");
            if (data) {
                const { id } = JSON.parse(data);
                const { getPomodoroSessionsByAluno } = fetchData();
                const sessoes = await getPomodoroSessionsByAluno(id);
                setHistoryData(sessoes || []);
            }
        } catch (error) {
            console.error("Erro ao buscar histórico", error);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    useEffect(() => {
        if (isPlaying && !isFinished) {
            timerRef.current = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isPlaying, isFinished]);

    const getPhaseIndex = (time) => {
        if (time < 10 * 60) return 0;
        if (time < 40 * 60) return 1;
        if (time < 50 * 60) return 2;
        if (time < 90 * 60) return 3;
        return 4; 
    };

    const currentPhaseIndex = getPhaseIndex(elapsedTime);
    const [lastPhase, setLastPhase] = useState(0);

    const phases = [
        { title: "Interpretação e planejamento", timeStr: "Até 10 minutos", icon: <Brain size={20} /> },
        { title: "Produção de rascunho", timeStr: "Até 30 minutos", icon: <PenLine size={20} /> },
        { title: "Revisão de texto", timeStr: "Até 10 minutos", icon: <Search size={20} /> },
        { title: "Finalização", timeStr: "Até 40 minutos", icon: <CheckSquare size={20} /> }
    ];

    useEffect(() => {
        if (currentPhaseIndex > lastPhase && currentPhaseIndex < 4) {
            setToastMessage(`${phases[lastPhase].title} finalizada!`);
            setLastPhase(currentPhaseIndex);
            setTimeout(() => setToastMessage(''), 4000);
        } else if (currentPhaseIndex > lastPhase && currentPhaseIndex === 4) {
            setToastMessage("Tempo sugerido concluído! Você está no tempo extra.");
            setLastPhase(currentPhaseIndex);
            setTimeout(() => setToastMessage(''), 4000);
        }
    }, [currentPhaseIndex, lastPhase]);

    const formatTime = (timeInSeconds) => {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = timeInSeconds % 60;
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const formatHistoryDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const resetTimer = () => {
        setIsPlaying(false);
        setIsFinished(false);
        setElapsedTime(0);
        setLastPhase(0);
    };

    const handleFinalizar = () => {
        setIsPlaying(false);
        setIsFinished(true);
    };

    const handleSalvarSessao = async () => {
        setIsSaving(true);
        try {
            const data = localStorage.getItem("user_access_data");
            if (data) {
                const { id } = JSON.parse(data);
                const { createPomodoroSession } = fetchData();
                
                let pontos = Math.floor(elapsedTime / 60);
                if (pontos > 150) pontos = 150;
                if (pontos < 10 && elapsedTime > 60) pontos = 10;
                if (elapsedTime <= 60) pontos = 0; // Menos de 1 min

                await createPomodoroSession({
                    tema: propostaAtual ? propostaAtual.tema : "Sessão Livre",
                    duracao: elapsedTime,
                    pontos: pontos,
                    usuarioId: id
                });
                
                setToastMessage(`Sessão salva com sucesso! +${pontos} pts`);
                setTimeout(() => setToastMessage(''), 4000);
                
                resetTimer();
                fetchHistory();
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar a sessão.");
        } finally {
            setIsSaving(false);
        }
    };

    const totalSessoes = historyData.length;
    const totalPontos = historyData.reduce((acc, curr) => acc + curr.pontos, 0);
    const tempoTotalSecs = historyData.reduce((acc, curr) => acc + curr.duracao, 0);

    const formatTempoTotal = (secs) => {
        const hours = Math.floor(secs / 3600);
        const mins = Math.floor((secs % 3600) / 60);
        return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m`;
    };

    return (
        <div className={styles.container}>
            <Title title="Pomodoro - Produção de Texto"/>
            <div className={styles.dashboard}>

                {toastMessage && (
                    <div style={{
                        position: 'fixed', top: '20px', right: '20px', background: '#ffb800', color: '#000', 
                        padding: '15px 20px', borderRadius: '8px', zIndex: 1000, fontWeight: 'bold',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '10px',
                        animation: 'slideIn 0.5s ease-out'
                    }}>
                        <Target size={20} />
                        {toastMessage}
                    </div>
                )}

            {/* Left Column */}
                <div className={styles.leftColumn}>
                    <section className={styles.card}>
                        <h2 className={styles.sectionTitle}>TEMA ATUAL</h2>
                        <h3 className={styles.themeTitle}>{propostaAtual ? 'Proposta Atual' : 'Carregando...'}</h3>
                        <p className={styles.themeDescription}>
                            {propostaAtual ? propostaAtual.tema : 'Buscando a proposta mais recente...'}
                        </p>
                        <button className={styles.outlineButton} onClick={() => navigate('/aluno/tema-semanal')}>Ver proposta completa</button>
                        <div className={styles.docIconContainer}>
                            <FileText size={24} />
                        </div>
                    </section>

                    <section className={styles.card}>
                        <h2 className={styles.sectionTitle}>PASSO A PASSO DA PRODUÇÃO</h2>
                        <p className={styles.stepSubtitle}>Siga as etapas e organize seu tempo:</p>
                        
                        <div className={styles.stepsList}>
                            {phases.map((phase, index) => (
                                <div key={index} className={styles.stepItem} style={{ opacity: currentPhaseIndex === index ? 1 : 0.5, borderLeft: currentPhaseIndex === index ? '3px solid #ffb800' : '3px solid transparent', paddingLeft: currentPhaseIndex === index ? '10px' : '0', transition: 'all 0.3s ease' }}>
                                    <div className={styles.stepIconContainer}>
                                        <div className={styles.stepNumber} style={{ backgroundColor: currentPhaseIndex === index ? '#ffb800' : '#333' }}>{index + 1}</div>
                                        <div className={styles.stepIcon} style={{ color: currentPhaseIndex === index ? '#ffb800' : '#888' }}>{phase.icon}</div>
                                    </div>
                                    <div className={styles.stepContent}>
                                        <h4 style={{ color: currentPhaseIndex === index ? '#fff' : '#ccc' }}>{phase.title}</h4>
                                        <span className={styles.stepTime}>{phase.timeStr}</span>
                                        <p style={{ display: currentPhaseIndex === index ? 'block' : 'none' }}>Você está nesta etapa agora! Mantenha o foco.</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.eliteTip}>
                            <Star className={styles.tipIcon} />
                            <p><span>Dica Elite:</span> Respeite o tempo de cada etapa e mantenha o foco até o final!</p>
                        </div>
                    </section>
                </div>

                {/* Middle Column */}
                <div className={styles.middleColumn}>
                    <div className={styles.tabs}>
                        <button className={`${styles.tab} ${styles.activeTab}`}>POMODORO</button>
                        <button className={styles.tab}>DESCANSO CURTO</button>
                        <button className={styles.tab}>DESCANSO LONGO</button>
                    </div>

                    <section className={styles.timerCard}>
                        <div className={styles.currentStepBadge}>ETAPA ATUAL</div>
                        <h3>{currentPhaseIndex < 4 ? phases[currentPhaseIndex].title : "Tempo Extra"}</h3>
                        <p>{currentPhaseIndex < 4 ? phases[currentPhaseIndex].timeStr : "Sem limite"}</p>

                        <div className={styles.timerWrapper} style={{ position: 'relative', width: '280px', height: '280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="280" height="280" style={{ transform: 'rotate(-90deg)' }}>
                                <circle 
                                    cx="140" cy="140" r="130" 
                                    fill="none" stroke="#2a2a2a" strokeWidth="12"
                                />
                                <circle 
                                    cx="140" cy="140" r="130" 
                                    fill="none" stroke={currentPhaseIndex === 4 ? "#ff4444" : "#ffb800"} strokeWidth="12"
                                    strokeDasharray={280 * Math.PI}
                                    strokeDashoffset={(280 * Math.PI) - ((280 * Math.PI) * Math.min((elapsedTime / (90 * 60)) * 100, 100)) / 100}
                                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                                />
                            </svg>
                            <div className={styles.timerDisplay} style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span className={styles.timerLabel}>TEMPO DECORRIDO</span>
                                <span className={styles.timerValue} style={{ color: currentPhaseIndex === 4 ? "#ff4444" : "#fff" }}>{formatTime(elapsedTime)}</span>
                                <span className={styles.timerStatusBadge}>
                                    {isFinished ? 'CONCLUÍDO' : isPlaying ? 'EM ANDAMENTO' : 'PAUSADO'}
                                </span>
                            </div>
                        </div>

                        <div className={styles.timerControls}>
                            {!isFinished ? (
                                <>
                                    <button 
                                        className={styles.primaryButton} 
                                        onClick={() => setIsPlaying(!isPlaying)}
                                    >
                                        {isPlaying ? <Pause size={20} fill="#000" /> : <Play size={20} fill="#000" />} 
                                        {isPlaying ? 'Pausar' : 'Iniciar'}
                                    </button>
                                    <button className={styles.outlineButton} onClick={handleFinalizar} disabled={elapsedTime === 0}>
                                        <CheckSquare size={20} /> Finalizar Redação
                                    </button>
                                    <button className={styles.iconButton} onClick={resetTimer}>
                                        <RotateCcw size={24} />
                                    </button>
                                </>
                            ) : (
                                <button 
                                    className={styles.primaryButton} 
                                    style={{ width: '100%', backgroundColor: '#4CAF50', color: '#fff' }}
                                    onClick={handleSalvarSessao}
                                    disabled={isSaving}
                                >
                                    {isSaving ? "Salvando..." : "Salvar Sessão"}
                                </button>
                            )}
                        </div>

                        <div className={styles.focusMessage}>
                            <Target className={styles.focusIcon} />
                            <div>
                                <h4>Foco total!</h4>
                                <p>Evite distrações e mantenha-se concentrado na sua produção.</p>
                            </div>
                        </div>
                    </section>

                    <section className={styles.notesCard}>
                        <h2 className={styles.sectionTitle}>ANOTAÇÕES RÁPIDAS</h2>
                        <textarea 
                            className={styles.notesTextarea} 
                            placeholder="Anote ideias, argumentos, exemplos..."
                        ></textarea>
                        <div className={styles.charCount}>0 caracteres</div>
                    </section>
                </div>

                {/* Right Column */}
                <div className={styles.rightColumn}>
                    <section className={styles.card}>
                        <h2 className={styles.sectionTitle}>RESUMO DA SESSÃO ATUAL</h2>
                        <div className={styles.statsGrid}>
                            <div className={styles.statBox}>
                                <div className={styles.statIconRow}>
                                    <Clock className={styles.statIcon} />
                                    <span className={styles.statValue}>{formatTempoTotal(tempoTotalSecs)}</span>
                                </div>
                                <span className={styles.statLabel}>Tempo total de produção</span>
                            </div>
                            
                            <div className={styles.statBox}>
                                <div className={styles.statIconRow}>
                                    <div style={{width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffb800'}}>
                                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 3v3"></path><path d="M10 5.5l2-2.5 2 2.5"></path></svg>
                                    </div>
                                    <span className={styles.statValue}>{totalSessoes}</span>
                                </div>
                                <span className={styles.statLabel}>Sessões realizadas</span>
                            </div>

                            <div className={styles.statBox}>
                                <div className={styles.statIconRow}>
                                    <Flame className={styles.statIcon} />
                                    <span className={styles.statValue}>1</span>
                                </div>
                                <span className={styles.statLabel}>Sequência de dias</span>
                            </div>

                            <div className={styles.statBox}>
                                <div className={styles.statIconRow}>
                                    <Trophy className={styles.statIcon} />
                                    <span className={styles.statValue}>{totalPontos}</span>
                                </div>
                                <span className={styles.statLabel}>Pontos conquistados</span>
                            </div>
                        </div>
                        
                        <div className={styles.focusBarContainer}>
                            <div className={styles.focusHeader}>
                                <TrendingUp className={styles.statIcon} />
                                <span className={styles.focusPercentage}>70%</span>
                            </div>
                            <div className={styles.focusText}>Foco médio da sessão</div>
                            <div style={{marginTop: '12px'}} className={styles.progressBar}>
                                <div className={styles.progressFill}></div>
                            </div>
                        </div>
                    </section>

                    <section className={styles.card} style={{ flex: 1, paddingBottom: 0 }}>
                        <div className={styles.historyHeader}>
                            <h2 className={styles.sectionTitle}>HISTÓRICO DE SESSÕES</h2>
                            <button className={styles.linkButton}>Ver todas</button>
                        </div>
                        <div className={styles.historyList}>
                            {historyData.length > 0 ? historyData.slice(0, 5).map((item) => (
                                <div key={item.id} className={styles.historyItem}>
                                    <File className={styles.historyIcon} />
                                    <div className={styles.historyInfo}>
                                        <h4 className={styles.historyTitle}>{item.tema}</h4>
                                        <p className={styles.historyDate}>{formatHistoryDate(item.data)}</p>
                                    </div>
                                    <div className={styles.historyStats}>
                                        <span>{formatTime(item.duracao)}</span>
                                        <span>{item.pontos} pts</span>
                                    </div>
                                </div>
                            )) : (
                                <p style={{ color: '#888', textAlign: 'center', marginTop: '20px' }}>Nenhuma sessão salva ainda.</p>
                            )}
                        </div>
                        <button className={styles.viewAllSessions}>Ver todas as sessões</button>
                    </section>
                </div>

                {/* Footer Quote */}
                <div className={styles.quoteFooter}>
                    <Quote className={styles.quoteIcon} fill="#ffb800" />
                    <p className={styles.quoteText}>Grandes resultados começam com pequenas decisões diárias.</p>
                    <span className={styles.quoteAuthor}>Prof. Daniel Vieira</span>
                </div>

                {/* Floating Action Button */}
                <button className={styles.fabButton}>
                    <Upload size={28} />
                </button>
            </div>
        
        </div>
        
    );
};

export default Pomodoro;
