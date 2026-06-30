import styles from "./styles.module.css";

const ModalDetalhesNotas = ({ aluno, isOpen, onClose }) => {

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Notas de {aluno.nome}</h2>
          
        </div>

        <div className={styles.content}>
          <div>
            <span>Competência 01:</span>
            <strong>{aluno.competencia01}</strong>
          </div>
          <div>
            <span>Competência 02:</span>
            <strong>{aluno.competencia02}</strong>
          </div>
          <div>
            <span>Competência 03:</span>
            <strong>{aluno.competencia03}</strong>
          </div>
          <div>
            <span>Competência 04:</span>
            <strong>{aluno.competencia04}</strong>
          </div>
          <div>
            <span>Competência 05:</span>
            <strong>{aluno.competencia05}</strong>
          </div>
          <hr />
          <div className={styles.notaGeral}>
            <span>Nota Geral:</span>
            <strong>{aluno.notaGeral}</strong>
          </div>
        </div>

        <div className={styles.footer}>
          <button onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalhesNotas;
