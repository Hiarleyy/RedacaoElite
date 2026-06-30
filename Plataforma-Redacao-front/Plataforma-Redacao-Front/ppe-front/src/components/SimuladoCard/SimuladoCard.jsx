import React from 'react';
import styles from './styles.module.css';

const SimuladoCard = ({
  titulo = 'Título Padrão',
  data = '',
  status = '',
  participantes = 0,
  turmas = [],
  color = '#fff',
  gradient = '',
  onRegistrarResultados = () => {},
}) => {

  
  const cardStyle = {
    backgroundColor: color,
    backgroundImage: gradient, // Ex: 'linear-gradient(to right,rgb(158, 146, 143),rgba(226, 98, 0, 0.93))'
  };



  return (
      <div className={styles.simuladoCard} style={cardStyle}>
        <div className={styles.header}>
          <div>
            <h4 className={styles.title}>{titulo}</h4>
            <p className={styles.date}><span>📅</span> {data}</p>
          </div>
          <span className={styles.statusConcluido}>{status}</span>
        </div>

        <div className={styles.infoContainer}>
          <div className={styles.infoCard}>
            <p className={styles.label}>👤 Participantes</p>
            <p className={styles.value}>{participantes}</p>
          </div>
          <div className={styles.infoCard}>
            <p className={styles.label_turma}>📚 Turma</p>
            <p className={styles.value_turma}>
              {
                Array.isArray(turmas)
                  ? turmas.join(', ')
                  : typeof turmas === 'string'
                  ? turmas
                  : turmas?.nome || '---'
              }
            </p>
          </div>
        </div>

        <div className={styles.buttons}>
          <button className={styles.btnDark} onClick={onRegistrarResultados}>
            Registrar Notas
          </button>
        </div>
      </div>

  );
};

export default SimuladoCard;
