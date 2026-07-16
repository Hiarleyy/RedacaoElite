import { useState, useEffect, useCallback } from "react";
import styles from "./styles.module.css";
import Title from "../../../components/Title/Title";
import axios from "axios";
import useUseful from "../../../utils/useUseful";

const baseURL = import.meta.env.VITE_API_BASE_URL;
const CHAVE_CONFIG = "contador_enem";

const defaultConfig = {
  titulo: "Contagem Regressiva para o ENEM",
  dataAlvo: "",
  ativo: true,
};

const pad = (n) => String(n).padStart(2, "0");

const calcularTempo = (dataAlvo) => {
  if (!dataAlvo) return null;
  const agora = Date.now();
  const alvo = new Date(dataAlvo).getTime();
  const diff = alvo - agora;

  if (diff <= 0) return { dias: 0, horas: 0, minutos: 0, segundos: 0, expirado: true };

  const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const segundos = Math.floor((diff % (1000 * 60)) / 1000);

  return { dias, horas, minutos, segundos, expirado: false };
};

const ContadorEnem = () => {
  const [config, setConfig] = useState(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [tempo, setTempo] = useState(null);
  const [tituloInput, setTituloInput] = useState("");
  const [dataInput, setDataInput] = useState("");
  const [salvoFeedback, setSalvoFeedback] = useState(false);
  const [editando, setEditando] = useState(false);

  const { getHeaders } = useUseful();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get(`${baseURL}/configuracoes/${CHAVE_CONFIG}`, {
          headers: getHeaders()
        });
        if (response.data) {
          setConfig(response.data);
          setTituloInput(response.data.titulo || defaultConfig.titulo);
          setDataInput(response.data.dataAlvo ? response.data.dataAlvo.slice(0, 16) : "");
          setEditando(!response.data.dataAlvo);
        } else {
          setTituloInput(defaultConfig.titulo);
          setEditando(true);
        }
      } catch (error) {
        console.error("Erro ao carregar configuração do contador:", error);
        setTituloInput(defaultConfig.titulo);
        setEditando(true);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // Atualiza o tempo a cada segundo
  useEffect(() => {
    const tick = () => setTempo(calcularTempo(config.dataAlvo));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [config.dataAlvo]);

  const handleSalvar = useCallback(async () => {
    if (!tituloInput.trim()) {
      alert("Informe um título para o contador.");
      return;
    }
    if (!dataInput) {
      alert("Selecione uma data alvo.");
      return;
    }
    const novaConfig = {
      titulo: tituloInput.trim(),
      dataAlvo: new Date(dataInput).toISOString(),
      ativo: true,
    };

    try {
      await axios.post(`${baseURL}/configuracoes/${CHAVE_CONFIG}`, novaConfig, {
        headers: getHeaders()
      });
      setConfig(novaConfig);
      setSalvoFeedback(true);
      setEditando(false);
      setTimeout(() => setSalvoFeedback(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      alert("Erro ao salvar a configuração. Tente novamente.");
    }
  }, [tituloInput, dataInput, getHeaders]);

  const handleRedefinir = async () => {
    setTituloInput(defaultConfig.titulo);
    setDataInput("");
    const novaConfig = { ...defaultConfig };

    try {
      await axios.post(`${baseURL}/configuracoes/${CHAVE_CONFIG}`, novaConfig, {
        headers: getHeaders()
      });
      setConfig(novaConfig);
      setEditando(true);
    } catch (error) {
      console.error("Erro ao redefinir configuração:", error);
    }
  };

  if (loading) return <div>Carregando...</div>;

  const dataFormatada = config.dataAlvo
    ? new Date(config.dataAlvo).toLocaleString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    : null;

  const progressoPercent = (() => {
    if (!config.dataAlvo || !tempo) return 0;
    const total = new Date(config.dataAlvo).getTime() - (Date.now() - (tempo.dias * 86400 + tempo.horas * 3600 + tempo.minutos * 60 + tempo.segundos) * 1000);
    return 0; // simplificado — barra apenas decorativa
  })();

  return (
    <div className={styles.container}>
      <Title title="Contador Regressivo — ENEM" />

      <div className={styles.page_grid}>

        {/* ── Preview do Contador ── */}
        <div className={styles.preview_card}>

          {config.dataAlvo && tempo ? (
            <div className={styles.countdown_wrapper}>
              <div className={styles.countdown_orb} />

              <div className={styles.countdown_icon}>
                <i className="fa-solid fa-hourglass-half" />
              </div>

              <h2 className={styles.countdown_title}>{config.titulo}</h2>

              {!tempo.expirado ? (
                <>
                  <div className={styles.units_row}>
                    <div className={styles.unit_block}>
                      <div className={styles.unit_number}>{pad(tempo.dias)}</div>
                      <div className={styles.unit_label}>Dias</div>
                    </div>
                    <div className={styles.unit_sep}>:</div>
                    <div className={styles.unit_block}>
                      <div className={styles.unit_number}>{pad(tempo.horas)}</div>
                      <div className={styles.unit_label}>Horas</div>
                    </div>
                    <div className={styles.unit_sep}>:</div>
                    <div className={styles.unit_block}>
                      <div className={styles.unit_number}>{pad(tempo.minutos)}</div>
                      <div className={styles.unit_label}>Minutos</div>
                    </div>
                    <div className={styles.unit_sep}>:</div>
                    <div className={styles.unit_block}>
                      <div className={styles.unit_number}>{pad(tempo.segundos)}</div>
                      <div className={styles.unit_label}>Segundos</div>
                    </div>
                  </div>

                  <p className={styles.countdown_date_label}>
                    <i className="fa-regular fa-calendar" />
                    {dataFormatada}
                  </p>
                </>
              ) : (
                <div className={styles.expirado_msg}>
                  <i className="fa-solid fa-flag-checkered" />
                  <p>O prazo já chegou! ✨</p>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.preview_empty}>
              <i className="fa-solid fa-hourglass" />
              <p>Configure uma data para visualizar o contador.</p>
            </div>
          )}
        </div>

        {/* ── Painel de Configuração ── */}
        <div className={styles.config_card}>
          <div className={styles.config_header}>
            <i className="fa-solid fa-gear" />
            <h3>Configurações do Contador</h3>
          </div>

          <div className={styles.config_body}>
            <div className={styles.form_group}>
              <label htmlFor="titulo_contador">
                <i className="fa-solid fa-heading" />
                Título do Contador
              </label>
              <input
                id="titulo_contador"
                type="text"
                className={styles.form_input}
                value={tituloInput}
                onChange={(e) => setTituloInput(e.target.value)}
                placeholder="Ex: Contagem Regressiva para o ENEM 2026"
                maxLength={80}
              />
              <span className={styles.char_count}>{tituloInput.length}/80</span>
            </div>

            <div className={styles.form_group}>
              <label htmlFor="data_alvo">
                <i className="fa-regular fa-calendar-check" />
                Data e Hora do ENEM
              </label>
              <input
                id="data_alvo"
                type="datetime-local"
                className={styles.form_input}
                value={dataInput}
                onChange={(e) => setDataInput(e.target.value)}
              />
              {dataInput && (
                <p className={styles.data_preview}>
                  <i className="fa-solid fa-circle-info" />
                  {new Date(dataInput).toLocaleString("pt-BR", {
                    weekday: "long", day: "2-digit", month: "long",
                    year: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              )}
            </div>

            <div className={styles.config_actions}>
              <button className={styles.btn_salvar} onClick={handleSalvar}>
                <i className="fa-solid fa-floppy-disk" />
                {salvoFeedback ? "Salvo com sucesso!" : "Salvar configuração"}
              </button>

              {config.dataAlvo && (
                <button className={styles.btn_redefinir} onClick={handleRedefinir}>
                  <i className="fa-solid fa-rotate-left" />
                  Redefinir
                </button>
              )}
            </div>

            {salvoFeedback && (
              <div className={styles.feedback_success}>
                <i className="fa-solid fa-circle-check" />
                Configuração salva! O contador está ativo no painel dos alunos.
              </div>
            )}
          </div>

          {/* Info sobre onde aparece */}
          <div className={styles.info_box}>
            <i className="fa-solid fa-circle-info" />
            <div>
              <strong>Como funciona?</strong>
              <p>O contador será exibido na página inicial dos alunos. A configuração é salva localmente e persistida entre sessões.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContadorEnem;
