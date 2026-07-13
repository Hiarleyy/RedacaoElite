import { useState, useEffect, useCallback } from "react";
import styles from "./styles.module.css";
import Title from "../../../components/Title/Title";

const STORAGE_KEY = "enem_contador_config";

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
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultConfig, ...JSON.parse(saved) } : { ...defaultConfig };
    } catch {
      return { ...defaultConfig };
    }
  });

  const [tempo, setTempo] = useState(null);
  const [tituloInput, setTituloInput] = useState(config.titulo);
  const [dataInput, setDataInput] = useState(config.dataAlvo ? config.dataAlvo.slice(0, 16) : "");
  const [salvoFeedback, setSalvoFeedback] = useState(false);
  const [editando, setEditando] = useState(!config.dataAlvo);

  // Atualiza o tempo a cada segundo
  useEffect(() => {
    const tick = () => setTempo(calcularTempo(config.dataAlvo));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [config.dataAlvo]);

  const handleSalvar = useCallback(() => {
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
    setConfig(novaConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(novaConfig));
    setSalvoFeedback(true);
    setEditando(false);
    setTimeout(() => setSalvoFeedback(false), 3000);
  }, [tituloInput, dataInput]);

  const handleRedefinir = () => {
    setTituloInput(defaultConfig.titulo);
    setDataInput("");
    const novaConfig = { ...defaultConfig };
    setConfig(novaConfig);
    localStorage.removeItem(STORAGE_KEY);
    setEditando(true);
  };

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
          <div className={styles.preview_label}>
            <i className="fa-solid fa-eye" />
            Visualização
          </div>

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

      {/* ── Datas do ENEM ── Sugestões rápidas */}
      <div className={styles.sugestoes_card}>
        <div className={styles.sugestoes_header}>
          <i className="fa-solid fa-bolt" />
          <h4>Datas oficiais do ENEM 2026 (sugestões rápidas)</h4>
        </div>
        <div className={styles.sugestoes_grid}>
          {[
            { label: "ENEM 2026 — 1º Dia", data: "2026-11-01T13:00:00" },
            { label: "ENEM 2026 — 2º Dia", data: "2026-11-08T13:00:00" },
            { label: "ENEM Digital — 1º Dia", data: "2026-11-15T13:00:00" },
            { label: "ENEM Digital — 2º Dia", data: "2026-11-22T13:00:00" },
          ].map((s) => (
            <button
              key={s.data}
              className={styles.sugestao_btn}
              onClick={() => {
                setDataInput(s.data.slice(0, 16));
                setTituloInput(`Contagem Regressiva — ${s.label}`);
              }}
            >
              <i className="fa-solid fa-calendar-day" />
              <span className={styles.sugestao_label}>{s.label}</span>
              <span className={styles.sugestao_data}>
                {new Date(s.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContadorEnem;
