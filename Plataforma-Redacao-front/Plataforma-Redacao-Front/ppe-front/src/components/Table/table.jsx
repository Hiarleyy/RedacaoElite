import { useState } from "react";
import styles from "./style.module.css";

const Tabela = ({ dados }) => {
  const [search, setSearch] = useState("");

  const getStatusClass = (status) => {
    const normalized = status?.toLowerCase();

    if (normalized === "entrada") return styles.status_paid;
    if (normalized === "saída" || normalized === "saida") return styles.status_overdue;
    return "";
  };

  const formatarData = (data) => {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-BR");
  };

  return (
    <div className={styles.table_container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Tipo de Despesa</th>
            <th>Data de Pagamento</th>
            <th>Valor</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {dados
            .filter((item) =>
              item.tipoDespensa.toLowerCase().includes(search.toLowerCase())
            )
            .sort(
              (a, b) => new Date(b.dataPagamento) - new Date(a.dataPagamento)
            ) // <- ordenação decrescente por data
            .map((row, index) => (
              <tr key={`${row.id}-${index}`}>
                <td>{row.tipoDespensa}</td>
                <td>{formatarData(row.dataPagamento)}</td>
                <td>{"R$ " + row.valor}</td>
                <td>
                  <span
                    className={`${styles.status} ${getStatusClass(row.status)}`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Tabela;
