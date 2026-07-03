import { useState, useEffect, useMemo } from "react";
import styles from "./styles.module.css";
import Message from "../Message/Message";
import fetchData from "../../utils/fetchData";
import defaultProfilePicture from "../../images/Defalult_profile_picture.jpg";

const ModalRegistrarFrequencia = ({ isOpen, onClose, turmas = [], defaultTurmaId, onSaveSuccess }) => {
    const [modalTurma, setModalTurma] = useState("");
    const [modalStudents, setModalStudents] = useState([]); // Alunos buscados do backend
    const [attendance, setAttendance] = useState({});
    const [modalMessage, setModalMessage] = useState(null);
    const [loadingStudents, setLoadingStudents] = useState(false); // Loading da busca de alunos
    const [loadingSave, setLoadingSave] = useState(false); // Loading do salvamento

    // 1. Sincroniza a turma padrão ao abrir o modal
    useEffect(() => {
        if (isOpen) {
            setModalTurma(defaultTurmaId || "");
            setModalStudents([]);
            setAttendance({});
            setModalMessage(null);
        }
    }, [isOpen, defaultTurmaId]);

    // 2. BUSCA OS ALUNOS NO BACKEND SEMPRE QUE A TURMA MUDAR
    useEffect(() => {
        async function fetchStudentsByClass() {
            if (!modalTurma) {
                setModalStudents([]);
                return;
            }

            setLoadingStudents(true);
            setModalMessage(null);
            try {
                const { getTurmaById } = fetchData();

                const dadosAlunos = await getTurmaById(modalTurma);

                const alunosTotais = dadosAlunos?.usuarios || [];

                setModalStudents(alunosTotais);
            } catch (error) {
                console.error("Erro ao buscar alunos da turma:", error);
                setModalStudents([]);
                setModalMessage({
                    type: "error",
                    text: "Não foi possível carregar os alunos desta turma."
                });
            } finally {
                setLoadingStudents(false);
            }
        }

        if (isOpen) {
            fetchStudentsByClass();
        }
    }, [modalTurma, isOpen]);

    // 3. Inicializa o estado de presença para os alunos carregados
    useEffect(() => {
        if (modalStudents.length > 0) {
            const initial = {};
            modalStudents.forEach(student => {
                initial[student.id] = { status: "presente", obs: "" };
            });
            setAttendance(initial);
        } else {
            setAttendance({});
        }
    }, [modalStudents]);

    // Pega o nome do professor logado de forma segura
    const professorName = useMemo(() => {
        const data = localStorage.getItem("user_access_data");
        if (data) {
            try {
                const parsed = JSON.parse(data);
                return parsed.nome || "Daniel Vieira";
            } catch (e) {
                return "Daniel Vieira";
            }
        }
        return "Daniel Vieira";
    }, []);

    const handleStatusChange = (studentId, status) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                status,
                obs: status === "presente" ? "" : (prev[studentId]?.obs || "")
            }
        }));
    };

    const handleObsChange = (studentId, obs) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], obs }
        }));
    };

    const handleMarkAllPresent = () => {
        const updated = {};
        modalStudents.forEach(a => {
            updated[a.id] = { status: "presente", obs: "" };
        });
        setAttendance(updated);
    };

    const handleMarkAllAbsent = () => {
        const updated = {};
        modalStudents.forEach(a => {
            updated[a.id] = { status: "ausente", obs: "Falta não justificada" };
        });
        setAttendance(updated);
    };

    const handleSaveAttendance = async () => {
        setLoadingSave(true);
        setModalMessage(null);
        try {
            const { createFrequencia } = fetchData();

            const requests = modalStudents.map(student => {
                const info = attendance[student.id] || { status: "presente", obs: "" };
                let dbStatus = "PRESENTE";
                if (info.status === "ausente") {
                    dbStatus = info.obs ? "JUSTIFICADO" : "FALTOU";
                }

                // Envia a data local (Brasil) para evitar problema de fuso horário no banco
                const hoje = new Date();
                const dataLocal = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;

                return createFrequencia({
                    usuarioId: student.id,
                    turmaId: modalTurma,
                    status: dbStatus,
                    justificativa: info.obs || "",
                    data: dataLocal
                });
            });

            await Promise.all(requests);
            setModalMessage({ type: "success", text: "Chamada registrada com sucesso!" });

            // Aguarda brevemente para mostrar a mensagem de sucesso e então
            // chama onSaveSuccess que é responsável por fechar o modal e recarregar os dados
            setTimeout(() => {
                if (onSaveSuccess) onSaveSuccess();
            }, 1500);
        } catch (error) {
            console.error("Erro ao registrar chamadas:", error);
            setModalMessage({
                type: "error",
                text: error.response?.data?.message || "Erro ao salvar a chamada."
            });
        } finally {
            setLoadingSave(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modal_overlay}>
            <div className={styles.modal_content}>
                <button className={styles.close_modal} onClick={onClose}>
                    <i className="fa-solid fa-xmark"></i>
                </button>

                <h2 className={styles.modal_title}>LANÇAMENTO DE CHAMADA</h2>

                <div className={styles.modal_meta_row}>
                    <div className={styles.meta_item}>
                        <strong>Turma:</strong>
                        <select
                            value={modalTurma}
                            onChange={(e) => setModalTurma(e.target.value)}
                            className={styles.modal_select}
                            disabled={loadingSave || loadingStudents}
                        >
                            <option value="">Selecione uma turma...</option>
                            {turmas.map(t => (
                                <option key={t.id} value={t.id}>{t.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.meta_item}>
                        <strong>Disciplina:</strong> <span>Redação</span>
                    </div>
                    <div className={styles.meta_item}>
                        <strong>Professor:</strong> <span>{professorName}</span>
                    </div>
                    <div className={styles.meta_item}>
                        <strong>Data:</strong> <span>{new Date().toLocaleDateString('pt-BR')}</span>
                    </div>
                </div>

                {modalMessage && (
                    <Message text={modalMessage.text} type={modalMessage.type} marginTop="10px" />
                )}

                <div className={styles.modal_table_wrapper}>
                    <table className={styles.modal_table}>
                        <thead>
                            <tr>
                                <th style={{ width: '50px' }}>#</th>
                                <th>Aluno</th>
                                <th>Status</th>
                                <th>Observação</th>
                                <th style={{ width: '50px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingStudents ? (
                                <tr>
                                    <td colSpan="5" className={styles.empty_table_message}>
                                        <i className="fa-solid fa-spinner fa-spin"></i> Buscando alunos da turma...
                                    </td>
                                </tr>
                            ) : modalStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className={styles.empty_table_message}>
                                        {modalTurma ? "Nenhum aluno cadastrado nesta turma." : "Selecione uma turma para realizar a chamada."}
                                    </td>
                                </tr>
                            ) : (
                                modalStudents.map((aluno, index) => {
                                    const statusInfo = attendance[aluno.id] || { status: 'presente', obs: '' };
                                    const isPresent = statusInfo.status === 'presente';
                                    return (
                                        <tr key={aluno.id}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <div className={styles.student_cell}>
                                                    <img
                                                        src={defaultProfilePicture}
                                                        alt={aluno.nome}
                                                        className={styles.student_avatar}
                                                    />
                                                    <span>{aluno.nome}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <select
                                                    value={statusInfo.status}
                                                    onChange={(e) => handleStatusChange(aluno.id, e.target.value)}
                                                    className={`${styles.status_select} ${isPresent ? styles.status_presente : styles.status_ausente}`}
                                                    disabled={loadingSave}
                                                >
                                                    <option value="presente">✔️ Presente</option>
                                                    <option value="ausente">❌ Ausente</option>
                                                </select>
                                            </td>
                                            <td>
                                                {!isPresent ? (
                                                    <input
                                                        type="text"
                                                        placeholder="Justificativa..."
                                                        value={statusInfo.obs || ''}
                                                        onChange={(e) => handleObsChange(aluno.id, e.target.value)}
                                                        className={styles.obs_input}
                                                        disabled={loadingSave}
                                                    />
                                                ) : (
                                                    <span className={styles.obs_placeholder}>-</span>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <i className={`fa-regular fa-comment-dots ${styles.comment_icon}`}></i>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className={styles.modal_footer}>
                    <div className={styles.footer_left_btns}>
                        <button
                            className={styles.mark_all_present}
                            onClick={handleMarkAllPresent}
                            disabled={modalStudents.length === 0 || loadingSave || loadingStudents}
                        >
                            <i className="fa-regular fa-circle-check"></i> Marcar todos como presentes
                        </button>
                        <button
                            className={styles.mark_all_absent}
                            onClick={handleMarkAllAbsent}
                            disabled={modalStudents.length === 0 || loadingSave || loadingStudents}
                        >
                            <i className="fa-regular fa-circle-xmark"></i> Marcar todos como ausentes
                        </button>
                    </div>
                    <button
                        className={styles.save_attendance}
                        onClick={handleSaveAttendance}
                        disabled={modalStudents.length === 0 || modalMessage !== null || loadingSave || loadingStudents}
                    >
                        {loadingSave ? "Salvando..." : "Salvar chamada"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalRegistrarFrequencia;