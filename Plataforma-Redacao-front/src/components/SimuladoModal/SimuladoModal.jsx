import React, { useEffect, useState } from 'react';
import styles from './styles.module.css';
import fetchData from '../../utils/fetchData';
import Button from '../Button/Button';

const SimuladoModal = ({ simulado, isOpen, onClose, brasilFormatData }) => {
  const [turmaInfo, setTurmaInfo] = useState(null);
  const [notasSimulado, setNotasSimulado] = useState([]);
  const [notaAluno, setNotaAluno] = useState(null);
  const [loading, setLoading] = useState(false);

  const getAlunoId = () => {
    const aluno = localStorage.getItem('user_access_data')
    const { id } = JSON.parse(aluno)
    return id
  }

  useEffect(() => {
    if (isOpen && simulado) {
      fetchSimuladoDetails();
    }
  }, [isOpen, simulado]);  const fetchSimuladoDetails = async () => {
    try {
      setLoading(true);
      const { getTurmaById, getNotasbySimuladoId, getNotaSimulados } = fetchData();
      const alunoId = getAlunoId();
      
      // Buscar informações da turma
      if (simulado.turmaId) {
        const turmaData = await getTurmaById(simulado.turmaId);
        setTurmaInfo(turmaData);
      }

      // Se o simulado já tem informações processadas (da página Inicio), usar elas
      if (simulado.totalAlunos !== undefined && simulado.realizou !== undefined) {
        // Usar dados já processados
        setNotasSimulado([]); // Array vazio já que não precisamos das notas individuais
        
        // Se o aluno realizou, criar objeto de nota baseado nas informações disponíveis
        if (simulado.realizou && simulado.notaAluno) {
          // Buscar detalhes completos da nota apenas se necessário
          try {
            const todasAsNotas = await getNotaSimulados();
            if (todasAsNotas && Array.isArray(todasAsNotas)) {
              const notaCompleta = todasAsNotas.find(nota => 
                nota.usuarioId === alunoId && nota.simuladoId === simulado.id
              );
              setNotaAluno(notaCompleta || null);
            }
          } catch (error) {
            // Se não conseguir buscar, criar um objeto básico com a nota
            setNotaAluno({
              notaGeral: simulado.notaAluno,
              usuarioId: alunoId,
              simuladoId: simulado.id
            });
          }
        } else {
          setNotaAluno(null);
        }
      } else {
        // Buscar todas as notas do simulado (modo original)
        try {
          const notas = await getNotasbySimuladoId(simulado.id);
          setNotasSimulado(notas);
        } catch (error) {
          setNotasSimulado([]);
        }

        // Buscar nota específica do aluno
        try {
          const todasAsNotas = await getNotaSimulados();
          if (todasAsNotas && Array.isArray(todasAsNotas)) {
            const notaDoSimulado = todasAsNotas.find(nota => 
              nota.usuarioId === alunoId && nota.simuladoId === simulado.id
            );
            setNotaAluno(notaDoSimulado || null);
          } else {
            setNotaAluno(null);
          }
        } catch (error) {
          console.log('Erro ao buscar notas do aluno:', error);
          setNotaAluno(null);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do simulado:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularEstatisticas = () => {
    // Se o simulado já tem informações processadas (da página Inicio), usar elas
    if (simulado.totalAlunos !== undefined) {
      // Usar dados já disponíveis do simulado processado
      const participantes = simulado.totalAlunos;
      
      // Para estatísticas mais detalhadas, usar notasSimulado se disponível
      if (notasSimulado.length > 0) {
        const notas = notasSimulado.map(n => n.notaGeral);
        const mediaGeral = (notas.reduce((acc, nota) => acc + nota, 0) / participantes).toFixed(1);
        const maiorNota = Math.max(...notas);
        const menorNota = Math.min(...notas);
        
        return {
          participantes,
          mediaGeral,
          maiorNota,
          menorNota
        };
      } else {
        // Se não temos notas detalhadas, retornar apenas participantes
        return {
          participantes,
          mediaGeral: simulado.notaAluno || 0,
          maiorNota: simulado.notaAluno || 0,
          menorNota: simulado.notaAluno || 0
        };
      }
    }
    
    // Modo original - calcular a partir das notas do simulado
    if (notasSimulado.length === 0) {
      return {
        participantes: 0,
        mediaGeral: 0,
        maiorNota: 0,
        menorNota: 0
      };
    }

    const notas = notasSimulado.map(n => n.notaGeral);
    const participantes = notasSimulado.length;
    const mediaGeral = (notas.reduce((acc, nota) => acc + nota, 0) / participantes).toFixed(1);
    const maiorNota = Math.max(...notas);
    const menorNota = Math.min(...notas);

    return {
      participantes,
      mediaGeral,
      maiorNota,
      menorNota
    };
  };

  if (!isOpen || !simulado) return null;

  const estatisticas = calcularEstatisticas();

  return (
    <div className={styles.modal_overlay} onClick={onClose}>
      <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modal_header}>
          <h2>{simulado.titulo}</h2>
          <button className={styles.close_button} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.modal_body}>
          {loading ? (
            <div className={styles.loading}>Carregando informações...</div>
          ) : (
            <>
              <div className={styles.info_section}>
                <h3>Informações Gerais</h3>
                <div className={styles.info_grid}>
                  <div className={styles.info_item}>
                    <span className={styles.label}>📅 Data:</span>
                    <span className={styles.value}>{brasilFormatData(simulado.data)}</span>
                  </div>                  <div className={styles.info_item}>
                    <span className={styles.label}>📝 Status:</span>
                    <span className={styles.value}>
                      {(simulado.realizou !== undefined ? simulado.realizou : !!notaAluno) ? 'Realizado' : 'Não Realizado'}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.stats_section}>
                <h3>Estatísticas de Participação</h3>
                <div className={styles.stats_grid}>
                  <div className={styles.stat_card}>
                    <span className={styles.stat_number}>{estatisticas.participantes}</span>
                    <span className={styles.stat_label}>Participantes</span>
                  </div>
                  <div className={styles.stat_card}>
                    <span className={styles.stat_number}>{estatisticas.mediaGeral}</span>
                    <span className={styles.stat_label}>Média Geral</span>
                  </div>
                  <div className={styles.stat_card}>
                    <span className={styles.stat_number}>{estatisticas.maiorNota}</span>
                    <span className={styles.stat_label}>Maior Nota</span>
                  </div>                  
                    <div className={styles.stat_card}>
                    <span className={styles.stat_number}>
                      {notaAluno ? notaAluno.notaGeral : (simulado.notaAluno || 'N/A')}
                    </span>
                    <span className={styles.stat_label}>Sua Nota</span>
                  </div>
                </div>
              </div>                <div className={styles.nota_container}>
                <h3>Seu Desempenho no Simulado</h3>
                    <div className={styles.nota_info}>
                {(notaAluno || (simulado.realizou && simulado.notaAluno)) ? (
                  <div className={styles.competencias}>
                    {notaAluno && notaAluno.competencia01 !== undefined ? (
                      <>
                        <p>Competência 1: {notaAluno.competencia01}</p>
                        <p>Competência 2: {notaAluno.competencia02}</p>
                        <p>Competência 3: {notaAluno.competencia03}</p>
                        <p>Competência 4: {notaAluno.competencia04}</p>
                        <p>Competência 5: {notaAluno.competencia05}</p>
                        <h4>Nota Final: {notaAluno.notaGeral}</h4>
                      </>
                    ) : (
                      <div className={styles.nota_basica}>
                        <h4>✅ Simulado Realizado!</h4>
                        <p>Sua nota final: <strong>{notaAluno?.notaGeral || simulado.notaAluno}</strong></p>
                        <p><em>Detalhes das competências não disponíveis no momento.</em></p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles.sem_nota}>
                    <p>Você ainda não realizou este simulado.</p>
                  </div>
                )}
              </div>

                </div>
            
                
            </>
          )}
        </div>

        <div className={styles.modal_footer}>
          <Button
            bg_color="#DA9E00"
            text_color="#000"
            padding_sz="10px 20px"
            onClick={onClose}
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SimuladoModal;
