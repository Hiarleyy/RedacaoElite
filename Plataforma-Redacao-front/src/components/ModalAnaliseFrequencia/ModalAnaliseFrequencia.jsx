import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";
import defaultProfilePicture from "../../images/Defalult_profile_picture.jpg";
import Message from "../Message/Message";
import fetchData from "../../utils/fetchData";

const ModalAnaliseFrequencia = ({ isOpen, onClose, aluno, frequencias = [], appliedFilters = {}, turmas = [], onUpdateSuccess }) => {
    const navigate = useNavigate();
    const baseURL = import.meta.env.VITE_API_BASE_URL;

    const [editingFreqId, setEditingFreqId] = useState(null);
    const [editStatus, setEditStatus] = useState("");
    const [editJustificativa, setEditJustificativa] = useState("");
    const [loadingSave, setLoadingSave] = useState(false);
    const [message, setMessage] = useState(null);

    // 1. Encontra o nome da turma do aluno
    const nomeTurma = useMemo(() => {
        if (!aluno || !turmas.length) return "Sem Turma";
        const found = turmas.find(t => String(t.id) === String(aluno.turmaId));
        return found ? found.nome : "Sem Turma";
    }, [aluno, turmas]);

    // 2. Filtra as frequências do aluno (todas as frequências dele, sem filtro de período)
    const studentAllFrequencias = useMemo(() => {
        if (!frequencias.length || !aluno) return [];
        return frequencias.filter(f => String(f.usuarioId) === String(aluno.id));
    }, [frequencias, aluno]);

    // 3. Calcula as estatísticas de presença
    const stats = useMemo(() => {
        const total = studentAllFrequencias.length;
        if (total === 0) {
            return {
                porcentagem: 0,
                presencas: 0,
                faltasJustificadas: 0,
                faltasNaoJustificadas: 0,
                totalFaltas: 0
            };
        }

        const presencas = studentAllFrequencias.filter(f => f.status === "PRESENTE").length;
        const faltasJustificadas = studentAllFrequencias.filter(f => f.status === "JUSTIFICADO").length;
        const faltasNaoJustificadas = studentAllFrequencias.filter(f => f.status === "FALTOU").length;

        // Frequência é calculada considerando presentes + justificados como presença válida
        const totalPresencasValidas = presencas + faltasJustificadas;
        const porcentagem = Math.round((totalPresencasValidas / total) * 100);

        return {
            porcentagem,
            presencas,
            faltasJustificadas,
            faltasNaoJustificadas,
            totalFaltas: faltasJustificadas + faltasNaoJustificadas
        };
    }, [studentAllFrequencias]);

    // 4. Ordena as frequências da mais recente para a mais antiga para a timeline (pega apenas as 5 últimas)
    const orderedFrequencias = useMemo(() => {
        return [...studentAllFrequencias]
            .sort((a, b) => new Date(b.data) - new Date(a.data))
            .slice(0, 5);
    }, [studentAllFrequencias]);

    // Define a cor/classe de risco com base no percentual
    const statusRisco = useMemo(() => {
        const { porcentagem } = stats;
        if (porcentagem >= 90) return { label: "Excelente", class: styles.risk_excelente };
        if (porcentagem >= 75) return { label: "Alerta", class: styles.risk_alerta };
        return { label: "Crítico", class: styles.risk_critico };
    }, [stats]);

    if (!isOpen || !aluno) return null;

    const handleStartEdit = (freq) => {
        setEditingFreqId(freq.id);
        setEditStatus(freq.status);
        setEditJustificativa(freq.justificativa || "");
    };

    const handleCancelEdit = () => {
        setEditingFreqId(null);
        setEditStatus("");
        setEditJustificativa("");
    };

    const handleSaveEdit = async (freqId) => {
        setLoadingSave(true);
        setMessage(null);
        try {
            const { updateFrequencia } = fetchData();
            await updateFrequencia(freqId, {
                status: editStatus,
                justificativa: editStatus === "PRESENTE" ? "" : editJustificativa
            });
            
            if (onUpdateSuccess) {
                await onUpdateSuccess();
            }
            
            setEditingFreqId(null);
            setMessage({ type: "success", text: "Frequência atualizada com sucesso!" });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error("Erro ao atualizar frequência:", error);
            setMessage({
                type: "error",
                text: error.response?.data?.message || "Erro ao atualizar a frequência."
            });
        } finally {
            setLoadingSave(false);
        }
    };

    const handleClose = () => {
        handleCancelEdit();
        setMessage(null);
        onClose();
    };

    const handleNavigate = () => {
        navigate(`/admin/gerenciar-alunos/${aluno.id}`);
        onClose();
    };

    return (
        <div className={styles.modal_overlay} onClick={handleClose}>
            <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
                <button className={styles.close_modal} onClick={handleClose} title="Fechar">
                    <i className="fa-solid fa-xmark"></i>
                </button>

                <h2 className={styles.modal_title}>ANÁLISE DO ALUNO</h2>

                {/* Perfil & Info Básica */}
                <div className={styles.profile_section}>
                    <img
                        src={aluno.caminho ? `${baseURL}/usuarios/${aluno.id}/profile-image` : defaultProfilePicture}
                        alt={aluno.nome}
                        className={styles.profile_avatar}
                    />
                    <div className={styles.profile_info}>
                        <h3>{aluno.nome}</h3>
                        <p><i className="fa-regular fa-envelope"></i> {aluno.email}</p>
                        <p><i className="fa-solid fa-graduation-cap"></i> Turma: <span>{nomeTurma}</span></p>
                        <p className={styles.period_info}>
                            <i className="fa-regular fa-calendar"></i> Período analisado: <strong>Todo o histórico</strong>
                        </p>
                    </div>
                </div>

                {/* Dashboard de Frequência */}
                <div className={styles.dashboard_grid}>
                    <div className={`${styles.dash_card} ${styles.freq_card}`}>
                        <span className={styles.card_label}>Frequência Geral</span>
                        <div className={styles.radial_wrapper}>
                            <span className={styles.card_value}>{stats.porcentagem}%</span>
                            <span className={`${styles.risk_badge} ${statusRisco.class}`}>
                                {statusRisco.label}
                            </span>
                        </div>
                    </div>
                    <div className={styles.dash_card}>
                        <span className={styles.card_label}>Presenças</span>
                        <span className={`${styles.card_value} ${styles.text_green}`}>{stats.presencas}</span>
                        <span className={styles.card_subtext}>aulas assistidas</span>
                    </div>
                    <div className={styles.dash_card}>
                        <span className={styles.card_label}>Faltas Justificadas</span>
                        <span className={`${styles.card_value} ${styles.text_yellow}`}>{stats.faltasJustificadas}</span>
                        <span className={styles.card_subtext}>com justificativa</span>
                    </div>
                    <div className={styles.dash_card}>
                        <span className={styles.card_label}>Faltas Não Justificadas</span>
                        <span className={`${styles.card_value} ${styles.text_red}`}>{stats.faltasNaoJustificadas}</span>
                        <span className={styles.card_subtext}>faltas sem abono</span>
                    </div>
                </div>

                {/* Mensagem de alerta se estiver em risco */}
                {stats.porcentagem < 75 && stats.porcentagem > 0 && (
                    <div className={styles.warning_banner}>
                        <i className="fa-solid fa-triangle-exclamation"></i>
                        <span>
                            <strong>Atenção:</strong> A frequência deste aluno está em <strong>{stats.porcentagem}%</strong>, abaixo do limite mínimo de 75%. Risco de reprovação por faltas.
                        </span>
                    </div>
                )}

                {/* Linha do tempo de Chamadas */}
                <h4 className={styles.section_title}>Histórico de Ocorrências</h4>
                
                {message && (
                    <Message text={message.text} type={message.type} marginTop="0" marginBottom="15px" />
                )}

                <div className={styles.timeline_wrapper}>
                    {orderedFrequencias.length === 0 ? (
                        <p className={styles.empty_timeline}>Nenhum registro de chamada encontrado para este aluno.</p>
                    ) : (
                        <div className={styles.timeline}>
                            {orderedFrequencias.map((freq) => {
                                const isEditing = editingFreqId === freq.id;
                                const isPresent = freq.status === "PRESENTE";
                                const isJustified = freq.status === "JUSTIFICADO";
                                let statusClass = styles.badge_present;
                                let statusLabel = "Presente";

                                if (isJustified) {
                                    statusClass = styles.badge_justified;
                                    statusLabel = "Justificado";
                                } else if (freq.status === "FALTOU") {
                                    statusClass = styles.badge_absent;
                                    statusLabel = "Faltou";
                                }

                                return (
                                    <div key={freq.id} className={styles.timeline_item}>
                                        <div className={styles.timeline_date}>
                                            {new Date(freq.data).toLocaleDateString('pt-BR')}
                                        </div>
                                        {isEditing ? (
                                            <div className={styles.timeline_content_edit}>
                                                <div className={styles.edit_row}>
                                                    <select
                                                        value={editStatus}
                                                        onChange={(e) => setEditStatus(e.target.value)}
                                                        className={styles.edit_status_select}
                                                        disabled={loadingSave}
                                                    >
                                                        <option value="PRESENTE">PRESENTE</option>
                                                        <option value="FALTOU">FALTOU</option>
                                                        <option value="JUSTIFICADO">JUSTIFICADO</option>
                                                    </select>
                                                    <div className={styles.edit_actions}>
                                                        <button 
                                                            className={styles.btn_save_edit}
                                                            onClick={() => handleSaveEdit(freq.id)}
                                                            disabled={loadingSave}
                                                            title="Salvar"
                                                        >
                                                            <i className="fa-solid fa-check"></i>
                                                        </button>
                                                        <button 
                                                            className={styles.btn_cancel_edit}
                                                            onClick={handleCancelEdit}
                                                            disabled={loadingSave}
                                                            title="Cancelar"
                                                        >
                                                            <i className="fa-solid fa-xmark"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                                {editStatus !== "PRESENTE" && (
                                                    <input
                                                        type="text"
                                                        value={editJustificativa}
                                                        onChange={(e) => setEditJustificativa(e.target.value)}
                                                        placeholder="Justificativa..."
                                                        className={styles.edit_obs_input}
                                                        disabled={loadingSave}
                                                    />
                                                )}
                                            </div>
                                        ) : (
                                            <div className={styles.timeline_content}>
                                                <div className={styles.status_row}>
                                                    <span className={`${styles.status_badge} ${statusClass}`}>
                                                        {statusLabel}
                                                    </span>
                                                    <button
                                                        className={styles.btn_edit_trigger}
                                                        onClick={() => handleStartEdit(freq)}
                                                        title="Editar registro"
                                                    >
                                                        <i className="fa-solid fa-pen"></i>
                                                    </button>
                                                </div>
                                                {isJustified && freq.justificativa && (
                                                    <div className={styles.justification_box}>
                                                        <strong>Justificativa:</strong> {freq.justificativa}
                                                    </div>
                                                )}
                                                {!isPresent && !isJustified && freq.justificativa && (
                                                    <div className={styles.justification_box}>
                                                        <strong>Obs:</strong> {freq.justificativa}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Rodapé e Ações */}
                <div className={styles.modal_footer}>
                    <button className={styles.btn_close} onClick={handleClose}>
                        Fechar
                    </button>
                    <button className={styles.btn_manage} onClick={handleNavigate}>
                        Ver Perfil Completo <i className="fa-solid fa-arrow-right-to-bracket"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalAnaliseFrequencia;
