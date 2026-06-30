import { useParams } from "react-router-dom";
import styles from "./styles.module.css";
import Title from "../../../components/Title/Title";
import Input from "../../../components/Input/Input";
import { useState } from "react";
import InfoCard from "../../../components/InfoCard/InfoCard";
import { useEffect } from "react";
import fetchData from "../../../utils/fetchData";
import ModalRegistrarNotas from "../../../components/ModalRegistrarNotas/ModalRegistrarNotas";
import DetailsCard from "../../../components/DetailsCard/DetailsCard";
import NotasTabela from "../../../components/NotasTabela/notasTabela";
import Pagination from "../../../components/Pagination/Pagination";


function NotasSimulados() {
  const { simulado_id } = useParams();
  const [search, setSearch] = useState("");
  const [alunos, setAlunos] = useState([]);
  const [pesquisa, setPesquisa] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [turma, setTurma] = useState([]);
  const [aluno, setAluno] = useState([]);
  const [nomeSimulado, setNomeSimulado] = useState([]);
  const [nomeTurma, setNomeTurma] = useState([]);
  const [dataSimulado, setDataSimulado] = useState([]);
  const [alunosSemNotas, setAlunosSemNotas] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAlunosSemNota = alunosSemNotas.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const getAlunos = async (busca) => {
    const { getAlunos } = fetchData();
    const response = await getAlunos(busca);
    setPesquisa(response);
  };
  useEffect(() => {
    setCurrentPage(1);

    if (search === "") {
      getAlunos();
    } else {
      getAlunos(search);
    }
  }, [search]);

  useEffect(() => {
    const Data = async () => {
      const { getSimuladoById, getTurmaById, getNotasbySimuladoId } = fetchData();
      const response = await getSimuladoById(simulado_id);
      const turma = response.map((turma) => turma.turmaId);
      const NomeSimulado = response.map((simulado) => simulado.titulo);
      const responseTurma = await getTurmaById(turma);
      const notasAlunosSimulado = await getNotasbySimuladoId(simulado_id);

      const alunosComNotas = notasAlunosSimulado.map((notas) =>
        String(notas.usuarioId)
      );

      const todosAlunos = responseTurma.usuarios;
      const semNotasAlunos = todosAlunos.filter(
        (aluno) => !alunosComNotas.includes(String(aluno.id))
      );

      setAlunos(todosAlunos);
      setNomeSimulado(NomeSimulado);
      setNomeTurma(responseTurma.nome);
      setDataSimulado(response[0].data);
      setAlunosSemNotas(semNotasAlunos);
    };

    Data();
  }, [simulado_id]); 

  function ModalNotas(alunoId, alunoNome) {
    setMostrarModal(true);
    const aluno = { id: alunoId, name: alunoNome };
    setAluno(aluno);
  }
  const handleSalvarSimulado = async () => {
    setMostrarModal(false);
    // Refresh the data to update the students list
    try {
      const { getSimuladoById, getTurmaById, getNotasbySimuladoId } = fetchData();
      const response = await getSimuladoById(simulado_id);
      const turma = response.map((turma) => turma.turmaId);
      const responseTurma = await getTurmaById(turma);
      const notasAlunosSimulado = await getNotasbySimuladoId(simulado_id);

      const alunosComNotas = notasAlunosSimulado.map((notas) =>
        String(notas.usuarioId)
      );

      const todosAlunos = responseTurma.usuarios;
      const semNotasAlunos = todosAlunos.filter(
        (aluno) => !alunosComNotas.includes(String(aluno.id))
      );

      setAlunosSemNotas(semNotasAlunos);
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
    }
  };

  const formatarData = (data) => {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-BR");
  };
  return (
    <div className={styles.container}>
      <Title title="Notas do Simulado" />
      <div className={styles.main_content}>
        <div className={styles.bg_left}>
          <DetailsCard
            title="Título do Simulado"
            content={nomeSimulado && nomeSimulado[0]}
            bg_color="#1A1A1A"
          />
          <DetailsCard title="Turma" content={nomeTurma} bg_color="#1A1A1A" />
          <DetailsCard
            title="Data"
            content={formatarData(dataSimulado)}
            bg_color="#1A1A1A"
          />
          <NotasTabela SimuladoId={simulado_id} />
        </div>

        <div className={styles.bg_right}>
          <p className={styles.form_title}>Registrar Notas </p>
          {alunosSemNotas.length > 0 ? (
            <>
              <p className={styles.form_subtitle}>
                Lista de alunos que faltam registrar as notas:
              </p>
              <div className={styles.alunos_container}>
                {currentAlunosSemNota.map((aluno) => (
                  <InfoCard
                    key={aluno.id}
                    img="https://cdn-icons-png.flaticon.com/512/219/219969.png"
                    title={aluno.nome}
                    subtitle={aluno.email}
                    button={false}
                    button_registrar={true}
                    onClick={() => ModalNotas(aluno.id, aluno.nome)}
                  />
                ))}
              </div>
              <div className={styles.pagination}>
                <Pagination
                  currentPage={currentPage}
                  totalItems={alunosSemNotas.length}
                  itemsPerPage={itemsPerPage}
                  setCurrentPage={setCurrentPage}
                />
              </div>
            </>
          ) : (
            <div className={styles.concluido}>
              <h3>✅ Todos os alunos tiveram notas registradas.</h3>
            </div>
          )}
        </div>

        <div>
          <ModalRegistrarNotas
            isOpen={mostrarModal}
            onClose={() => setMostrarModal(false)}
            onSave={handleSalvarSimulado}
            aluno={aluno}
            nameSimulado={nomeSimulado}
            simuladoId={simulado_id}
          />
        </div>
      </div>
    </div>
  );
}

export default NotasSimulados;
