import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../Simulados/styles.module.css";
import Title from "../../../components/Title/Title";
import SimuladosCard from "../../../components/SimuladoCard/SimuladoCard";
import Button from "../../../components/Button/Button";
import fetchData from "../../../utils/fetchData";
import { useNavigate } from "react-router-dom";
import DetailsCard from "../../../components/DetailsCard/DetailsCard";
import Input from "../../../components/Input/Input";
import Pagination from "../../../components/Pagination/Pagination";
import Message from "../../../components/Message/Message";
import useUseful from "../../../utils/useUseful";
const baseURL = import.meta.env.VITE_API_BASE_URL

const Simulados = () => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [turma, setTurma] = useState("");
  const [titulo, setTitulo] = useState("");
  const [search, setSearch] = useState("");
  const [formMessage, setFormMessage] = useState(null);

  const [TotalSimulados, setTotalSimulados] = useState([]);
  const [turmasDisponiveis, setTurmasDisponiveis] = useState([]);
  const [turmasComSimulado, setTurmasComSimulado] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;
  const { getHeaders } = useUseful();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!turma || !titulo.trim()) {
      alert("Selecione uma turma e digite um título para o simulado");
      return;
    }

    try {
      const response = await axios.post(
        `${baseURL}/simulados`,
        {
          turmaId: turma,
          titulo: titulo,
        },
        { headers: getHeaders() }
      );

      setFormMessage({
        type: "success",
        text: `Simulado "${response.data.data.titulo}" criado com sucesso.`,
      });

      setTitulo("");
      setTurma("");
      await getDataSimulados();
    } catch (error) {
      console.error("Erro ao registrar simulado", error);
      setFormMessage({
        type: "error",
        text: error.response?.data?.error || "Erro desconhecido.",
      });
    }
  };

  const simuladosFiltrados = TotalSimulados.filter(
    (item) =>
      item.titulo.toLowerCase().includes(search.toLowerCase()) ||
      item.nomeTurma.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSimulados = simuladosFiltrados.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Carrega todas as turmas disponíveis (para o select)
  useEffect(() => {
    const getData = async () => {
      const { getTurmas } = fetchData();
      const response = await getTurmas();
      const options = response.map((item) => ({
        id: item.id,
        nome: item.nome,
      }));
      setTurmasDisponiveis(options);
    };
    getData();
  }, []);

  const handleResultados = (simuladoId) => {
    if (!simuladoId) {
      console.error("ID do simulado está indefinido!");
      return;
    }
    navigate(`/admin/Simulados/${simuladoId}`);
  };

  const getDataSimulados = async () => {
    const { getSimulados, getTurmaById } = fetchData();
    const response = await getSimulados();

    const turmaIdsUnicos = [...new Set(response.map((turma) => turma.turmaId))];
    const turmasCompletas = await Promise.all(
      turmaIdsUnicos.map((id) => getTurmaById(id))
    );

    const turmaMap = {};
    turmasCompletas.forEach((turma) => {
      turmaMap[turma.id] = turma;
    });

    const opctions = response
      .map((item) => ({
        id: item.id,
        titulo: item.titulo,
        data: item.data,
        turmaId: item.turmaId,
        nomeTurma: turmaMap[item.turmaId]?.nome || "Sem nome",
        totalAlunos: turmaMap[item.turmaId]?.usuarios?.length || 0,
      }))
      .sort((a, b) => new Date(b.data) - new Date(a.data));

    setTotalSimulados(opctions);
    setTurmasComSimulado(turmasCompletas); // usado só para estatísticas
  };

  useEffect(() => {
    getDataSimulados();
  }, []);

  const formatarData = (data) => {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-BR");
  };

  return (
    <div className={styles.container}>
      <Title title="Simulado" />
      <div className={styles.main_content}>
        <div className={styles.bg_left}>
          <h2 style={{ textAlign: "center", marginBottom: "0px" }}>
            SIMULADOS REGISTRADOS
          </h2>
          <DetailsCard
            title="TOTAL DE SIMULADOS"
            content={TotalSimulados.length}
            bg_color="#1A1A1A"
          />
          <DetailsCard
            title="TOTAL DE TURMAS"
            content={turmasComSimulado.length}
            bg_color="#1A1A1A"
          />
          <Input
            placeholder="PESQUISAR SIMULADO"
            value={search}
            color="#1A1A1A"
            onChange={(e) => setSearch(e.target.value)}
          >
            <i className="fa-solid fa-magnifying-glass"></i>
          </Input>

          <div className={styles.CardSimulados}>
            {currentSimulados.map((item) => (
              <SimuladosCard
                key={item.id}
                titulo={item.titulo}
                data={formatarData(item.data)}
                status={item.status}
                participantes={item.totalAlunos}
                turmas={item.nomeTurma}
                color="#1A1A1A"
                onRegistrarResultados={() => handleResultados(item.id)}
              />
            ))}
          </div>

          <div className={styles.pagination}>
            <Pagination
              currentPage={currentPage}
              totalItems={simuladosFiltrados.length}
              itemsPerPage={itemsPerPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
        </div>

        <div className={styles.bg_right}>
          <div className={styles.form}>
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
              CADASTRAR SIMULADO
            </h2>
            <Input
              placeholder="Adicione um título para o simulado"
              value={titulo}
              color="#1A1A1A"
              onChange={(e) => setTitulo(e.target.value)}
            >
              <i className="fa-solid fa-pencil"></i>
            </Input>
          </div>

          <div className={styles.SelectTurma}>
            <select
              placeholder="Selecione uma turma"
              value={turma}
              onChange={(e) => setTurma(e.target.value)}
            >
              <option value="">Selecione uma turma</option>
              {turmasDisponiveis.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
          </div>

          <Button
            text_size="20px"
            text_color="#E0E0E0"
            padding_sz="10px"
            bg_color="#DA9E00"
            onClick={handleSubmit}
          >
            CADASTRAR
          </Button>

          <Message
            text={formMessage ? formMessage.text : ""}
            type={formMessage ? formMessage.type : ""}
          />
        </div>
      </div>
    </div>
  );
};

export default Simulados;
