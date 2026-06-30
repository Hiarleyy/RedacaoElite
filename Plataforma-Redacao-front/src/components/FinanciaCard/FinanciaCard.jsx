import React from "react";
import styles from "./styles.module.css"; // Import the CSS module

const Card = ({ mes, faturamento, despesas, resultado, itensDespesas }) => {
  return (
    <div className={styles.card}>
      <h2 className={styles.monthHeader}>{mes}</h2>

      <div className={styles.row}>
        <span className={styles.label}>Faturamento:</span>
        <span className={styles.valuePositive}>R$ {faturamento}</span>
      </div>

      <div className={styles.row}>
        <span className={styles.label}>Total Despesas:</span>
        <span className={styles.valueNegative}>R$ {despesas}</span>
      </div>

      <div className={styles.expensesList}>
        {itensDespesas.map((item) => (
          <div className={styles.expenseItem}>
            <span className={styles.expenseLabel}>{item.tipoDespensa} </span>
            <span className={styles.expenseValue}>R$ {item.valor}</span>
          </div>
        ))}
      </div>
      <div className={styles.rowResult}>
        <span className={styles.labelResult}>Resultado:</span>
        <span className={styles.ValueResult}> R$ {resultado}</span>
      </div>
    </div>
  );
};

export default Card;
