import { useState } from 'react';
import styles from './styles.module.css';

export default function ToggleAnalysis({ data1, data2, data3, setTaggle, taggle_manual}) {
  const [selected, setSelected] = useState(taggle_manual || "Análise Mensal");

  const handleToggle = (value) => {
    setSelected(value);
    setTaggle(value); // envia o valor pro componente pai
  };

  return (
    <div className={styles.toggle_container}>
      <button
        className={`${styles.toggle_button} ${selected === data1 ? styles.active : ''}`}
        onClick={() => handleToggle(data1)}
      >
        {data1}
      </button>

      <button
        className={`${styles.toggle_button} ${selected === data2 ? styles.active : ''}`}
        onClick={() => handleToggle(data2)}
      >
        {data2}
      </button>

      {data3 && (
        <button
          className={`${styles.toggle_button} ${selected === data3 ? styles.active : ''}`}
          onClick={() => handleToggle(data3)}
        >
          {data3}
        </button>
      )}
    </div>
  );
}
