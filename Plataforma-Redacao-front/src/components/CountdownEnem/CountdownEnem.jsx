import { useState, useEffect } from "react";
import styles from "./styles.module.css";
import axios from "axios";
import useUseful from "../../utils/useUseful";

const baseURL = import.meta.env.VITE_API_BASE_URL;
const CHAVE_CONFIG = "contador_enem";
const pad = (n) => String(n).padStart(2, "0");

const calcularTempo = (dataAlvo) => {
  if (!dataAlvo) return null;
  const diff = new Date(dataAlvo).getTime() - Date.now();
  if (diff <= 0) return { dias: 0, horas: 0, minutos: 0, segundos: 0, expirado: true };
  return {
    dias: Math.floor(diff / (1000 * 60 * 60 * 24)),
    horas: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutos: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    segundos: Math.floor((diff % (1000 * 60)) / 1000),
    expirado: false,
  };
};

const CountdownEnem = () => {
  const [config, setConfig] = useState(null);
  const [tempo, setTempo] = useState(null);

  const { getHeaders } = useUseful();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get(`${baseURL}/configuracoes/${CHAVE_CONFIG}`, {
          headers: getHeaders()
        });
        if (response.data && response.data.ativo) {
          setConfig(response.data);
        }
      } catch (error) {
        console.error("Erro ao carregar contador do ENEM:", error);
      }
    };
    fetchConfig();
  }, [getHeaders]);

  useEffect(() => {
    if (!config?.dataAlvo) return;
    const tick = () => setTempo(calcularTempo(config.dataAlvo));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [config]);

  if (!config || !tempo) return null;

  return (
    <div className={styles.banner}>
      <div className={styles.banner_inner}>

        {/* Label esquerda */}
        <div className={styles.banner_label}>
          <i className="fa-solid fa-stopwatch" />
          <span className={styles.label_text}>FALTAM</span>
        </div>

        {/* Unidades */}
        {!tempo.expirado ? (
          <div className={styles.units}>
            <div className={styles.unit}>
              <span className={styles.num}>{pad(tempo.dias)}</span>
              <span className={styles.lbl}>DIAS</span>
            </div>
            <span className={styles.sep}>:</span>
            <div className={styles.unit}>
              <span className={styles.num}>{pad(tempo.horas)}</span>
              <span className={styles.lbl}>HORAS</span>
            </div>
            <span className={styles.sep}>:</span>
            <div className={styles.unit}>
              <span className={styles.num}>{pad(tempo.minutos)}</span>
              <span className={styles.lbl}>MINUTOS</span>
            </div>
            <span className={styles.sep}>:</span>
            <div className={styles.unit}>
              <span className={styles.num}>{pad(tempo.segundos)}</span>
              <span className={styles.lbl}>SEGUNDOS</span>
            </div>
          </div>
        ) : (
          <span className={styles.expirado}>
            <i className="fa-solid fa-flag-checkered" /> Chegou o dia!
          </span>
        )}

        {/* Label direita */}
        <div className={styles.banner_label_right}>
          <span className={styles.label_text_right}>
            {config.titulo.toUpperCase()}
          </span>
        </div>

      </div>
    </div>
  );
};

export default CountdownEnem;
