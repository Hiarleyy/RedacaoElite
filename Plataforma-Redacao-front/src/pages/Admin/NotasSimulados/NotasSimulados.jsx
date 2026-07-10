import { useParams } from "react-router-dom";
import styles from "./styles.module.css";
import Title from "../../../components/Title/Title";
import { useState, useEffect } from "react";
import fetchData from "../../../utils/fetchData";
import ModalRegistrarNotas from "../../../components/ModalRegistrarNotas/ModalRegistrarNotas";
import Pagination from "../../../components/Pagination/Pagination";

function NotasSimulados() {
  const { simulado_id } = useParams();
  const [search, setSearch] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  
  const [nomeSimulado, setNomeSimulado] = useState("");
  const [nomeTurma, setNomeTurma] = useState("");
  const [dataSimulado, setDataSimulado] = useState("");
  
  const [totalAlunos, setTotalAlunos] = useState(0);
  const [alunosSemNotas, setAlunosSemNotas] = useState([]);
  
  // Dashboard stats
  const [notasStats, setNotasStats] = useState({
    media: 0,
    maior: 0,
    menor: 0,
    corrigidas: 0,
    faixa1: 0, // 0-399
    faixa2: 0, // 400-599
    faixa3: 0, // 600-799
    faixa4: 0, // 800-1000
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Search filter
  const filteredAlunosSemNota = alunosSemNotas.filter(aluno => 
    aluno.nome.toLowerCase().includes(search.toLowerCase()) || 
    aluno.email.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAlunosSemNota = filteredAlunosSemNota.slice(indexOfFirstItem, indexOfLastItem);

  const carregarDados = async () => {
    try {
      const { getSimuladoById, getTurmaById, getNotasbySimuladoId } = fetchData();
      const response = await getSimuladoById(simulado_id);
      
      if (!response || response.length === 0) return;
      
      const simuladoData = response[0];
      setNomeSimulado(simuladoData.titulo);
      setDataSimulado(simuladoData.data);
      
      const turmaResponse = await getTurmaById(simuladoData.turmaId);
      setNomeTurma(turmaResponse.nome);
      
      const todosAlunos = turmaResponse.usuarios || [];
      setTotalAlunos(todosAlunos.length);
      
      const notasAlunosSimulado = await getNotasbySimuladoId(simulado_id);
      
      // Calculate Stats
      if (notasAlunosSimulado && notasAlunosSimulado.length > 0) {
        let soma = 0;
        let maior = -1;
        let menor = 1001;
        let f1 = 0, f2 = 0, f3 = 0, f4 = 0;
        
        notasAlunosSimulado.forEach(notaObj => {
          const nota = Number(notaObj.notaGeral) || 0;
          soma += nota;
          if (nota > maior) maior = nota;
          if (nota < menor) menor = nota;
          
          if (nota <= 399) f1++;
          else if (nota <= 599) f2++;
          else if (nota <= 799) f3++;
          else f4++;
        });
        
        setNotasStats({
          media: Math.round(soma / notasAlunosSimulado.length),
          maior: maior,
          menor: menor,
          corrigidas: notasAlunosSimulado.length,
          faixa1: f1,
          faixa2: f2,
          faixa3: f3,
          faixa4: f4
        });
      } else {
        setNotasStats({
          media: 0, maior: 0, menor: 0, corrigidas: 0,
          faixa1: 0, faixa2: 0, faixa3: 0, faixa4: 0
        });
      }
      
      // Find students without notes
      const alunosComNotasIds = notasAlunosSimulado.map(n => String(n.usuarioId));
      const semNotas = todosAlunos.filter(aluno => !alunosComNotasIds.includes(String(aluno.id)));
      
      setAlunosSemNotas(semNotas);
    } catch (error) {
      console.error("Erro ao carregar dados do simulado:", error);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [simulado_id]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const abrirModalNotas = (alunoId, alunoNome) => {
    setAlunoSelecionado({ id: alunoId, name: alunoNome });
    setMostrarModal(true);
  };

  const handleSalvarSimulado = async () => {
    setMostrarModal(false);
    await carregarDados(); // Refresh everything
  };

  const formatarData = (data) => {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-BR");
  };

  const calcPercentual = (valor) => {
    if (notasStats.corrigidas === 0) return "0%";
    return Math.round((valor / notasStats.corrigidas) * 100) + "%";
  };

  const pctMedia = Math.round((notasStats.media / 1000) * 100) + "%";

  return (
    <div className={styles.container}>
      <Title title="Simulado" />
      <div className={styles.mainLayout}>
        {/* Left Side: Dashboard */}
        <div className={styles.dashboardColumn}>
          {/* Header Card */}
          <div className={styles.headerCard}>
            <div className={styles.headerTop}>
              <div className={styles.iconSimulado}>
                <i className="fa-solid fa-clipboard-check"></i>
              </div>
              <div className={styles.headerInfo}>
                <span className={styles.headerLabel}>Detalhes do Simulado</span>
                <div className={styles.headerTitleRow}>
                  <h2 className={styles.simuladoTitle}>{nomeSimulado}</h2>
                  <span className={styles.badgeAtivo}>● Ativo</span>
                </div>
              </div>
            </div>
            <div className={styles.headerMetrics}>
              <div className={styles.metricItem}>
                <div className={styles.metricIcon}><i className="fa-solid fa-users"></i></div>
                <div>
                  <div className={styles.metricLabel}>Turma</div>
                  <div className={styles.metricValue}>{nomeTurma || "-"}</div>
                </div>
              </div>
              <div className={styles.metricItem}>
                <div className={styles.metricIcon}><i className="fa-regular fa-calendar"></i></div>
                <div>
                  <div className={styles.metricLabel}>Data de realização</div>
                  <div className={styles.metricValue}>{formatarData(dataSimulado)}</div>
                </div>
              </div>
              <div className={styles.metricItem}>
                <div className={styles.metricIcon}><i className="fa-solid fa-user-group"></i></div>
                <div>
                  <div className={styles.metricLabel}>Total de participantes</div>
                  <div className={styles.metricValue}>{totalAlunos} alunos</div>
                </div>
              </div>
            </div>
          </div>

          <h3 className={styles.sectionTitle}>Resultados gerais</h3>
          
          <div className={styles.statsGrid}>
            <div className={styles.statBox}>
              <div className={styles.statIconWrapper} style={{color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)'}}>
                <i className="fa-regular fa-star"></i>
              </div>
              <div className={styles.statContent}>
                <span className={styles.statBoxLabel}>Média da turma</span>
                <div className={styles.statBoxValueGroup}>
                  <span className={styles.statBoxValue}>{notasStats.media}</span>
                  <span className={styles.statBoxText}>pontos</span>
                </div>
                <span className={styles.statBoxSub}>de 1000</span>
              </div>
            </div>
            
            <div className={styles.statBox}>
              <div className={styles.statIconWrapper} style={{color: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)'}}>
                <i className="fa-solid fa-arrow-trend-up"></i>
              </div>
              <div className={styles.statContent}>
                <span className={styles.statBoxLabel}>Maior nota</span>
                <div className={styles.statBoxValueGroup}>
                  <span className={styles.statBoxValue}>{notasStats.maior}</span>
                </div>
                <span className={styles.statBoxSub}>pontos</span>
              </div>
            </div>

            <div className={styles.statBox}>
              <div className={styles.statIconWrapper} style={{color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)'}}>
                <i className="fa-solid fa-arrow-right-arrow-left" style={{transform: 'rotate(90deg)'}}></i>
              </div>
              <div className={styles.statContent}>
                <span className={styles.statBoxLabel}>Menor nota</span>
                <div className={styles.statBoxValueGroup}>
                  <span className={styles.statBoxValue}>{notasStats.menor === 1001 ? 0 : notasStats.menor}</span>
                </div>
                <span className={styles.statBoxSub}>pontos</span>
              </div>
            </div>

            <div className={styles.statBox}>
              <div className={styles.statIconWrapper} style={{color: '#a855f7', backgroundColor: 'rgba(168, 85, 247, 0.1)'}}>
                <i className="fa-solid fa-trophy"></i>
              </div>
              <div className={styles.statContent}>
                <span className={styles.statBoxLabel}>Redações corrigidas</span>
                <div className={styles.statBoxValueGroup}>
                  <span className={styles.statBoxValue}>{notasStats.corrigidas}</span>
                </div>
                <span className={styles.statBoxSub}>de {totalAlunos}</span>
              </div>
            </div>
          </div>

          <h3 className={styles.sectionTitle}>Desempenho da turma</h3>
          <div className={styles.desempenhoCard}>
            <div className={styles.desempenhoHeader}>
              <span>Média geral da turma</span>
              <span><strong style={{color: '#DA9E00'}}>{notasStats.media}</strong> / 1000</span>
            </div>
            <div className={styles.progressBarBg}>
              <div className={styles.progressBarFill} style={{width: pctMedia}}></div>
            </div>
            <div className={styles.progressText}>{pctMedia}</div>
          </div>

          <h3 className={styles.sectionTitle}>Notas por faixa</h3>
          <div className={styles.faixasGrid}>
            <div className={styles.faixaBox}>
              <span className={styles.faixaTitle} style={{color: '#22c55e'}}>0 - 399</span>
              <span className={styles.faixaAlunos}>{notasStats.faixa1} alunos</span>
              <span className={styles.faixaPct}>{calcPercentual(notasStats.faixa1)}</span>
            </div>
            <div className={styles.faixaBox}>
              <span className={styles.faixaTitle} style={{color: '#DA9E00'}}>400 - 599</span>
              <span className={styles.faixaAlunos}>{notasStats.faixa2} alunos</span>
              <span className={styles.faixaPct}>{calcPercentual(notasStats.faixa2)}</span>
            </div>
            <div className={styles.faixaBox}>
              <span className={styles.faixaTitle} style={{color: '#3b82f6'}}>600 - 799</span>
              <span className={styles.faixaAlunos}>{notasStats.faixa3} alunos</span>
              <span className={styles.faixaPct}>{calcPercentual(notasStats.faixa3)}</span>
            </div>
            <div className={styles.faixaBox}>
              <span className={styles.faixaTitle} style={{color: '#a855f7'}}>800 - 1000</span>
              <span className={styles.faixaAlunos}>{notasStats.faixa4} alunos</span>
              <span className={styles.faixaPct}>{calcPercentual(notasStats.faixa4)}</span>
            </div>
          </div>

          <button className={styles.relatorioBtn}>
            <i className="fa-solid fa-chart-line"></i> Ver relatório completo
            <i className="fa-solid fa-chevron-right" style={{marginLeft: 'auto'}}></i>
          </button>
        </div>

        {/* Right Side: Registrar Notas */}
        <div className={styles.registrarColumn}>
          <div className={styles.registrarHeader}>
            <div className={styles.registrarIcon}>
              <i className="fa-solid fa-pen-to-square"></i>
            </div>
            <h2 className={styles.registrarTitle}>Registrar notas</h2>
          </div>
          <p className={styles.registrarSubtitle}>Alunos que ainda não tiveram notas registradas ({alunosSemNotas.length})</p>
          
          <div className={styles.registrarFilters}>
            <div className={styles.searchInput}>
              <i className="fa-solid fa-magnifying-glass"></i>
              <input 
                type="text" 
                placeholder="Buscar aluno..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select className={styles.sortSelect}>
              <option>Ordenar: A - Z</option>
            </select>
            <button className={styles.viewBtn}>
              <i className="fa-solid fa-list"></i>
            </button>
          </div>

          <div className={styles.alunosList}>
            {currentAlunosSemNota.length > 0 ? (
              currentAlunosSemNota.map(aluno => (
                <div key={aluno.id} className={styles.alunoCard}>
                  <div className={styles.alunoInfo}>
                    <div className={styles.alunoAvatar}>
                      {aluno.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className={styles.alunoNome}>{aluno.nome}</h4>
                      <p className={styles.alunoEmail}>{aluno.email || "aluno@email.com"}</p>
                    </div>
                  </div>
                  <button 
                    className={styles.btnRegistrarNota}
                    onClick={() => abrirModalNotas(aluno.id, aluno.nome)}
                  >
                    <i className="fa-solid fa-pen"></i> Registrar nota
                  </button>
                </div>
              ))
            ) : (
              <div className={styles.concluidoMensagem}>
                {search ? "Nenhum aluno encontrado na busca." : "✅ Todos os alunos tiveram notas registradas."}
              </div>
            )}
          </div>

          {filteredAlunosSemNota.length > itemsPerPage && (
            <div className={styles.paginationWrapper}>
              <Pagination
                currentPage={currentPage}
                totalItems={filteredAlunosSemNota.length}
                itemsPerPage={itemsPerPage}
                setCurrentPage={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>

      {mostrarModal && alunoSelecionado && (
        <ModalRegistrarNotas
          isOpen={mostrarModal}
          onClose={() => setMostrarModal(false)}
          onSave={handleSalvarSimulado}
          aluno={alunoSelecionado}
          nameSimulado={nomeSimulado ? [nomeSimulado] : []}
          simuladoId={simulado_id}
        />
      )}
    </div>
  );
}

export default NotasSimulados;
