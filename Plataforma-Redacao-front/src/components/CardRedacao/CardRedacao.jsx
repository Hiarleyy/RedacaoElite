// components/CardRedacao/CardRedacao.jsx
import styles from "./styles.module.css";

const CardRedacao = ({ redacao }) => {
  const {
    nota,
    competencia01,
    competencia02,
    competencia03,
    competencia04,
    competencia05,
    feedback,
    data,
    caminho
  } = redacao;

  return (
    <div className={styles.card}>
      <p><strong>Nota:</strong> {nota}</p>
      <p><strong>Competência 1:</strong> {competencia01}</p>
      <p><strong>Competência 2:</strong> {competencia02}</p>
      <p><strong>Competência 3:</strong> {competencia03}</p>
      <p><strong>Competência 4:</strong> {competencia04}</p>
      <p><strong>Competência 5:</strong> {competencia05}</p>
      <p><strong>Feedback:</strong> {feedback}</p>
      <p><strong>Data:</strong> {new Date(data).toLocaleString()}</p>
      <a
        href={`/${caminho}`}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
      >
        Ver PDF
      </a>
    </div>
  );
};

export default CardRedacao;
