import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";
import Title from "../../../components/Title/Title";
import Message from "../../../components/Message/Message";
import fetchData from "../../../utils/fetchData";
import defaultProfilePicture from "../../../images/Defalult_profile_picture.jpg";
import ModalRegistrarFrequencia from "../../../components/ModalRegistrarFrequencia/ModalRegistrarFrequencia";
import ModalAnaliseFrequencia from "../../../components/ModalAnaliseFrequencia/ModalAnaliseFrequencia";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const getFirstDayOfMonthString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}-01`;
};

const FrequenciaAlunos = () => {
    const navigate = useNavigate();
    const [turmas, setTurmas] = useState([]);
    const [alunos, setAlunos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [frequencias, setFrequencias] = useState([]);

    const [nomeInput, setNomeInput] = useState("");
    const [turmaInput, setTurmaInput] = useState("todos");
    const [dataInicioInput, setDataInicioInput] = useState(getFirstDayOfMonthString());
    const [dataFimInput, setDataFimInput] = useState(getTodayDateString());

    const [appliedFilters, setAppliedFilters] = useState({
        nome: "",
        turma: "todos",
        dataInicio: getFirstDayOfMonthString(),
        dataFim: getTodayDateString()
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Função centralizada para recarregar frequências do backend
    const reloadFrequencias = async () => {
        try {
            const { getFrequencias } = fetchData();
            const frequenciaData = await getFrequencias();
            setFrequencias(frequenciaData || []);
        } catch (e) {
            console.error("Erro ao recarregar frequências:", e);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const { getTurmas, getAlunos, getFrequencias } = fetchData();
                const [turmasData, alunosData, frequenciasData] = await Promise.all([
                    getTurmas(),
                    getAlunos(),
                    getFrequencias()
                ]);
                setTurmas(turmasData || []);
                setAlunos(alunosData || []);
                setFrequencias(frequenciasData || []);
            } catch (err) {
                console.error("Erro ao buscar dados para frequência:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Extrai a data local (YYYY-MM-DD) de uma string ISO, respeitando o timezone do browser
    const getLocalDateStr = (isoString) => {
        const d = new Date(isoString);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    // Calculate total classes and realized classes from database records
    const dbClassesCount = useMemo(() => {
        if (!frequencias || frequencias.length === 0) {
            return {
                total: 0,
                realizadas: 0
            };
        }

        // Filter frequencies by class and period
        const filteredFreqs = frequencias.filter(f => {
            if (appliedFilters.turma !== "todos" && String(f.turmaId) !== String(appliedFilters.turma)) {
                return false;
            }

            // Usa data local para evitar bug de timezone
            const dataFreqStr = getLocalDateStr(f.data);
            return dataFreqStr >= appliedFilters.dataInicio && dataFreqStr <= appliedFilters.dataFim;
        });

        // Get unique dates
        const uniqueDates = new Set(filteredFreqs.map(f => getLocalDateStr(f.data)));

        return {
            total: uniqueDates.size,
            realizadas: uniqueDates.size
        };
    }, [frequencias, appliedFilters]);

    // Get real frequency stats for a student based on database records
    const getStudentStats = (aluno) => {
        if (!frequencias || frequencias.length === 0) {
            return {
                frequencia: 0,
                presencias: 0,
                ausencias: 0
            };
        }

        // Filter frequency records for this specific student in the selected period
        const studentFrequencias = frequencias.filter(f => {
            const isSameStudent = String(f.usuarioId) === String(aluno.id);
            if (!isSameStudent) return false;

            // Usa data local para evitar bug de timezone
            const dataFreqStr = getLocalDateStr(f.data);
            return dataFreqStr >= appliedFilters.dataInicio && dataFreqStr <= appliedFilters.dataFim;
        });

        const total = studentFrequencias.length;
        if (total === 0) {
            return {
                frequencia: 0,
                presencias: 0,
                ausencias: 0
            };
        }

        const presencias = studentFrequencias.filter(f => f.status === "PRESENTE" || f.status === "JUSTIFICADO").length;
        const ausencias = studentFrequencias.filter(f => f.status === "FALTOU").length;
        const actualFreq = Math.round((presencias / total) * 100);

        return {
            frequencia: actualFreq,
            presencias,
            ausencias
        };
    };

    // Filter students based on applied filters
    const filteredStudents = useMemo(() => {
        return alunos.filter((aluno) => {
            // Filter by name
            if (appliedFilters.nome && !aluno.nome.toLowerCase().includes(appliedFilters.nome.toLowerCase())) {
                return false;
            }
            // Filter by class (turma)
            if (appliedFilters.turma !== "todos" && String(aluno.turmaId) !== String(appliedFilters.turma)) {
                return false;
            }
            return true;
        });
    }, [alunos, appliedFilters]);

    // Students belonging to the selected class (or all students if 'todos' is selected)
    const classStudents = useMemo(() => {
        if (appliedFilters.turma === "todos") {
            return alunos;
        }
        return alunos.filter((aluno) => String(aluno.turmaId) === String(appliedFilters.turma));
    }, [alunos, appliedFilters.turma]);

    // Calculate active stats for the selected class (or general if 'todos' is selected)
    const activeStats = useMemo(() => {
        if (alunos.length === 0) {
            return {
                frequenciaMedia: 0,
                totalPresencas: 0,
                totalAusencias: 0,
                totalAlunos: 0
            };
        }
        if (classStudents.length === 0) {
            return {
                frequenciaMedia: 0,
                totalPresencas: 0,
                totalAusencias: 0,
                totalAlunos: 0
            };
        }
        let sumFreq = 0;
        let sumPres = 0;
        let sumAus = 0;
        classStudents.forEach((student) => {
            const stats = getStudentStats(student);
            sumFreq += stats.frequencia;
            sumPres += stats.presencias;
            sumAus += stats.ausencias;
        });
        return {
            frequenciaMedia: Math.round(sumFreq / classStudents.length),
            totalPresencas: sumPres,
            totalAusencias: sumAus,
            totalAlunos: classStudents.length
        };
    }, [alunos, classStudents, frequencias, appliedFilters]);






    // Calculate aggregated stats for filtered students (Visão da Turma)
    const classStats = useMemo(() => {
        if (filteredStudents.length === 0) {
            return {
                frequenciaMedia: 0,
                totalPresencas: 0,
                totalAusencias: 0
            };
        }
        let sumFreq = 0;
        let sumPres = 0;
        let sumAus = 0;
        filteredStudents.forEach((student) => {
            const stats = getStudentStats(student);
            sumFreq += stats.frequencia;
            sumPres += stats.presencias;
            sumAus += stats.ausencias;
        });
        return {
            frequenciaMedia: Math.round(sumFreq / filteredStudents.length),
            totalPresencas: sumPres,
            totalAusencias: sumAus
        };
    }, [filteredStudents, frequencias, appliedFilters]);

    // Name of the selected turma
    const selectedTurmaName = useMemo(() => {
        if (appliedFilters.turma === "todos") return "TODAS";
        const found = turmas.find(t => String(t.id) === String(appliedFilters.turma));
        return found ? found.nome.toUpperCase() : "TURMA SELECIONADA";
    }, [appliedFilters.turma, turmas]);


    const handleBuscar = () => {
        setAppliedFilters({
            nome: nomeInput,
            turma: turmaInput,
            dataInicio: dataInicioInput,
            dataFim: dataFimInput
        });
    };
    

    return (
        <div className={styles.container}>
            <Title title="Frequência dos Alunos" /> 

            <div className={styles.content_wrapper}>

            <div className={styles.cards_container}>
                {/* CARD 1: FREQUÊNCIA */}
                <div className={styles.card}>
                    <div className={styles.card_header}>
                        <span className={`${styles.card_title} ${styles.yellow}`}>
                            {appliedFilters.turma === "todos" ? "FREQUÊNCIA GERAL" : "FREQUÊNCIA DA TURMA"}
                        </span>
                        <div className={styles.icon_right}>
                            <svg width="42" height="28" viewBox="0 0 42 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 24 L10 17 L18 23 L28 8 L34 14 L40 3" stroke="#FFA000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>
                    <div className={styles.card_body}>
                        <div className={styles.card_value}>{activeStats.frequenciaMedia}%</div>
                    </div>
                    <div className={styles.card_footer}>
                        <p className={styles.card_desc}>
                            {appliedFilters.turma === "todos" ? "Média geral das turmas" : "Média de frequência da turma"}
                        </p>
                        <span className={styles.growth}>
                            <i className="fa-solid fa-arrow-up"></i> 7% em relação ao mês anterior
                        </span>
                    </div>
                </div>

                {/* CARD 2: AULAS REALIZADAS */}
                <div className={styles.card}>
                    <div className={styles.card_header}>
                        <span className={styles.card_title}>AULAS REALIZADAS</span>
                    </div>
                    <div className={styles.card_body}>
                        <div className={styles.card_value}>
                            {dbClassesCount.realizadas} <span className={styles.subvalue}>de {dbClassesCount.total}</span>
                        </div>
                    </div>
                    <div className={styles.card_footer}>
                        <p className={styles.card_desc}>
                            <i className={`fa-solid fa-calendar-days ${styles.desc_icon_yellow}`}></i> Total de aulas no período
                        </p>
                    </div>
                </div>

                {/* CARD 3: PRESENÇAS */}
                <div className={styles.card}>
                    <div className={styles.card_header}>
                        <span className={styles.card_title}>PRESENÇAS</span>
                        <div className={styles.icon_right}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="#00C853" strokeWidth="2"/>
                                <path d="M8 12L11 15L16 9" stroke="#00C853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>
                    <div className={styles.card_body}>
                        <div className={styles.card_value}>{activeStats.totalPresencas.toLocaleString()}</div>
                    </div>
                    <div className={styles.card_footer}>
                        <p className={styles.card_desc}>
                            <i className={`fa-regular fa-circle-check ${styles.desc_icon_green}`}></i> Total de presenças
                        </p>
                    </div>
                </div>

                {/* CARD 4: AUSÊNCIAS */}
                <div className={styles.card}>
                    <div className={styles.card_header}>
                        <span className={styles.card_title}>AUSÊNCIAS</span>
                        <div className={styles.icon_right}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="#D50000" strokeWidth="2"/>
                                <path d="M7 12H17" stroke="#D50000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>
                    <div className={styles.card_body}>
                        <div className={styles.card_value}>{activeStats.totalAusencias.toLocaleString()}</div>
                    </div>
                    <div className={styles.card_footer}>
                        <p className={styles.card_desc}>
                            <i className={`fa-regular fa-circle-xmark ${styles.desc_icon_orange}`}></i> Total de ausências
                        </p>
                    </div>
                </div>

                {/* CARD 5: ALUNOS ATIVOS */}
                <div className={styles.card}>
                    <div className={styles.card_header}>
                        <span className={styles.card_title}>ALUNOS ATIVOS</span>
                        <div className={styles.icon_right}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFA000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                    </div>
                    <div className={styles.card_body}>
                        <div className={styles.card_value}>{classStudents.length}</div>
                    </div>
                    <div className={styles.card_footer}>
                        <p className={styles.card_desc}>
                            <i className={`fa-solid fa-circle ${styles.desc_icon_orange_dot}`}></i> Alunos matriculados
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className={styles.filters_container}>
                <div className={styles.filter}>
                    <label className={styles.filter_label} htmlFor="nome">PESQUISAR O NOME</label>
                    <input 
                        className={styles.filter_input} 
                        type="text" 
                        id="nome" 
                        placeholder="Pesquise por nome..." 
                        value={nomeInput}
                        onChange={(e) => setNomeInput(e.target.value)}
                    />
                </div>

                <div className={styles.filter}>
                    <label className={styles.filter_label} htmlFor="class">TURMA</label>
                    <div className={styles.select_container}>
                        <select 
                            id="class" 
                            className={styles.filter_input}
                            value={turmaInput}
                            onChange={(e) => setTurmaInput(e.target.value)}
                        >
                            <option value="todos">TODOS</option>
                            {turmas.map((t) => (
                                <option key={t.id} value={t.id}>{t.nome.toUpperCase()}</option>
                            ))}
                        </select>
                        <div className={styles.select_arrow}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 6L8 10L12 6" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className={`${styles.filter} ${styles.filter_period}`}>
                    <label className={styles.filter_label} htmlFor="date">PERÍODO</label>
                    <div className={styles.date_container}>
                        <input 
                            className={styles.date_input} 
                            type="date" 
                            value={dataInicioInput}
                            onChange={(e) => setDataInicioInput(e.target.value)}
                        />
                        <span className={styles.date_separator}>a</span>
                        <input 
                            className={styles.date_input} 
                            type="date" 
                            value={dataFimInput}
                            onChange={(e) => setDataFimInput(e.target.value)}
                        />
                    </div>
                </div>

                <button className={styles.search_btn} onClick={handleBuscar}>
                    <i className="fa-solid fa-magnifying-glass"></i> BUSCAR
                </button>
            </div>

            {/* Visão da Turma Section */}
            <div className={styles.class_vision_container}>
                <div className={styles.vision_header}>
                    <h2 className={styles.vision_title}>VISÃO DA TURMA - {selectedTurmaName}</h2>
                    <button className={styles.launch_btn} onClick={() => setIsModalOpen(true)}>
                        <i className="fa-solid fa-clipboard-user"></i> LANÇAR CHAMADA
                    </button>
                </div>
                
                <div className={styles.vision_stats_row}>
                    {/* Class Stats Card 1: Frequência da Turma */}
                    <div className={styles.vision_stat_card}>
                        <div className={styles.stat_card_left}>
                            <span className={styles.stat_card_title}>Frequência da turma</span>
                            <div className={styles.radial_container}>
                                <svg width="70" height="70" viewBox="0 0 70 70">
                                    <circle cx="35" cy="35" r="28" fill="none" stroke="#222" strokeWidth="5"/>
                                    <circle 
                                        cx="35" 
                                        cy="35" 
                                        r="28" 
                                        fill="none" 
                                        stroke="#4CAF50" 
                                        strokeWidth="5"
                                        strokeDasharray="175.9"
                                        strokeDashoffset={175.9 * (1 - classStats.frequenciaMedia / 100)}
                                        strokeLinecap="round"
                                        transform="rotate(-90 35 35)"
                                    />
                                    <text x="35" y="40" fill="#FFF" fontSize="12" fontWeight="bold" textAnchor="middle">
                                        {classStats.frequenciaMedia}%
                                    </text>
                                </svg>
                            </div>
                            <span className={styles.vision_growth}>
                                <i className="fa-solid fa-arrow-up"></i> 6% em relação ao mês anterior
                            </span>
                        </div>
                    </div>

                    {/* Class Stats Card 2: Total de Presenças */}
                    <div className={styles.vision_stat_card}>
                        <div className={styles.stat_card_left}>
                            <span className={styles.stat_card_title}>Total de Presenças</span>
                            <div className={styles.stat_numeric_value_container}>
                                <span className={`${styles.stat_numeric_value} ${styles.green}`}>
                                    {classStats.totalPresencas.toLocaleString()}
                                </span>
                            </div>
                            <span className={styles.stat_card_subtext}>
                                <i className="fa-regular fa-circle-check" style={{ color: "#00E676" }}></i> Presenças registradas
                            </span>
                        </div>
                    </div>

                    {/* Class Stats Card 3: Total de Ausências */}
                    <div className={styles.vision_stat_card}>
                        <div className={styles.stat_card_left}>
                            <span className={styles.stat_card_title}>Total de Ausências</span>
                            <div className={styles.stat_numeric_value_container}>
                                <span className={`${styles.stat_numeric_value} ${styles.red}`}>
                                    {classStats.totalAusencias.toLocaleString()}
                                </span>
                            </div>
                            <span className={styles.stat_card_subtext}>
                                <i className="fa-regular fa-circle-xmark" style={{ color: "#FF1744" }}></i> Ausências registradas
                            </span>
                        </div>
                    </div>
                </div>

                {/* Table of Students */}
                <div className={styles.table_wrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th style={{ width: '50px' }}>#</th>
                                <th>Aluno</th>
                                <th>Frequência</th>
                                <th>Presenças</th>
                                <th>Ausências</th>
                                <th style={{ textAlign: 'center' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className={styles.empty_table_message}>
                                        {loading ? "Carregando dados..." : "Nenhum aluno encontrado para os filtros selecionados."}
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((aluno, index) => {
                                    const stats = getStudentStats(aluno);
                                    return (
                                        <tr key={aluno.id}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <div className={styles.student_cell}>
                                                    <img 
                                                        src={aluno.caminho ? `${baseURL}/usuarios/${aluno.id}/profile-image` : defaultProfilePicture} 
                                                        alt={aluno.nome} 
                                                        className={styles.student_avatar} 
                                                    />
                                                    <span className={aluno.nome.toLowerCase().includes("daniel") ? styles.highlighted_name : ""}>
                                                        {aluno.nome}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.freq_cell}>
                                                    <span className={styles.freq_percent}>{stats.frequencia}%</span>
                                                    <div className={styles.progress_container}>
                                                        <div 
                                                            className={styles.progress_bar} 
                                                            style={{ width: `${stats.frequencia}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{stats.presencias}</td>
                                            <td>{stats.ausencias}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button 
                                                    className={styles.action_btn}
                                                    onClick={() => {
                                                        setSelectedStudent(aluno);
                                                        setIsAnalysisModalOpen(true);
                                                    }}
                                                    title="Visualizar Aluno"
                                                >
                                                    <i className="fa-solid fa-eye"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className={styles.vision_footer}>
                    <button className={styles.report_btn} onClick={() => window.print()}>
                        Ver relatório completo <i className="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>
            </div>

            {/* LAUNCH ATTENDANCE MODAL */}
            {isModalOpen && (
                <ModalRegistrarFrequencia 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    turmas={turmas}
                    alunos={alunos}
                    defaultTurmaId={turmaInput !== "todos" ? turmaInput : ""}
                    onSaveSuccess={async () => {
                        setIsModalOpen(false);
                        await reloadFrequencias();
                    }}
                />
            )}

            {/* MODAL DE ANÁLISE DE FREQUÊNCIA */}
            {isAnalysisModalOpen && (
                <ModalAnaliseFrequencia 
                    isOpen={isAnalysisModalOpen}
                    onClose={() => {
                        setIsAnalysisModalOpen(false);
                        setSelectedStudent(null);
                    }}
                    aluno={selectedStudent}
                    frequencias={frequencias}
                    appliedFilters={appliedFilters}
                    turmas={turmas}
                    onUpdateSuccess={reloadFrequencias}
                />
            )}
        </div>
    );
};

export default FrequenciaAlunos;