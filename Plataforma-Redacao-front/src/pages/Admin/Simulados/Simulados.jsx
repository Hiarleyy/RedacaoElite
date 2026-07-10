import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./styles.module.css";
import fetchData from "../../../utils/fetchData";
import { useNavigate } from "react-router-dom";
import useUseful from "../../../utils/useUseful";
import Message from "../../../components/Message/Message";
import Pagination from "../../../components/Pagination/Pagination";
import Title from "../../../components/Title/Title";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const Simulados = () => {
  const [turma, setTurma] = useState("");
  const [titulo, setTitulo] = useState("");
  const [dataRealizacao, setDataRealizacao] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [search, setSearch] = useState("");
  const [formMessage, setFormMessage] = useState(null);

  const [TotalSimulados, setTotalSimulados] = useState([]);
  const [turmasDisponiveis, setTurmasDisponiveis] = useState([]);
  const [turmasComSimulado, setTurmasComSimulado] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { getHeaders } = useUseful();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!turma || !titulo.trim()) {
      alert("Selecione uma turma e digite um título para o simulado");
      return;
    }

    try {
      const response = await axios.post(
        `${baseURL}/simulados`,
        {
          turmaId: turma,
          titulo: titulo,
          // Sending only what was originally there to avoid backend errors
        },
        { headers: getHeaders() }
      );

      setFormMessage({
        type: "success",
        text: `Simulado "${response.data.data.titulo}" criado com sucesso.`,
      });

      setTitulo("");
      setTurma("");
      setDataRealizacao("");
      setObservacoes("");
      await getDataSimulados();

      setTimeout(() => setFormMessage(null), 3000);
    } catch (error) {
      console.error("Erro ao registrar simulado", error);
      setFormMessage({
        type: "error",
        text: error.response?.data?.error || "Erro desconhecido.",
      });
    }
  };

  const simuladosFiltrados = TotalSimulados.filter(
    (item) =>
      item.titulo.toLowerCase().includes(search.toLowerCase()) ||
      item.nomeTurma.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSimulados = simuladosFiltrados.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  useEffect(() => {
    const getData = async () => {
      const { getTurmas } = fetchData();
      const response = await getTurmas();
      const options = response.map((item) => ({
        id: item.id,
        nome: item.nome,
      }));
      setTurmasDisponiveis(options);
    };
    getData();
  }, []);

  const handleResultados = (simuladoId) => {
    if (!simuladoId) {
      console.error("ID do simulado está indefinido!");
      return;
    }
    navigate(`/admin/Simulados/${simuladoId}`);
  };

  const getDataSimulados = async () => {
    const { getSimulados, getTurmaById } = fetchData();
    const response = await getSimulados();

    const turmaIdsUnicos = [...new Set(response.map((turma) => turma.turmaId))];
    const turmasCompletas = await Promise.all(
      turmaIdsUnicos.map((id) => getTurmaById(id))
    );

    const turmaMap = {};
    turmasCompletas.forEach((turma) => {
      turmaMap[turma.id] = turma;
    });

    const opctions = response
      .map((item) => ({
        id: item.id,
        titulo: item.titulo,
        data: item.data,
        turmaId: item.turmaId,
        nomeTurma: turmaMap[item.turmaId]?.nome || "Sem nome",
        totalAlunos: turmaMap[item.turmaId]?.usuarios?.length || 0,
        status: "Ativo", // Default visual status
      }))
      .sort((a, b) => new Date(b.data) - new Date(a.data));

    setTotalSimulados(opctions);
    setTurmasComSimulado(turmasCompletas);
  };

  useEffect(() => {
    getDataSimulados();
  }, []);

  const formatarData = (data) => {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-BR");
  };

  return (
    <div className={styles.container}>
      <Title title="Financeiro" />
        <div className={styles.mainLayout}>
          <div className={styles.leftColumn}>
            
            <div className={styles.overviewSection}>
              <h2 className={styles.overviewTitle}>Visão geral dos simulados</h2>
              <div className={styles.overviewGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statHeader}>
                    <div className={styles.iconWrapper}>
                      <i className="fa-solid fa-clipboard-list"></i>
                    </div>
                    <p className={styles.statLabel}>Total de simulados</p>
                  </div>
                  <p className={styles.statValue}>{TotalSimulados.length}</p>
                  <div className={styles.statFooter}>
                    <i className="fa-solid fa-arrow-trend-up trendUp"></i>
                    <span className={styles.trendUp}>+100% este mês</span>
                  </div>
                </div>
                
                <div className={styles.statCard}>
                  <div className={styles.statHeader}>
                    <div className={styles.iconWrapper}>
                      <i className="fa-solid fa-users"></i>
                    </div>
                    <p className={styles.statLabel}>Total de turmas</p>
                  </div>
                  <p className={styles.statValue}>{turmasComSimulado.length}</p>
                  <div className={styles.statFooter}>
                    <i className="fa-solid fa-arrow-trend-up trendUp"></i>
                    <span className={styles.trendUp}>+100% este mês</span>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statHeader}>
                    <div className={styles.iconWrapper}>
                      <i className="fa-solid fa-user"></i>
                    </div>
                    <p className={styles.statLabel}>Total de participantes</p>
                  </div>
                  <p className={styles.statValue}>
                    {TotalSimulados.reduce((acc, curr) => acc + curr.totalAlunos, 0)}
                  </p>
                  <div className={styles.statFooter}>
                    <i className="fa-solid fa-arrow-trend-up trendUp"></i>
                    <span className={styles.trendUp}>+100% este mês</span>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statHeader}>
                    <div className={styles.iconWrapper}>
                      <i className="fa-solid fa-chart-line"></i>
                    </div>
                    <p className={styles.statLabel}>Média geral</p>
                  </div>
                  <p className={styles.statValue}>7,4</p>
                  <div className={styles.statFooter}>
                    <span style={{ color: '#9ba1a6' }}>Desempenho</span>
                    <span className={styles.badgeGood}>Bom</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.filtersBar}>
              <div className={styles.searchInput}>
                <i className="fa-solid fa-magnifying-glass" style={{color: '#9ba1a6'}}></i>
                <input 
                  type="text" 
                  placeholder="Buscar simulado..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select className={styles.filterSelect}>
                <option value="">Todas as turmas</option>
                {turmasDisponiveis.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
              <button className={styles.filterBtn}>
                <i className="fa-solid fa-filter"></i> Mais filtros <i className="fa-solid fa-chevron-down" style={{fontSize: '12px', marginLeft: '4px'}}></i>
              </button>
              <button className={styles.primaryBtn}>
                <i className="fa-solid fa-download"></i> Baixar todas as redações
              </button>
            </div>

            <div className={styles.simuladosList}>
              {currentSimulados.map((item) => (
                <div key={item.id} className={styles.simuladoItem}>
                  <div className={styles.itemIcon}>
                    <i className="fa-regular fa-clipboard"></i>
                  </div>
                  <div className={styles.itemContent}>
                    <div className={styles.itemHeader}>
                      <h3 className={styles.itemTitle}>{item.titulo}</h3>
                      <span className={styles.badgeActive}>{item.status}</span>
                    </div>
                    <div className={styles.itemMeta}>
                      <i className="fa-regular fa-calendar"></i> {formatarData(item.data)} <span style={{margin: '0 8px'}}>|</span> Turma: {item.nomeTurma}
                    </div>
                  </div>
                  <div className={styles.itemActions}>
                    <button className={styles.actionBtn} onClick={() => handleResultados(item.id)}>
                      <i className="fa-solid fa-user-group"></i> {item.totalAlunos} participantes
                    </button>
                    <button className={`${styles.actionBtn} ${styles.actionBtnIcon}`} onClick={() => handleResultados(item.id)}>
                      <i className="fa-solid fa-chevron-down"></i>
                    </button>
                  </div>
                </div>
              ))}
              {currentSimulados.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9ba1a6' }}>
                  Nenhum simulado encontrado.
                </div>
              )}
            </div>

            {simuladosFiltrados.length > itemsPerPage && (
              <div className={styles.pagination}>
                <Pagination
                  currentPage={currentPage}
                  totalItems={simuladosFiltrados.length}
                  itemsPerPage={itemsPerPage}
                  setCurrentPage={setCurrentPage}
                />
              </div>
            )}

          </div>

          <div className={styles.rightColumn}>
            <div className={styles.formContainer}>
              <div className={styles.formHeader}>
                <div className={styles.formHeaderIcon}>
                  <i className="fa-solid fa-clipboard-check"></i>
                </div>
                <div>
                  <h3 className={styles.formHeaderTitle}>Cadastrar simulado</h3>
                  <p className={styles.formHeaderDesc}>Crie um novo simulado para suas turmas.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Título do simulado</label>
                  <input 
                    type="text" 
                    className={styles.formInput} 
                    placeholder="Ex.: Simulado ENEM 2026"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Selecione a turma</label>
                  <select 
                    className={styles.formSelect}
                    value={turma}
                    onChange={(e) => setTurma(e.target.value)}
                    required
                  >
                    <option value="" disabled>Selecione uma turma</option>
                    {turmasDisponiveis.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Data de realização</label>
                  <input 
                    type="date" 
                    className={styles.formInput} 
                    value={dataRealizacao}
                    onChange={(e) => setDataRealizacao(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Observações (opcional)</label>
                  <textarea 
                    className={styles.formTextarea} 
                    placeholder="Adicione informações complementares..."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                  ></textarea>
                </div>

                <button type="submit" className={styles.submitBtn}>
                  Cadastrar Simulado
                </button>

                {formMessage && (
                  <div style={{marginTop: '16px'}}>
                    <Message text={formMessage.text} type={formMessage.type} />
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Simulados;
