import styles from "../Pagamentos/styles.module.css";
import Card from "../../../components/CardPagamento/Card";
import Table from "../../../components/Table/table";
import Title from "../../../components/Title/Title";
import CardDash from "../../../components/CardDash/CardDash";
import { useState, useEffect, useMemo } from "react";
import Input from "../../../components/Input/Input";
import Button from "../../../components/Button/Button";
import { useNavigate } from "react-router-dom";
import fetchData from "../../../utils/fetchData";
import DespesaModal from "../../../components/ModalRegistrarPG/DespesaModal";
import Pagination from "../../../components/Pagination/Pagination";
import useUseful from "../../../utils/useUseful";
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const meses = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

const currentYearVal = new Date().getFullYear();
const anos = [currentYearVal - 1, currentYearVal, currentYearVal + 1];

const Pagamentos = () => {
  const [dataPagamentos, setDataPagamentos] = useState([]);
  const [dataAlunos, setDataAlunos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [modalAlunoId, setModalAlunoId] = useState("");
  const [activeSubTab, setActiveSubTab] = useState("alunos"); // Padrão: alunos
  
  // Limite de itens por página
  const itemsPerPage = 10;

  // Filtros da aba de fluxo geral
  const [generalSearch, setGeneralSearch] = useState("");
  const [generalStatus, setGeneralStatus] = useState("");
  const [generalStartDate, setGeneralStartDate] = useState("");
  const [generalEndDate, setGeneralEndDate] = useState("");
  const [generalCurrentPage, setGeneralCurrentPage] = useState(1);
  
  // Filtros da aba de alunos
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedTurma, setSelectedTurma] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [onlyInadimplentes, setOnlyInadimplentes] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const navigate = useNavigate();
  const { getHeaders } = useUseful();

  const loadData = async () => {
    try {
      const { getPagamentos, getAlunos, getTurmas } = fetchData();
      const [pagamentosResponse, alunosResponse, turmasResponse] = await Promise.all([
        getPagamentos(),
        getAlunos(),
        getTurmas(),
      ]);
      setDataPagamentos(pagamentosResponse || []);
      setDataAlunos(alunosResponse || []);
      setTurmas(turmasResponse || []);
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Resetar páginas ao alterar filtros
  useEffect(() => {
    setGeneralCurrentPage(1);
  }, [generalSearch, generalStatus, generalStartDate, generalEndDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [studentSearch, selectedTurma, selectedMonth, selectedYear, onlyInadimplentes]);

  // Formatadores auxiliares
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  const parseDateLocal = (dateStr) => {
    if (!dateStr) return null;
    if (typeof dateStr === "string" && dateStr.includes("-") && dateStr.length === 10) {
      const [year, month, day] = dateStr.split("-").map(Number);
      return new Date(year, month - 1, day);
    }
    const d = new Date(dateStr);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  // Cálculos do Fluxo de Caixa Geral
  const totalRecebido = dataPagamentos
    .filter((p) => p.status === "ENTRADA")
    .reduce((acc, curr) => acc + curr.valor, 0);

  const totalDespesas = dataPagamentos
    .filter((p) => p.status === "SAÍDA" || p.status === "SAIDA")
    .reduce((acc, curr) => acc + curr.valor, 0);

  const lucro = totalRecebido - totalDespesas;

  const handleResultados = () => {
    console.log("Acesso aos graficos");
    navigate(`/admin/gerenciar-pagamentos`);
  };

  // Filtro da aba Geral (Fluxo de Caixa)
  const pagamentosFiltrados = useMemo(() => {
    let filtered = dataPagamentos;

    if (generalSearch) {
      filtered = filtered.filter((p) =>
        p.tipoDespensa?.toLowerCase().includes(generalSearch.toLowerCase())
      );
    }

    if (generalStatus) {
      filtered = filtered.filter((p) => {
        const normStatus = p.status?.toLowerCase();
        if (generalStatus === "ENTRADA") return normStatus === "entrada";
        if (generalStatus === "SAIDA") return normStatus === "saída" || normStatus === "saida";
        return true;
      });
    }

    if (generalStartDate || generalEndDate) {
      const start = parseDateLocal(generalStartDate);
      const end = parseDateLocal(generalEndDate);

      filtered = filtered.filter((p) => {
        const rawDate = p.dataPagamento;
        const pDate = parseDateLocal(rawDate);
        if (!pDate) return false;

        if (start && pDate < start) return false;
        if (end && pDate > end) return false;

        return true;
      });
    }

    return filtered;
  }, [dataPagamentos, generalSearch, generalStatus, generalStartDate, generalEndDate]);

  // Ordenação descendente por data do fluxo geral
  const sortedGeneralPagamentos = useMemo(() => {
    return [...pagamentosFiltrados].sort(
      (a, b) => new Date(b.dataPagamento || 0) - new Date(a.dataPagamento || 0)
    );
  }, [pagamentosFiltrados]);

  // Paginação fluxo geral
  const paginatedGeneralPagamentos = useMemo(() => {
    const startIndex = (generalCurrentPage - 1) * itemsPerPage;
    return sortedGeneralPagamentos.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedGeneralPagamentos, generalCurrentPage, itemsPerPage]);

  // Obter apenas os alunos (tipoUsuario = STANDARD)
  const filteredAlunosList = useMemo(() => {
    const list = dataAlunos.filter(
      (u) => u.tipoUsuario === "STANDARD" || u.tipoUsuario === "standard"
    );

    if (studentSearch) {
      return list.filter((u) =>
        u.nome?.toLowerCase().includes(studentSearch.toLowerCase())
      );
    }

    if (selectedTurma) {
      return list.filter((u) => u.turmaId === selectedTurma);
    }

    return list;
  }, [dataAlunos, studentSearch, selectedTurma]);

  // Combina lista de alunos com pagamentos do período selecionado
  const combinedAlunos = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return filteredAlunosList.map((aluno) => {
      const userPayments = dataPagamentos.filter((p) => p.usuarioId === aluno.id);

      // Verificação geral de inadimplência (possui qualquer pagamento pendente vencido)
      const isGenerallyInadimplente = userPayments.some((p) => {
        if (p.dataPagamento !== null) return false;
        if (!p.dataVencimento) return false;
        const venc = new Date(p.dataVencimento);
        venc.setHours(0, 0, 0, 0);
        return venc < hoje;
      });

      // Busca pagamento no mês/ano do período selecionado
      const paymentForPeriod = userPayments.find((p) => {
        const dateStr = p.dataVencimento || p.dataPagamento;
        if (!dateStr) return false;
        const d = new Date(dateStr);
        const pMonth = d.getUTCMonth() + 1; // 1-12
        const pYear = d.getUTCFullYear();
        return pMonth === parseInt(selectedMonth) && pYear === parseInt(selectedYear);
      });

      let periodStatus = "Sem Cobrança";
      let periodPayment = null;

      if (paymentForPeriod) {
        periodPayment = paymentForPeriod;
        if (paymentForPeriod.dataPagamento !== null) {
          periodStatus = "Pago";
        } else {
          const venc = new Date(paymentForPeriod.dataVencimento);
          venc.setHours(0, 0, 0, 0);
          if (venc < hoje) {
            periodStatus = "Atrasado";
          } else {
            periodStatus = "Pendente";
          }
        }
      }

      return {
        ...aluno,
        periodStatus,
        periodPayment,
        isGenerallyInadimplente,
      };
    });
  }, [filteredAlunosList, dataPagamentos, selectedMonth, selectedYear]);

  // Filtra por inadimplentes
  const finalAlunos = useMemo(() => {
    if (!onlyInadimplentes) return combinedAlunos;
    return combinedAlunos.filter((u) => u.isGenerallyInadimplente);
  }, [combinedAlunos, onlyInadimplentes]);

  // Paginação de alunos
  const paginatedAlunos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return finalAlunos.slice(startIndex, startIndex + itemsPerPage);
  }, [finalAlunos, currentPage, itemsPerPage]);

  // Estatísticas específicas de alunos
  const studentStats = useMemo(() => {
    const totalStudents = dataAlunos.filter(
      (u) => u.tipoUsuario === "STANDARD" || u.tipoUsuario === "standard"
    ).length;

    const totalInadimplentes = dataAlunos.filter(
      (u) => u.tipoUsuario === "STANDARD" || u.tipoUsuario === "standard"
    ).filter((aluno) => {
      const userPayments = dataPagamentos.filter((p) => p.usuarioId === aluno.id);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      return userPayments.some((p) => {
        if (p.dataPagamento !== null) return false;
        if (!p.dataVencimento) return false;
        const venc = new Date(p.dataVencimento);
        venc.setHours(0, 0, 0, 0);
        return venc < hoje;
      });
    }).length;

    const arrecadado = dataPagamentos
      .filter((p) => {
        if (p.dataPagamento === null) return false;
        const d = new Date(p.dataPagamento);
        const pMonth = d.getUTCMonth() + 1;
        const pYear = d.getUTCFullYear();
        return pMonth === parseInt(selectedMonth) && pYear === parseInt(selectedYear);
      })
      .reduce((sum, p) => sum + p.valor, 0);

    return { totalStudents, totalInadimplentes, arrecadado };
  }, [dataAlunos, dataPagamentos, selectedMonth, selectedYear]);

  const handleConfirmPayment = async (paymentId) => {
    try {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      await axios.put(
        `${baseURL}/pagamentos/${paymentId}`,
        { dataPagamento: today },
        { headers: getHeaders() }
      );
      await loadData();
      alert("Pagamento confirmado com sucesso!");
    } catch (error) {
      console.error("Erro ao confirmar pagamento:", error);
      alert("Erro ao confirmar pagamento. Tente novamente.");
    }
  };

  const handleOpenRegisterModal = (alunoId) => {
    setModalAlunoId(alunoId);
    setIsOpen(true);
  };

  return (
    <div className={styles.container}>
      <Title title="Financeiro" />

      <div className={styles.main_content}>
        <div className={styles.container_pag}>
          <h1>Financeiro</h1>
          <p>Acompanhe pagamentos, receitas, despesas e mensalidades dos alunos</p>
          
          {/* Abas */}
          <div className={styles.tab_buttons}>
            <button
              className={`${styles.tab_button} ${activeSubTab === "alunos" ? styles.active_tab : ""}`}
              onClick={() => setActiveSubTab("alunos")}
            >
              <i className="fa-solid fa-graduation-cap"></i>
              Acompanhamento de Alunos
            </button>
            <button
              className={`${styles.tab_button} ${activeSubTab === "geral" ? styles.active_tab : ""}`}
              onClick={() => setActiveSubTab("geral")}
            >
              <i className="fa-solid fa-cash-register"></i>
              Fluxo de Caixa Geral
            </button>
          </div>

          {activeSubTab === "geral" ? (
            <>
              {/* Cards Fluxo Geral */}
              <div className={styles.CardDashs_container}>
                <CardDash
                  title="Total Recebido"
                  content={"R$ " + totalRecebido.toFixed(2)}
                  titleColor="#ffffff"
                  contentColor="#ffffff"
                  color="#1A1A1A"
                  fontSize="20px"
                  icon={
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M21 19.9999C21 18.2583 19.3304 16.7767 17 16.2275M15 20C15 17.7909 12.3137 16 9 16C5.68629 16 3 17.7909 3 20M15 13C17.2091 13 19 11.2091 19 9C19 6.79086 17.2091 5 15 5M9 13C6.79086 13 5 11.2091 5 9C5 6.79086 6.79086 5 9 5C11.2091 5 13 6.79086 13 9C13 11.2091 11.2091 13 9 13Z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  }
                />
                <CardDash
                  title="Total de Despesa"
                  content={"R$ " + totalDespesas.toFixed(2)}
                  titleColor="#ffffff"
                  contentColor="#ffffff"
                  color="#1A1A1A"
                  fontSize="20px"
                  icon={
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M21 19.9999C21 18.2583 19.3304 16.7767 17 16.2275M15 20C15 17.7909 12.3137 16 9 16C5.68629 16 3 17.7909 3 20M15 13C17.2091 13 19 11.2091 19 9C19 6.79086 17.2091 5 15 5M9 13C6.79086 13 5 11.2091 5 9C5 6.79086 6.79086 5 9 5C11.2091 5 13 6.79086 13 9C13 11.2091 11.2091 13 9 13Z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  }
                />
                <CardDash
                  title="Lucro"
                  content={"R$ " + lucro.toFixed(2)}
                  titleColor="#ffffff"
                  contentColor="#ffffff"
                  color="#1A1A1A"
                  fontSize="20px"
                  icon={
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M21 19.9999C21 18.2583 19.3304 16.7767 17 16.2275M15 20C15 17.7909 12.3137 16 9 16C5.68629 16 3 17.7909 3 20M15 13C17.2091 13 19 11.2091 19 9C19 6.79086 17.2091 5 15 5M9 13C6.79086 13 5 11.2091 5 9C5 6.79086 6.79086 5 9 5C11.2091 5 13 6.79086 13 9C13 11.2091 11.2091 13 9 13Z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  }
                />
              </div>

              {/* Filtros de Fluxo de Caixa Geral */}
              <div className={styles.filters_container}>
                <div className={styles.filter_group} style={{ flex: 2 }}>
                  <label htmlFor="generalSearch">Tipo de Despesa / Descrição</label>
                  <Input
                    id="generalSearch"
                    placeholder="Buscar por descrição..."
                    value={generalSearch}
                    color="#1A1A1A"
                    onChange={(e) => setGeneralSearch(e.target.value)}
                  >
                    <i className="fa-solid fa-magnifying-glass"></i>
                  </Input>
                </div>

                <div className={styles.filter_group}>
                  <label htmlFor="generalStatus">Status</label>
                  <select
                    id="generalStatus"
                    className={styles.select_input}
                    value={generalStatus}
                    onChange={(e) => setGeneralStatus(e.target.value)}
                  >
                    <option value="">Todos</option>
                    <option value="ENTRADA">ENTRADA (Receitas)</option>
                    <option value="SAIDA">SAÍDA (Despesas)</option>
                  </select>
                </div>

                <div className={styles.filter_group}>
                  <label htmlFor="generalStartDate">Data Início</label>
                  <input
                    id="generalStartDate"
                    type="date"
                    className={styles.date_input}
                    value={generalStartDate}
                    onChange={(e) => setGeneralStartDate(e.target.value)}
                  />
                </div>

                <div className={styles.filter_group}>
                  <label htmlFor="generalEndDate">Data Fim</label>
                  <input
                    id="generalEndDate"
                    type="date"
                    className={styles.date_input}
                    value={generalEndDate}
                    onChange={(e) => setGeneralEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Botões de Ação do Fluxo Geral */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "15px" }}>
                <div className={styles.buttons_container}>
                  <Button
                    bg_color="#DA9E00"
                    color="#ffffff"
                    height_size="50px"
                    width_size="100%"
                    padding_sz="10px"
                    onClick={() => handleOpenRegisterModal("")}
                  >
                    <i className="fa-solid fa-plus"></i>
                    Registrar Movimentação
                  </Button>
                  <Button
                    bg_color="#fb8500"
                    color="#ffffff"
                    height_size="50px"
                    width_size="100%"
                    padding_sz="10px"
                    onClick={handleResultados}
                  >
                    <i className="fa-solid fa-chart-line"></i>
                    Análise Gráfica
                  </Button>
                </div>
              </div>

              {/* Tabela do fluxo geral */}
              <div className={styles.container_table}>
                <Table dados={paginatedGeneralPagamentos} />
                <Pagination
                  currentPage={generalCurrentPage}
                  totalItems={pagamentosFiltrados.length}
                  itemsPerPage={itemsPerPage}
                  setCurrentPage={setGeneralCurrentPage}
                  marginTop_size="25px"
                />
              </div>
            </>
          ) : (
            <>
              {/* Cards Acompanhamento Alunos */}
              <div className={styles.student_summary}>
                <div className={`${styles.card_summary} ${styles.success}`}>
                  <div className={styles.card_info}>
                    <h4>Total de Alunos</h4>
                    <p>{studentStats.totalStudents}</p>
                  </div>
                  <div className={styles.card_icon}>
                    <i className="fa-solid fa-user-graduate" style={{ fontSize: "24px" }}></i>
                  </div>
                </div>

                <div className={`${styles.card_summary} ${styles.danger}`}>
                  <div className={styles.card_info}>
                    <h4>Total Inadimplentes</h4>
                    <p>{studentStats.totalInadimplentes}</p>
                  </div>
                  <div className={styles.card_icon}>
                    <i className="fa-solid fa-user-slash" style={{ fontSize: "24px" }}></i>
                  </div>
                </div>

                <div className={`${styles.card_summary} ${styles.warning}`}>
                  <div className={styles.card_info}>
                    <h4>Arrecadado no Período</h4>
                    <p>{formatCurrency(studentStats.arrecadado)}</p>
                  </div>
                  <div className={styles.card_icon}>
                    <i className="fa-solid fa-wallet" style={{ fontSize: "24px" }}></i>
                  </div>
                </div>
              </div>

              {/* Filtros de Alunos */}
              <div className={styles.filters_container}>
                <div className={styles.filter_group} style={{ flex: 2 }}>
                  <label htmlFor="studentSearch">Buscar por Aluno</label>
                  <Input
                    id="studentSearch"
                    placeholder="Digite o nome do aluno..."
                    value={studentSearch}
                    color="#1A1A1A"
                    onChange={(e) => setStudentSearch(e.target.value)}
                  >
                    <i className="fa-solid fa-magnifying-glass"></i>
                  </Input>
                </div>

                <div className={styles.filter_group}>
                  <label htmlFor="selectedTurma">Turma</label>
                  <select
                    id="selectedTurma"
                    className={styles.select_input}
                    value={selectedTurma}
                    onChange={(e) => setSelectedTurma(e.target.value)}
                  >
                    <option value="">Todas as Turmas</option>
                    {turmas.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.filter_group}>
                  <label htmlFor="selectedMonth">Mês de Referência</label>
                  <select
                    id="selectedMonth"
                    className={styles.select_input}
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    {meses.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.filter_group}>
                  <label htmlFor="selectedYear">Ano</label>
                  <select
                    id="selectedYear"
                    className={styles.select_input}
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    {anos.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.filter_group} style={{ minWidth: "160px" }}>
                  <label>Situação Financeira</label>
                  <div 
                    className={styles.checkbox_group}
                    onClick={() => setOnlyInadimplentes(prev => !prev)}
                  >
                    <input
                      type="checkbox"
                      className={styles.checkbox_input}
                      checked={onlyInadimplentes}
                      onChange={() => {}} // Tratado no pai pelo onClick do grupo
                    />
                    <span className={styles.checkbox_label}>Inadimplentes</span>
                  </div>
                </div>
              </div>

              {/* Tabela de Alunos e Situação de Mensalidades */}
              <div className={styles.table_responsive}>
                <table className={styles.payment_table}>
                  <thead>
                    <tr>
                      <th>Aluno</th>
                      <th>Turma</th>
                      <th>Mensalidade Período</th>
                      <th>Vencimento</th>
                      <th>Data de Pagamento</th>
                      <th>Status Período</th>
                      <th>Status Geral</th>
                      <th style={{ textAlign: "center" }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAlunos.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: "center", padding: "30px", color: "#888" }}>
                          Nenhum aluno encontrado para os filtros aplicados.
                        </td>
                      </tr>
                    ) : (
                      paginatedAlunos.map((aluno) => {
                        const hasPayment = aluno.periodPayment !== null;
                        
                        let periodStatusText = aluno.periodStatus;
                        let periodStatusClass = `${styles.badge} ${styles.pendente}`;
                        let periodStatusIcon = "fa-solid fa-circle-minus";
                        
                        if (aluno.periodStatus === "Pago") {
                          periodStatusClass = `${styles.badge} ${styles.pago}`;
                          periodStatusIcon = "fa-solid fa-circle-check";
                        } else if (aluno.periodStatus === "Atrasado") {
                          periodStatusClass = `${styles.badge} ${styles.atrasado}`;
                          periodStatusIcon = "fa-solid fa-circle-exclamation";
                        } else if (aluno.periodStatus === "Sem Cobrança") {
                          periodStatusClass = `${styles.badge}`;
                          periodStatusIcon = "fa-solid fa-circle-question";
                        }

                        const generalStatusText = aluno.isGenerallyInadimplente ? "Inadimplente" : "Em Dia";
                        const generalStatusClass = aluno.isGenerallyInadimplente 
                          ? `${styles.badge} ${styles.atrasado}` 
                          : `${styles.badge} ${styles.pago}`;
                        const generalStatusIcon = aluno.isGenerallyInadimplente 
                          ? "fa-solid fa-triangle-exclamation" 
                          : "fa-solid fa-shield-check";

                        return (
                          <tr key={aluno.id}>
                            <td style={{ fontWeight: 500 }}>{aluno.nome}</td>
                            <td>{aluno.turma?.nome || "Sem Turma"}</td>
                            <td>{hasPayment ? formatCurrency(aluno.periodPayment.valor) : "-"}</td>
                            <td>{hasPayment ? formatDate(aluno.periodPayment.dataVencimento) : "-"}</td>
                            <td>{hasPayment ? formatDate(aluno.periodPayment.dataPagamento) : "-"}</td>
                            <td>
                              <span className={periodStatusClass}>
                                <i className={periodStatusIcon}></i> {periodStatusText}
                              </span>
                            </td>
                            <td>
                              <span className={generalStatusClass}>
                                <i className={generalStatusIcon}></i> {generalStatusText}
                              </span>
                            </td>
                            <td style={{ textAlign: "center" }}>
                              {aluno.periodStatus === "Sem Cobrança" ? (
                                <button
                                  className={`${styles.action_btn} ${styles.register}`}
                                  title="Lançar/Registrar Pagamento"
                                  onClick={() => handleOpenRegisterModal(aluno.id)}
                                >
                                  <i className="fa-solid fa-plus"></i> Registrar
                                </button>
                              ) : (aluno.periodStatus === "Pendente" || aluno.periodStatus === "Atrasado") ? (
                                <button
                                  className={`${styles.action_btn} ${styles.confirm}`}
                                  title="Confirmar Recebimento"
                                  onClick={() => handleConfirmPayment(aluno.periodPayment.id)}
                                >
                                  <i className="fa-solid fa-check"></i> Confirmar
                                </button>
                              ) : (
                                <span style={{ color: "#10b981", fontSize: "14px", fontWeight: 500 }}>
                                  <i className="fa-solid fa-circle-check"></i> Recebido
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={currentPage}
                totalItems={finalAlunos.length}
                itemsPerPage={itemsPerPage}
                setCurrentPage={setCurrentPage}
                marginTop_size="25px"
              />
            </>
          )}

          <DespesaModal
            isOpen={isOpen}
            onClose={() => {
              setIsOpen(false);
              loadData();
            }}
            initialAlunoId={modalAlunoId}
          />
        </div>
      </div>
    </div>
  );
};

export default Pagamentos;
