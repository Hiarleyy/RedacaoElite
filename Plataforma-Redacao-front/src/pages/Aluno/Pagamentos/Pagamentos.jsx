import React, { useState, useEffect, useMemo } from "react";
import styles from "./styles.module.css";
import Title from "../../../components/Title/Title";
import fetchData from "../../../utils/fetchData";
import Loading from "../../../components/Loading/Loading";

const AlunoPagamentos = () => {
  const [loading, setLoading] = useState(true);
  const [pagamentos, setPagamentos] = useState([]);
  const [alunoInfo, setAlunoInfo] = useState(null);
  const [activeTab, setActiveTab] = useState("pendentes"); // "pendentes" ou "historico"

  const getAlunoId = () => {
    const data = localStorage.getItem("user_access_data");
    if (!data) return null;
    try {
      const { id } = JSON.parse(data);
      return id;
    } catch (e) {
      console.error("Erro ao analisar dados do aluno:", e);
      return null;
    }
  };

  useEffect(() => {
    const loadPagamentos = async () => {
      const alunoId = getAlunoId();
      if (!alunoId) {
        setLoading(false);
        return;
      }
      try {
        const { getPagamentosByUsuarioId, getAlunoById } = fetchData();
        const [pagamentosData, alunoData] = await Promise.all([
          getPagamentosByUsuarioId(alunoId),
          getAlunoById(alunoId)
        ]);
        setPagamentos(pagamentosData || []);
        setAlunoInfo(alunoData || null);
      } catch (error) {
        console.error("Erro ao buscar pagamentos do aluno:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPagamentos();
  }, []);

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

  // Verifica se existe algum vencido
  const hoje = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Separação de pagamentos
  const pagos = useMemo(() => {
    return pagamentos
      .filter((p) => p.dataPagamento !== null)
      .sort((a, b) => new Date(b.dataPagamento) - new Date(a.dataPagamento));
  }, [pagamentos]);

  const pendentes = useMemo(() => {
    const list = pagamentos
      .filter((p) => p.dataPagamento === null)
      .sort((a, b) => new Date(a.dataVencimento) - new Date(b.dataVencimento));

    if (list.length === 0) {
      const diaVenc = alunoInfo?.matricula?.diaVencimento || alunoInfo?.diaVencimentoPadrao;
      if (diaVenc) {
        const day = parseInt(diaVenc);
        if (!isNaN(day)) {
          const today = new Date();
          let year = today.getFullYear();
          let month = today.getMonth();

          if (today.getDate() > day) {
            month += 1;
            if (month > 11) {
              month = 0;
              year += 1;
            }
          }

          const nextPaymentDate = new Date(year, month, day, 12, 0, 0);
          list.push({
            id: "virtual-next",
            tipoDespensa: "Mensalidade Elite",
            dataVencimento: nextPaymentDate.toISOString(),
            valor: alunoInfo?.valorMensalidadePadrao || 0.0,
            status: "ENTRADA"
          });
        }
      }
    }
    return list;
  }, [pagamentos, alunoInfo]);

  const temAtrasado = useMemo(() => {
    return pendentes.some((p) => {
      if (!p.dataVencimento) return false;
      const vencimento = new Date(p.dataVencimento);
      vencimento.setHours(0, 0, 0, 0);
      return vencimento < hoje;
    });
  }, [pendentes, hoje]);

  // Próximo vencimento (calculado a partir dos pendentes ou obtido da matrícula)
  let proximoPgData = null;
  let proximoPgValor = null;

  const diaVencMatricula = alunoInfo?.matricula?.diaVencimento || alunoInfo?.diaVencimentoPadrao;

  if (pendentes.length > 0) {
    proximoPgData = formatDate(pendentes[0].dataVencimento);
    proximoPgValor = formatCurrency(pendentes[0].valor);
  } else if (diaVencMatricula) {
    proximoPgData = `Até dia ${diaVencMatricula}`;
    if (alunoInfo?.valorMensalidadePadrao) {
      proximoPgValor = formatCurrency(alunoInfo.valorMensalidadePadrao);
    }
  }

  // Total pago
  const totalPago = pagos.reduce((sum, p) => sum + p.valor, 0);

  // Status geral do aluno
  let statusGeral = { text: "Em Dia", className: styles.success, icon: "fa-solid fa-circle-check" };
  if (temAtrasado) {
    statusGeral = { text: "Atrasado", className: styles.danger, icon: "fa-solid fa-circle-exclamation" };
  } else if (pendentes.length > 0) {
    statusGeral = { text: "Pendente", className: styles.warning, icon: "fa-solid fa-circle-minus" };
  }

  return (
    <div className={styles.container}>
      <Title title="Pagamentos" />

      <div className={styles.main_content}>
        {loading ? (
          <div className={styles.loading_container}>
            <Loading size="60px" />
          </div>
        ) : (
          <>
            {/* Dashboard Financeiro */}
            <div className={styles.dashboard_summary}>
              <div className={`${styles.card_summary} ${statusGeral.className}`}>
                <div className={styles.card_info}>
                  <h4>Status Financeiro</h4>
                  <p>{statusGeral.text}</p>
                </div>
                <div className={styles.card_icon}>
                  <i className={statusGeral.icon} style={{ fontSize: "24px" }}></i>
                </div>
              </div>

              <div className={`${styles.card_summary} ${styles.success}`}>
                <div className={styles.card_info}>
                  <h4>Total Investido</h4>
                  <p>{formatCurrency(totalPago)}</p>
                </div>
                <div className={styles.card_icon}>
                  <i className="fa-solid fa-wallet" style={{ fontSize: "24px" }}></i>
                </div>
              </div>

              <div className={`${styles.card_summary} ${temAtrasado ? styles.danger : styles.warning}`}>
                <div className={styles.card_info}>
                  <h4>Próximo Vencimento</h4>
                  <p>{proximoPgData ? proximoPgData : "Nenhum"}</p>
                  {proximoPgValor && (
                    <span style={{ fontSize: "14px", color: "#aaa" }}>
                      {proximoPgValor}
                    </span>
                  )}
                </div>
                <div className={styles.card_icon}>
                  <i className="fa-solid fa-calendar-days" style={{ fontSize: "24px" }}></i>
                </div>
              </div>
            </div>

            {/* Abas de Listagem */}
            <div className={styles.section_container}>
              <div className={styles.tab_buttons}>
                <button
                  className={`${styles.tab_button} ${activeTab === "pendentes" ? styles.active_tab : ""}`}
                  onClick={() => setActiveTab("pendentes")}
                >
                  <i className="fa-solid fa-clock"></i>
                  A Vencer / Pendentes ({pendentes.length})
                </button>
                <button
                  className={`${styles.tab_button} ${activeTab === "historico" ? styles.active_tab : ""}`}
                  onClick={() => setActiveTab("historico")}
                >
                  <i className="fa-solid fa-history"></i>
                  Histórico de Pagamentos ({pagos.length})
                </button>
              </div>

              {/* Conteúdo da Aba */}
              {activeTab === "pendentes" ? (
                pendentes.length === 0 ? (
                  <div className={styles.empty_state}>
                    <div className={styles.empty_icon}>
                      <i className="fa-solid fa-thumbs-up"></i>
                    </div>
                    <h3>Tudo em dia!</h3>
                    <p>Você não possui cobranças ou pagamentos pendentes.</p>
                  </div>
                ) : (
                  <div className={styles.table_responsive}>
                    <table className={styles.payment_table}>
                      <thead>
                        <tr>
                          <th>Descrição</th>
                          <th>Data de Vencimento</th>
                          <th>Valor</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendentes.map((item) => {
                          const isAtrasado = new Date(item.dataVencimento) < hoje;
                          return (
                            <tr key={item.id}>
                              <td>{item.tipoDespensa}</td>
                              <td>{formatDate(item.dataVencimento)}</td>
                              <td style={{ fontWeight: 600 }}>{formatCurrency(item.valor)}</td>
                              <td>
                                <span className={`${styles.badge} ${isAtrasado ? styles.atrasado : styles.pendente}`}>
                                  <i className={isAtrasado ? "fa-solid fa-circle-exclamation" : "fa-solid fa-circle-minus"}></i>
                                  {isAtrasado ? "Atrasado" : "Pendente"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )
              ) : pagos.length === 0 ? (
                <div className={styles.empty_state}>
                  <div className={styles.empty_icon}>
                    <i className="fa-solid fa-receipt"></i>
                  </div>
                  <h3>Nenhum histórico</h3>
                  <p>Ainda não há registros de pagamentos efetuados.</p>
                </div>
              ) : (
                <div className={styles.table_responsive}>
                  <table className={styles.payment_table}>
                    <thead>
                      <tr>
                        <th>Descrição</th>
                        <th>Data de Pagamento</th>
                        <th>Valor Pago</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagos.map((item) => (
                        <tr key={item.id}>
                          <td>{item.tipoDespensa}</td>
                          <td>{formatDate(item.dataPagamento)}</td>
                          <td style={{ fontWeight: 600, color: "#10b981" }}>{formatCurrency(item.valor)}</td>
                          <td>
                            <span className={`${styles.badge} ${styles.pago}`}>
                              <i className="fa-solid fa-circle-check"></i>
                              Pago
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AlunoPagamentos;
