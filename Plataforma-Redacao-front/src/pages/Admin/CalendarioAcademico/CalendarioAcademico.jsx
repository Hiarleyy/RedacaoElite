import { useState, useEffect, useMemo } from "react";
import styles from "./styles.module.css";
import Title from "../../../components/Title/Title";
import fetchData from "../../../utils/fetchData";

// Cores sugeridas para novos tipos de evento
const CORES_SUGERIDAS = [
  "#3b82f6", "#10b981", "#ef4444", "#8b5cf6",
  "#f97316", "#da9e00", "#ec4899", "#06b6d4",
  "#84cc16", "#f43f5e",
];

const CalendarioAcademico = () => {
  const [eventos, setEventos] = useState([]);
  const [tiposEvento, setTiposEvento] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // Filtros
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroTipoId, setFiltroTipoId] = useState("todos");

  // Modais de evento
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Modal de gerenciamento de tipos
  const [showTiposModal, setShowTiposModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configTab, setConfigTab] = useState("tipos"); // "tipos" ou "feriados"
  const [editingTipo, setEditingTipo] = useState(null); // { id, nome, cor } ou null para novo
  const [tipoNome, setTipoNome] = useState("");
  const [tipoCor, setTipoCor] = useState(CORES_SUGERIDAS[0]);

  // Formulário de feriado
  const [feriadoNome, setFeriadoNome] = useState("");
  const [feriadoData, setFeriadoData] = useState("");
  const [feriadosNacionais, setFeriadosNacionais] = useState([]);

  // Formulário de evento
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [tipoEventoId, setTipoEventoId] = useState("");

  const {
    getEventos, createEvento, updateEvento, deleteEvento,
    getTiposEvento, createTipoEvento, updateTipoEvento, deleteTipoEvento,
  } = fetchData();

  // ─── Loaders ──────────────────────────────────────────────
  const carregarEventos = async () => {
    setLoading(true);
    try {
      const data = await getEventos();
      setEventos(data || []);
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
    } finally {
      setLoading(false);
    }
  };

  const carregarTipos = async () => {
    try {
      const data = await getTiposEvento();
      setTiposEvento(data || []);
    } catch (error) {
      console.error("Erro ao buscar tipos de evento:", error);
    }
  };

  useEffect(() => {
    carregarEventos();
    carregarTipos();
  }, []);

  // Buscar Feriados Nacionais
  useEffect(() => {
    const ano = currentDate.getFullYear();
    const carregarFeriadosNacionais = async () => {
      try {
        const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`);
        if (response.ok) {
          const data = await response.json();
          const formatados = data.map((f) => ({
            id: `feriado-nacional-${f.date}-${f.name}`,
            titulo: `Feriado: ${f.name}`,
            descricao: "Feriado Nacional Oficial do Brasil",
            dataInicio: `${f.date}T00:00:00.000Z`,
            dataFim: `${f.date}T23:59:59.000Z`,
            cor: "#d97706", // Tom âmbar/laranja para destacar feriados nacionais
            isFeriadoNacional: true,
          }));
          setFeriadosNacionais(formatados);
        } else {
          setFeriadosNacionais([]);
        }
      } catch (error) {
        console.error("Erro ao carregar feriados nacionais:", error);
        setFeriadosNacionais([]);
      }
    };
    carregarFeriadosNacionais();
  }, [currentDate.getFullYear()]);

  // ─── Navegação ────────────────────────────────────────────
  const prevMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  // ─── Helpers ──────────────────────────────────────────────
  const formatForDatetimeInput = (dateObj) => {
    if (!dateObj) return "";
    const d = new Date(dateObj);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const formatarDataDetalhada = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  // Cor efetiva do evento: usa cor do tipo se tiver, senão cor manual
  const corDoEvento = (evento) => {
    if (evento.tipoEvento) return evento.tipoEvento.cor;
    return evento.cor || "#8b5cf6";
  };

  // ─── Grade do calendário ──────────────────────────────────
  const diasDoCalendario = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const primeiroDiaMes = new Date(year, month, 1);
    const primeiroDiaSemana = primeiroDiaMes.getDay();
    const totalDiasMes = new Date(year, month + 1, 0).getDate();
    const totalDiasMesAnterior = new Date(year, month, 0).getDate();
    const dias = [];

    for (let i = primeiroDiaSemana - 1; i >= 0; i--) {
      dias.push({ date: new Date(year, month - 1, totalDiasMesAnterior - i), isCurrentMonth: false });
    }
    for (let i = 1; i <= totalDiasMes; i++) {
      dias.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    const totalCells = dias.length > 35 ? 42 : 35;
    for (let i = 1; i <= totalCells - dias.length; i++) {
      dias.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return dias;
  }, [currentDate]);

  // ─── Filtros ──────────────────────────────────────────────
  const eventosFiltrados = useMemo(() => {
    return eventos.filter((ev) => {
      const matchTexto = filtroTexto === "" ||
        ev.titulo.toLowerCase().includes(filtroTexto.toLowerCase());
      const matchTipo = filtroTipoId === "todos" ||
        ev.tipoEventoId === filtroTipoId;
      return matchTexto && matchTipo;
    });
  }, [eventos, filtroTexto, filtroTipoId]);

  // Combina eventos locais filtrados com feriados nacionais
  const todosEventosExibidos = useMemo(() => {
    const feriadosFiltrados = feriadosNacionais.filter((f) => {
      const matchTexto = filtroTexto === "" ||
        f.titulo.toLowerCase().includes(filtroTexto.toLowerCase());
      const tipoFeriado = tiposEvento.find(t => t.nome.toLowerCase() === "feriado");
      const matchTipo = filtroTipoId === "todos" || (tipoFeriado && filtroTipoId === tipoFeriado.id);
      return matchTexto && matchTipo;
    });
    return [...eventosFiltrados, ...feriadosFiltrados];
  }, [eventosFiltrados, feriadosNacionais, filtroTexto, filtroTipoId, tiposEvento]);

  const obterEventosDoDia = (diaDate) => {
    const inicio = new Date(diaDate.getFullYear(), diaDate.getMonth(), diaDate.getDate(), 0, 0, 0);
    const fim = new Date(diaDate.getFullYear(), diaDate.getMonth(), diaDate.getDate(), 23, 59, 59);
    return todosEventosExibidos.filter((ev) => {
      const evInicio = new Date(ev.dataInicio);
      const evFim = new Date(ev.dataFim);
      return evInicio <= fim && evFim >= inicio;
    });
  };

  // Eventos do mês atual (para a lista lateral)
  const eventosDoMes = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return todosEventosExibidos
      .filter((ev) => {
        const d = new Date(ev.dataInicio);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .sort((a, b) => new Date(a.dataInicio) - new Date(b.dataInicio));
  }, [todosEventosExibidos, currentDate]);

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];

  // ─── Handlers de Evento ───────────────────────────────────
  const handleOpenAddModal = (date = new Date()) => {
    const start = new Date(date);
    start.setHours(8, 0, 0, 0);
    const end = new Date(date);
    end.setHours(18, 0, 0, 0);
    setTitulo("");
    setDescricao("");
    setDataInicio(formatForDatetimeInput(start));
    setDataFim(formatForDatetimeInput(end));
    setTipoEventoId(tiposEvento[0]?.id || "");
    setShowAddModal(true);
  };

  const handleCreateEventSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || !dataInicio || !dataFim) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }
    if (new Date(dataInicio) > new Date(dataFim)) {
      alert("A data de término não pode ser anterior à data de início.");
      return;
    }
    try {
      await createEvento({
        titulo,
        descricao,
        dataInicio: new Date(dataInicio).toISOString(),
        dataFim: new Date(dataFim).toISOString(),
        tipoEventoId: tipoEventoId || null,
      });
      setShowAddModal(false);
      carregarEventos();
    } catch (error) {
      console.error("Erro ao criar evento:", error);
      alert("Erro ao criar o evento acadêmico.");
    }
  };

  const handleOpenDetails = (evento, e) => {
    e.stopPropagation();
    setSelectedEvent(evento);
    setIsEditing(false);
    setTitulo(evento.titulo);
    setDescricao(evento.descricao || "");
    setDataInicio(formatForDatetimeInput(evento.dataInicio));
    setDataFim(formatForDatetimeInput(evento.dataFim));
    setTipoEventoId(evento.tipoEventoId || "");
    setShowDetailsModal(true);
  };

  const handleUpdateEventSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || !dataInicio || !dataFim) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }
    if (new Date(dataInicio) > new Date(dataFim)) {
      alert("A data de término não pode ser anterior à data de início.");
      return;
    }
    try {
      await updateEvento(selectedEvent.id, {
        titulo,
        descricao,
        dataInicio: new Date(dataInicio).toISOString(),
        dataFim: new Date(dataFim).toISOString(),
        tipoEventoId: tipoEventoId || null,
      });
      setShowDetailsModal(false);
      setSelectedEvent(null);
      setIsEditing(false);
      carregarEventos();
    } catch (error) {
      console.error("Erro ao atualizar evento:", error);
      alert("Erro ao atualizar o evento.");
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    if (!window.confirm(`Excluir o evento "${selectedEvent.titulo}"?`)) return;
    try {
      await deleteEvento(selectedEvent.id);
      setShowDetailsModal(false);
      setSelectedEvent(null);
      carregarEventos();
    } catch (error) {
      console.error("Erro ao excluir evento:", error);
      alert("Erro ao excluir o evento.");
    }
  };

  // ─── Handlers de Tipos ────────────────────────────────────
  const handleOpenTiposModal = () => {
    setEditingTipo(null);
    setTipoNome("");
    setTipoCor(CORES_SUGERIDAS[0]);
    setShowTiposModal(true);
  };

  const handleOpenConfigModal = () => {
    setEditingTipo(null);
    setTipoNome("");
    setTipoCor(CORES_SUGERIDAS[0]);
    setConfigTab("tipos");
    setShowConfigModal(true);
  };

  const handleStartEditTipo = (tipo) => {
    setEditingTipo(tipo);
    setTipoNome(tipo.nome);
    setTipoCor(tipo.cor);
  };

  const handleSaveTipo = async () => {
    if (!tipoNome.trim()) { alert("Informe o nome do tipo."); return; }
    try {
      if (editingTipo) {
        await updateTipoEvento(editingTipo.id, { nome: tipoNome, cor: tipoCor });
      } else {
        await createTipoEvento({ nome: tipoNome, cor: tipoCor });
      }
      setEditingTipo(null);
      setTipoNome("");
      setTipoCor(CORES_SUGERIDAS[0]);
      carregarTipos();
      carregarEventos(); // recarrega pra refletir nome/cor atualizado
    } catch (error) {
      console.error("Erro ao salvar tipo:", error);
      alert("Erro ao salvar o tipo de evento.");
    }
  };

  const handleDeleteTipo = async (tipo) => {
    if (!window.confirm(`Excluir o tipo "${tipo.nome}"? Os eventos vinculados perderão o tipo.`)) return;
    try {
      await deleteTipoEvento(tipo.id);
      if (filtroTipoId === tipo.id) setFiltroTipoId("todos");
      carregarTipos();
      carregarEventos();
    } catch (error) {
      console.error("Erro ao excluir tipo:", error);
      alert("Erro ao excluir o tipo de evento.");
    }
  };

  const handleCancelEditTipo = () => {
    setEditingTipo(null);
    setTipoNome("");
    setTipoCor(CORES_SUGERIDAS[0]);
  };

  // ─── Handlers de Feriados ─────────────────────────────────
  const feriadosCadastrados = useMemo(() => {
    const tipoFeriado = tiposEvento.find(
      (t) => t.nome.toLowerCase() === "feriado"
    );
    if (!tipoFeriado) return [];
    return eventos.filter((ev) => ev.tipoEventoId === tipoFeriado.id);
  }, [eventos, tiposEvento]);

  const handleSaveFeriado = async (e) => {
    e.preventDefault();
    if (!feriadoNome.trim() || !feriadoData) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      let tipoFeriado = tiposEvento.find(
        (t) => t.nome.toLowerCase() === "feriado"
      );

      if (!tipoFeriado) {
        tipoFeriado = await createTipoEvento({
          nome: "Feriado",
          cor: "#ef4444",
        });
        await carregarTipos();
      }

      const dataInicioIso = new Date(`${feriadoData}T00:00:00`).toISOString();
      const dataFimIso = new Date(`${feriadoData}T23:59:59`).toISOString();

      await createEvento({
        titulo: feriadoNome,
        descricao: "Feriado Acadêmico / Local",
        dataInicio: dataInicioIso,
        dataFim: dataFimIso,
        tipoEventoId: tipoFeriado.id,
      });

      setFeriadoNome("");
      setFeriadoData("");

      carregarEventos();
      alert("Feriado cadastrado com sucesso!");
    } catch (error) {
      console.error("Erro ao cadastrar feriado:", error);
      alert("Erro ao cadastrar o feriado.");
    }
  };

  const handleDeleteFeriado = async (feriado) => {
    if (!window.confirm(`Excluir o feriado "${feriado.titulo}"?`)) return;
    try {
      await deleteEvento(feriado.id);
      carregarEventos();
    } catch (error) {
      console.error("Erro ao excluir feriado:", error);
      alert("Erro ao excluir o feriado.");
    }
  };

  // ─── Render ───────────────────────────────────────────────
  return (
    <div className={styles.container}>
      <Title title="Calendário Acadêmico" />

      <div className={styles.calendar_wrapper}>
        {/* ── Cabeçalho ── */}
        <div className={styles.calendar_header}>
          <div className={styles.nav_controls}>
            <button className={styles.nav_btn_icon} onClick={prevMonth} title="Mês Anterior">
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <h2 className={styles.current_month}>
              {meses[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button className={styles.nav_btn_icon} onClick={nextMonth} title="Próximo Mês">
              <i className="fa-solid fa-chevron-right"></i>
            </button>
            <button className={styles.nav_btn} onClick={goToToday}>
              <i className="fa-solid fa-calendar-day"></i>
              Hoje
            </button>
            <button className={styles.config_btn} onClick={handleOpenConfigModal} title="Configurações do Calendário">
              <i className="fa-solid fa-gear"></i>
              Configurações
            </button>
          </div>

          <div className={styles.header_actions}>
            <button className={styles.add_event_btn} onClick={() => handleOpenAddModal()}>
              <i className="fa-solid fa-calendar-plus"></i>
              Adicionar Evento
            </button>
          </div>
        </div>

        {/* ── Barra de Filtros ── */}
        <div className={styles.filters_bar}>
          <div className={styles.filter_search}>
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              className={styles.filter_input}
              placeholder="Buscar evento..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
            />
            {filtroTexto && (
              <button className={styles.filter_clear_btn} onClick={() => setFiltroTexto("")}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>

          <div className={styles.filter_type}>
            <i className="fa-solid fa-filter"></i>
            <select
              className={styles.filter_select}
              value={filtroTipoId}
              onChange={(e) => setFiltroTipoId(e.target.value)}
            >
              <option value="todos">Todos os tipos</option>
              {tiposEvento.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nome}
                </option>
              ))}
            </select>
          </div>

          {(filtroTexto || filtroTipoId !== "todos") && (
            <button
              className={styles.filter_reset_btn}
              onClick={() => { setFiltroTexto(""); setFiltroTipoId("todos"); }}
              title="Limpar filtros"
            >
              <i className="fa-solid fa-rotate-left"></i>
              Limpar
            </button>
          )}
        </div>

        {/* ── Legenda de tipos ── */}
        {tiposEvento.length > 0 && (
          <div className={styles.legend_bar}>
            {tiposEvento.map((tipo) => (
              <button
                key={tipo.id}
                className={`${styles.legend_chip} ${filtroTipoId === tipo.id ? styles.legend_chip_active : ""}`}
                style={{ "--chip-color": tipo.cor }}
                onClick={() => setFiltroTipoId(filtroTipoId === tipo.id ? "todos" : tipo.id)}
                title={`Filtrar por: ${tipo.nome}`}
              >
                <span className={styles.legend_dot} style={{ backgroundColor: tipo.cor }}></span>
                {tipo.nome}
              </button>
            ))}
          </div>
        )}

        {/* ── Grade de dias da semana ── */}
        <div className={styles.weekdays_grid}>
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
            <div key={d} className={styles.weekday}>{d}</div>
          ))}
        </div>

        {/* ── Grade de dias ── */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: "30px", color: "#da9e00" }}></i>
            <p style={{ color: "#e0e0e0", letterSpacing: "0.5px" }}>Carregando calendário...</p>
          </div>
        ) : (
          <div className={styles.days_grid}>
            {diasDoCalendario.map((dia, index) => {
              const diaEventos = obterEventosDoDia(dia.date);
              const isToday = new Date().toDateString() === dia.date.toDateString();
              return (
                <div
                  key={index}
                  className={`${styles.day_cell} ${!dia.isCurrentMonth ? styles.other_month : ""} ${isToday ? styles.today : ""}`}
                  onClick={() => handleOpenAddModal(dia.date)}
                >
                  <div className={styles.day_number_container}>
                    <span className={styles.day_number}>{dia.date.getDate()}</span>
                  </div>
                  <div className={styles.events_list}>
                    {diaEventos.map((evento) => (
                      <div
                        key={evento.id}
                        className={styles.event_pill}
                        style={{ backgroundColor: corDoEvento(evento) }}
                        onClick={(e) => handleOpenDetails(evento, e)}
                        title={evento.titulo}
                      >
                        {evento.titulo}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Lista de eventos do mês ── */}
        {eventosDoMes.length > 0 && (
          <div className={styles.events_month_section}>
            <h3 className={styles.events_month_title}>
              <i className="fa-solid fa-list-ul"></i>
              Eventos em {meses[currentDate.getMonth()]}
              <span className={styles.events_count}>{eventosDoMes.length}</span>
            </h3>
            <div className={styles.events_month_list}>
              {eventosDoMes.map((ev) => (
                <div
                  key={ev.id}
                  className={styles.event_list_item}
                  style={{ borderLeftColor: corDoEvento(ev) }}
                  onClick={(e) => handleOpenDetails(ev, e)}
                >
                  <div className={styles.event_list_dot} style={{ backgroundColor: corDoEvento(ev) }}></div>
                  <div className={styles.event_list_info}>
                    <span className={styles.event_list_title}>{ev.titulo}</span>
                    <span className={styles.event_list_date}>
                      {formatarDataDetalhada(ev.dataInicio)}
                    </span>
                  </div>
                  {ev.tipoEvento && (
                    <span className={styles.event_list_type} style={{ color: ev.tipoEvento.cor, borderColor: ev.tipoEvento.cor + "55" }}>
                      {ev.tipoEvento.nome}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════
          MODAL: Gerenciar Tipos de Evento
          ════════════════════════════════════════════════════════ */}
      {showTiposModal && (
        <div className={styles.modal_overlay} onClick={() => setShowTiposModal(false)}>
          <div className={`${styles.modal_content} ${styles.modal_large}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modal_header}>
              <h2>
                <i className="fa-solid fa-tags"></i>
                Tipos de Evento
              </h2>
              <button className={styles.close_btn} onClick={() => setShowTiposModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className={styles.modal_body}>
              {/* Formulário para criar/editar tipo */}
              <div className={styles.tipo_form}>
                <h4 className={styles.tipo_form_title}>
                  {editingTipo ? "Editar tipo" : "Novo tipo de evento"}
                </h4>
                <div className={styles.tipo_form_fields}>
                  <input
                    type="text"
                    className={styles.form_input}
                    placeholder="Nome do tipo (ex: Prova, Feriado...)"
                    value={tipoNome}
                    onChange={(e) => setTipoNome(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveTipo()}
                  />
                  <div className={styles.color_picker_group}>
                    <label className={styles.color_picker_label}>Cor</label>
                    <div className={styles.color_picker_row}>
                        <input
                          type="color"
                          className={styles.color_input_native}
                          value={tipoCor}
                          onChange={(e) => setTipoCor(e.target.value)}
                          title="Escolher cor personalizada"
                        />
                        <div className={styles.color_picker_divider} />
                        <div className={styles.color_swatches}>
                          {CORES_SUGERIDAS.map((c) => (
                            <button
                              key={c}
                              type="button"
                              className={`${styles.color_swatch} ${tipoCor === c ? styles.color_swatch_active : ""}`}
                              style={{ backgroundColor: c }}
                              onClick={() => setTipoCor(c)}
                              title={c}
                            ></button>
                          ))}
                        </div>
                      </div>
                  </div>
                </div>
                <div className={styles.tipo_form_actions}>
                  {editingTipo && (
                    <button className={styles.btn_cancel} onClick={handleCancelEditTipo}>
                      Cancelar
                    </button>
                  )}
                  <button className={styles.btn_submit} onClick={handleSaveTipo}>
                    <i className={`fa-solid ${editingTipo ? "fa-floppy-disk" : "fa-plus"}`}></i>
                    {editingTipo ? "Salvar Alterações" : "Criar Tipo"}
                  </button>
                </div>
              </div>

              {/* Lista de tipos existentes */}
              <div className={styles.tipos_list}>
                {tiposEvento.length === 0 ? (
                  <p className={styles.tipos_empty}>
                    <i className="fa-solid fa-circle-info"></i>
                    Nenhum tipo criado ainda.
                  </p>
                ) : (
                  tiposEvento.map((tipo) => (
                    <div
                      key={tipo.id}
                      className={`${styles.tipo_item} ${editingTipo?.id === tipo.id ? styles.tipo_item_editing : ""}`}
                    >
                      <span className={styles.tipo_color_badge} style={{ backgroundColor: tipo.cor }}></span>
                      <span className={styles.tipo_name}>{tipo.nome}</span>
                      <div className={styles.tipo_actions}>
                        <button
                          className={styles.tipo_btn_edit}
                          onClick={() => handleStartEditTipo(tipo)}
                          title="Editar"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button
                          className={styles.tipo_btn_delete}
                          onClick={() => handleDeleteTipo(tipo)}
                          title="Excluir"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className={styles.modal_footer}>
              <button className={styles.btn_cancel} onClick={() => setShowTiposModal(false)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          MODAL: Adicionar Evento
          ════════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div className={styles.modal_overlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modal_header}>
              <h2>
                <i className="fa-solid fa-calendar-plus"></i>
                Novo Evento Acadêmico
              </h2>
              <button className={styles.close_btn} onClick={() => setShowAddModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleCreateEventSubmit}>
              <div className={styles.modal_body}>
                <div className={styles.form_group}>
                  <label htmlFor="titulo">Título do Evento *</label>
                  <input
                    id="titulo"
                    type="text"
                    className={styles.form_input}
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ex: Simulado ENEM 2026"
                    required
                  />
                </div>

                <div className={styles.form_group}>
                  <label htmlFor="descricao">Descrição (Opcional)</label>
                  <textarea
                    id="descricao"
                    className={`${styles.form_input} ${styles.form_textarea}`}
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Adicione detalhes sobre o evento..."
                  />
                </div>

                <div className={styles.date_row}>
                  <div className={styles.form_group}>
                    <label htmlFor="dataInicio">Início *</label>
                    <input
                      id="dataInicio"
                      type="datetime-local"
                      className={styles.form_input}
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.form_group}>
                    <label htmlFor="dataFim">Término *</label>
                    <input
                      id="dataFim"
                      type="datetime-local"
                      className={styles.form_input}
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className={styles.form_group}>
                  <label htmlFor="tipoEvento">Tipo de Evento</label>
                  {tiposEvento.length === 0 ? (
                    <p className={styles.no_tipos_hint}>
                      <i className="fa-solid fa-circle-info"></i>
                      Crie tipos de evento clicando em{" "}
                      <button
                        type="button"
                        className={styles.inline_link}
                        onClick={() => { setShowAddModal(false); handleOpenTiposModal(); }}
                      >
                        Tipos de Evento
                      </button>
                    </p>
                  ) : (
                    <div className={styles.tipo_selector}>
                      <button
                        type="button"
                        className={`${styles.tipo_option} ${!tipoEventoId ? styles.tipo_option_selected : ""}`}
                        onClick={() => setTipoEventoId("")}
                      >
                        <span className={styles.tipo_option_dot} style={{ backgroundColor: "#555" }}></span>
                        Sem tipo
                      </button>
                      {tiposEvento.map((tipo) => (
                        <button
                          type="button"
                          key={tipo.id}
                          className={`${styles.tipo_option} ${tipoEventoId === tipo.id ? styles.tipo_option_selected : ""}`}
                          style={{ "--tipo-cor": tipo.cor }}
                          onClick={() => setTipoEventoId(tipo.id)}
                        >
                          <span className={styles.tipo_option_dot} style={{ backgroundColor: tipo.cor }}></span>
                          {tipo.nome}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.modal_footer}>
                <button type="button" className={styles.btn_cancel} onClick={() => setShowAddModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className={styles.btn_submit}>
                  Criar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          MODAL: Detalhes / Edição de Evento
          ════════════════════════════════════════════════════════ */}
      {showDetailsModal && selectedEvent && (
        <div className={styles.modal_overlay} onClick={() => { setShowDetailsModal(false); setSelectedEvent(null); }}>
          <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modal_header}>
              <h2>
                <i className="fa-solid fa-calendar-day"></i>
                {isEditing ? "Editar Evento" : "Detalhes do Evento"}
              </h2>
              <button
                className={styles.close_btn}
                onClick={() => { setShowDetailsModal(false); setSelectedEvent(null); setIsEditing(false); }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdateEventSubmit}>
                <div className={styles.modal_body}>
                  <div className={styles.form_group}>
                    <label htmlFor="edit_titulo">Título do Evento *</label>
                    <input
                      id="edit_titulo"
                      type="text"
                      className={styles.form_input}
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.form_group}>
                    <label htmlFor="edit_descricao">Descrição (Opcional)</label>
                    <textarea
                      id="edit_descricao"
                      className={`${styles.form_input} ${styles.form_textarea}`}
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                    />
                  </div>

                  <div className={styles.date_row}>
                    <div className={styles.form_group}>
                      <label htmlFor="edit_dataInicio">Início *</label>
                      <input
                        id="edit_dataInicio"
                        type="datetime-local"
                        className={styles.form_input}
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.form_group}>
                      <label htmlFor="edit_dataFim">Término *</label>
                      <input
                        id="edit_dataFim"
                        type="datetime-local"
                        className={styles.form_input}
                        value={dataFim}
                        onChange={(e) => setDataFim(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.form_group}>
                    <label>Tipo de Evento</label>
                    {tiposEvento.length === 0 ? (
                      <p className={styles.no_tipos_hint}>
                        <i className="fa-solid fa-circle-info"></i>
                        Nenhum tipo criado. Acesse{" "}
                        <button
                          type="button"
                          className={styles.inline_link}
                          onClick={() => { setShowDetailsModal(false); setSelectedEvent(null); setIsEditing(false); handleOpenConfigModal(); }}
                        >
                          Configurações
                        </button>
                        {" "}para criar tipos.
                      </p>
                    ) : (
                      <div className={styles.tipo_selector}>
                        <button
                          type="button"
                          className={`${styles.tipo_option} ${!tipoEventoId ? styles.tipo_option_selected : ""}`}
                          onClick={() => setTipoEventoId("")}
                        >
                          <span className={styles.tipo_option_dot} style={{ backgroundColor: "#555" }}></span>
                          Sem tipo
                        </button>
                        {tiposEvento.map((tipo) => (
                          <button
                            type="button"
                            key={tipo.id}
                            className={`${styles.tipo_option} ${tipoEventoId === tipo.id ? styles.tipo_option_selected : ""}`}
                            onClick={() => setTipoEventoId(tipo.id)}
                          >
                            <span className={styles.tipo_option_dot} style={{ backgroundColor: tipo.cor }}></span>
                            {tipo.nome}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.modal_footer}>
                  <button type="button" className={styles.btn_cancel} onClick={() => setIsEditing(false)}>
                    Voltar
                  </button>
                  <button type="submit" className={styles.btn_submit}>
                    Salvar Alterações
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className={styles.modal_body}>
                  {selectedEvent.isFeriadoNacional && (
                    <div className={styles.feriado_nacional_alert}>
                      <i className="fa-solid fa-circle-info"></i>
                      Feriado oficial nacional do Brasil.
                    </div>
                  )}
                  <div className={styles.event_details}>
                    <div className={styles.detail_field}>
                      <span className={styles.detail_label}>Título</span>
                      <span
                        className={styles.detail_value}
                        style={{ borderLeft: `4px solid ${corDoEvento(selectedEvent)}`, paddingLeft: "10px" }}
                      >
                        {selectedEvent.titulo}
                      </span>
                    </div>

                    {selectedEvent.descricao && (
                      <div className={styles.detail_field}>
                        <span className={styles.detail_label}>Descrição</span>
                        <div className={styles.detail_value_desc}>{selectedEvent.descricao}</div>
                      </div>
                    )}

                    <div className={styles.detail_dates}>
                      <div className={styles.detail_field}>
                        <span className={styles.detail_label}>Início</span>
                        <span className={styles.detail_value}>{formatarDataDetalhada(selectedEvent.dataInicio)}</span>
                      </div>
                      <div className={styles.detail_field}>
                        <span className={styles.detail_label}>Fim</span>
                        <span className={styles.detail_value}>{formatarDataDetalhada(selectedEvent.dataFim)}</span>
                      </div>
                    </div>

                    <div className={styles.detail_field}>
                      <span className={styles.detail_label}>Tipo</span>
                      {selectedEvent.isFeriadoNacional ? (
                        <span className={styles.color_tag}>
                          <span className={styles.color_preview} style={{ backgroundColor: selectedEvent.cor }} />
                          Feriado Nacional
                        </span>
                      ) : selectedEvent.tipoEvento ? (
                        <span className={styles.color_tag}>
                          <span className={styles.color_preview} style={{ backgroundColor: selectedEvent.tipoEvento.cor }} />
                          {selectedEvent.tipoEvento.nome}
                        </span>
                      ) : (
                        <span className={styles.detail_value} style={{ color: "#555" }}>Sem tipo definido</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.modal_footer}>
                  {!selectedEvent.isFeriadoNacional && (
                    <button type="button" className={styles.btn_delete} onClick={handleDeleteEvent}>
                      <i className="fa-solid fa-trash-can"></i>
                      Excluir
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.btn_cancel}
                    onClick={() => { setShowDetailsModal(false); setSelectedEvent(null); }}
                  >
                    Fechar
                  </button>
                  {!selectedEvent.isFeriadoNacional && (
                    <button type="button" className={styles.btn_edit} onClick={() => setIsEditing(true)}>
                      <i className="fa-solid fa-pen-to-square"></i>
                      Editar
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          MODAL: Configurações do Calendário
          ════════════════════════════════════════════════════════ */}
      {showConfigModal && (
        <div className={styles.modal_overlay} onClick={() => setShowConfigModal(false)}>
          <div className={`${styles.modal_content} ${styles.modal_large}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modal_header}>
              <h2>
                <i className="fa-solid fa-gear"></i>
                Configurações do Calendário
              </h2>
              <button className={styles.close_btn} onClick={() => setShowConfigModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Abas */}
            <div className={styles.config_tabs}>
              <button
                type="button"
                className={`${styles.config_tab_btn} ${configTab === "tipos" ? styles.config_tab_active : ""}`}
                onClick={() => setConfigTab("tipos")}
              >
                <i className="fa-solid fa-tags"></i>
                Tipos de Evento
              </button>
              <button
                type="button"
                className={`${styles.config_tab_btn} ${configTab === "feriados" ? styles.config_tab_active : ""}`}
                onClick={() => setConfigTab("feriados")}
              >
                <i className="fa-solid fa-calendar-check"></i>
                Feriados Cadastrados
              </button>
            </div>

            <div className={styles.modal_body}>
              {configTab === "tipos" && (
                <>
                  {/* Formulário para criar/editar tipo */}
                  <div className={styles.tipo_form}>
                    <h4 className={styles.tipo_form_title}>
                      {editingTipo ? "Editar tipo" : "Novo tipo de evento"}
                    </h4>
                    <div className={styles.tipo_form_fields}>
                      <input
                        type="text"
                        className={styles.form_input}
                        placeholder="Nome do tipo (ex: Prova, Feriado...)"
                        value={tipoNome}
                        onChange={(e) => setTipoNome(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveTipo()}
                      />
                      <div className={styles.color_picker_group}>
                        <label className={styles.color_picker_label}>Cor</label>
                        <div className={styles.color_picker_row}>
                            <input
                              type="color"
                              className={styles.color_input_native}
                              value={tipoCor}
                              onChange={(e) => setTipoCor(e.target.value)}
                              title="Escolher cor personalizada"
                            />
                            <div className={styles.color_picker_divider} />
                            <div className={styles.color_swatches}>
                              {CORES_SUGERIDAS.map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  className={`${styles.color_swatch} ${tipoCor === c ? styles.color_swatch_active : ""}`}
                                  style={{ backgroundColor: c }}
                                  onClick={() => setTipoCor(c)}
                                  title={c}
                                ></button>
                              ))}
                            </div>
                          </div>
                      </div>
                    </div>
                    <div className={styles.tipo_form_actions}>
                      {editingTipo && (
                        <button className={styles.btn_cancel} onClick={handleCancelEditTipo}>
                          Cancelar
                        </button>
                      )}
                      <button className={styles.btn_submit} onClick={handleSaveTipo}>
                        <i className={`fa-solid ${editingTipo ? "fa-floppy-disk" : "fa-plus"}`}></i>
                        {editingTipo ? "Salvar Alterações" : "Criar Tipo"}
                      </button>
                    </div>
                  </div>

                  {/* Lista de tipos existentes */}
                  <div className={styles.tipos_list}>
                    {tiposEvento.length === 0 ? (
                      <p className={styles.tipos_empty}>
                        <i className="fa-solid fa-circle-info"></i>
                        Nenhum tipo criado ainda.
                      </p>
                    ) : (
                      tiposEvento.map((tipo) => (
                        <div
                          key={tipo.id}
                          className={`${styles.tipo_item} ${editingTipo?.id === tipo.id ? styles.tipo_item_editing : ""}`}
                        >
                          <span className={styles.tipo_color_badge} style={{ backgroundColor: tipo.cor }}></span>
                          <span className={styles.tipo_name}>{tipo.nome}</span>
                          <div className={styles.tipo_actions}>
                            <button
                              className={styles.tipo_btn_edit}
                              onClick={() => handleStartEditTipo(tipo)}
                              title="Editar"
                            >
                              <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button
                              className={styles.tipo_btn_delete}
                              onClick={() => handleDeleteTipo(tipo)}
                              title="Excluir"
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              {configTab === "feriados" && (
                <>
                  {/* Formulário para cadastrar feriado */}
                  <form onSubmit={handleSaveFeriado} className={styles.tipo_form}>
                    <h4 className={styles.tipo_form_title}>Cadastrar Feriado Local/Acadêmico</h4>
                    <div className={styles.tipo_form_fields}>
                      <input
                        type="text"
                        className={styles.form_input}
                        placeholder="Nome do feriado (ex: Dia do Estudante, Padroeira...)"
                        value={feriadoNome}
                        onChange={(e) => setFeriadoNome(e.target.value)}
                        required
                      />
                      <input
                        type="date"
                        className={styles.form_input}
                        value={feriadoData}
                        onChange={(e) => setFeriadoData(e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.tipo_form_actions}>
                      <button type="submit" className={styles.btn_submit}>
                        <i className="fa-solid fa-plus"></i>
                        Cadastrar Feriado
                      </button>
                    </div>
                  </form>

                  {/* Lista de feriados cadastrados */}
                  <div className={styles.tipos_list}>
                    {feriadosCadastrados.length === 0 ? (
                      <p className={styles.tipos_empty}>
                        <i className="fa-solid fa-circle-info"></i>
                        Nenhum feriado cadastrado ainda.
                      </p>
                    ) : (
                      feriadosCadastrados.map((feriado) => {
                        const dataFormatada = new Date(feriado.dataInicio).toLocaleDateString("pt-BR", {
                          timeZone: "UTC"
                        });
                        return (
                          <div key={feriado.id} className={styles.tipo_item}>
                            <span className={styles.tipo_color_badge} style={{ backgroundColor: "#ef4444" }}></span>
                            <span className={styles.tipo_name}>
                              {feriado.titulo} <span style={{ color: "#888", fontWeight: "normal", marginLeft: "8px" }}>({dataFormatada})</span>
                            </span>
                            <div className={styles.tipo_actions}>
                              <button
                                type="button"
                                className={styles.tipo_btn_delete}
                                onClick={() => handleDeleteFeriado(feriado)}
                                title="Excluir"
                              >
                                <i className="fa-solid fa-trash-can"></i>
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </div>

            <div className={styles.modal_footer}>
              <button className={styles.btn_cancel} onClick={() => setShowConfigModal(false)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioAcademico;
