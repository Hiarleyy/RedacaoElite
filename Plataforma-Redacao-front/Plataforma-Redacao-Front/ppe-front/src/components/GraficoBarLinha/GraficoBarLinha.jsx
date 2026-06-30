import React from 'react';
import styles from './styles.module.css';

const GraficoBarLinha = ({ data }) => {


  const total = data.reduce((acc, item) => acc + item.valor, 0);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Distribuição de Saída dos Recursos:</h3>
      {data.map((item, index) => {
        const percentual = ((item.valor / total) * 100).toFixed(0);
        return (
          <div key={index} className={styles.row}>
            <div className={styles.label}>{item.categoria}</div>
            <div className={styles.progressBar}>
              <div
                className={styles.fill}
                style={{ width: `${percentual}%`, backgroundColor: item.cor }}
              />
            </div>
            <div className={styles.value}>
              R$ {item.valor.toLocaleString()} ({percentual}%)
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GraficoBarLinha;
