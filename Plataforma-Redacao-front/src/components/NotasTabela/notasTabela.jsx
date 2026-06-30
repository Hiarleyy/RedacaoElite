import styles from "./styles.module.css";
import Button from "../Button/Button";
import { useEffect, useState } from "react";
import fetchData from "../../utils/fetchData";
import ModalDetalhesNotas from "../ModalDetalhesNotas/ModalDetalhesNotas";

const NotasTabela = ({ SimuladoId }) => {
  const [alunos, setAlunos] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);

  useEffect(() => {
    const DataSimulado = async () => {
      try {
        const { getNotasbySimuladoId, getAlunoById } = fetchData();
        const response = await getNotasbySimuladoId(SimuladoId);

        const nomesAlunos = await Promise.all(
          response.map(async (aluno) => {
            try {
              const res = await getAlunoById(aluno.usuarioId);
              return res?.nome;
            } catch (error) {
              console.error(`Erro ao buscar aluno ${aluno.usuarioId}`, error);
              return "Aluno não encontrado";
            }
          })
        );

        const dados = response.map((aluno, index) => ({
          ...aluno,
          nome: nomesAlunos[index] || "Aluno não encontrado",
        }));

        setAlunos(dados);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    DataSimulado();
  }, [SimuladoId]);

  const handleDetalhes = (aluno) => {
    setAlunoSelecionado(aluno);
    setMostrarModal(true);
  };

  const fecharModal = () => {
    setMostrarModal(false);
    setAlunoSelecionado(null);
  };


  return (
    <div className={styles.tabela_container}>
      <table className={styles.tabela}>
        <thead>
          <tr>
            <th className={styles.cabecalho}>Nome do Aluno</th>
            <th className={styles.cabecalho}>Nota Final</th>
            <th className={styles.cabecalho}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {alunos.map((aluno, index) => (
            <tr key={index}>
              <td className={styles.celula}>{aluno.nome}</td>
              <td className={styles.celula}>{aluno.notaGeral}</td>
              <td className={styles.celula}>
                <Button
                  text_size="20px"
                  text_color="#E0E0E0"
                  padding_sz="10px"
                  bg_color="#4A8F4A"
                  width_size="50px"
                  height_size="40px"
                  radius="6px"
                  onClick={() => handleDetalhes(aluno)}
                >
                  <i className="fa-solid fa-eye"></i>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal com os detalhes do aluno */}
      {mostrarModal && alunoSelecionado && (
        <ModalDetalhesNotas
          isOpen={mostrarModal}
          aluno={alunoSelecionado}
          onClose={fecharModal}
        />
      )}
    </div>
  );
};

export default NotasTabela;
