import styles from "../Pagamentos/styles.module.css";
import Card from "../../../components/CardPagamento/Card";
import Table from "../../../components/Table/table";
import Title from "../../../components/Title/Title";
import CardDash from "../../../components/CardDash/CardDash";
import { useState, useEffect, useMemo } from "react";
import Input from "../../../components/Input/Input";
import Button from "../../../components/Button/Button";
import { useNavigate } from "react-router-dom";
import fetchData from "../../../utils/fetchData";
import DespesaModal from "../../../components/ModalRegistrarPG/DespesaModal";

const Pagamentos = () => {
  const [alunos, setAlunos] = useState([]);
  const navigate = useNavigate();
  const [dataPagamentos, setDataPagamentos] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const Pagamentos = async () => {
      const { getPagamentos } = fetchData();
      const response = await getPagamentos();
      setDataPagamentos(response);
    };
    Pagamentos();
  }, []);

  // Cálculos
  const totalRecebido = dataPagamentos
    .filter((p) => p.status === "ENTRADA")
    .reduce((acc, curr) => acc + curr.valor, 0);

  const totalDespesas = dataPagamentos
    .filter((p) => p.status === "SAÍDA" || p.status === "SAIDA")
    .reduce((acc, curr) => acc + curr.valor, 0);

  const lucro = totalRecebido - totalDespesas;

  const handleResultados = () => {
    console.log("Acesso aos graficos");
    navigate(`/admin/gerenciar-pagamentos`);
  };

  // Filtro aplicado ao campo de busca
  const pagamentosFiltrados = useMemo(() => {
    if (!search) return dataPagamentos;
    return dataPagamentos.filter((p) =>
      p.tipoDespensa?.toLowerCase().includes(search.toLowerCase()) ||
      p.status?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, dataPagamentos]);

  return (
    <div className={styles.container}>
      <Title title="Pagamentos" />

      <div className={styles.main_content}>
        <div className={styles.container_pag}>
          <h1>Financeiro</h1>
          <p> Acompanhe pagamentos, receitas e mensalidades dos alunos</p>
          <div className={styles.CardDashs_container}>
            <CardDash
              title="Total Recebido"
              content={"R$" + totalRecebido.toFixed(2)}
              titleColor="#ffffff"
              contentColor="#ffffff"
              color="#1A1A1A"
              fontSize="20px"
              icon={
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 19.9999C21 18.2583 19.3304 16.7767 17 16.2275M15 20C15 17.7909 12.3137 16 9 16C5.68629 16 3 17.7909 3 20M15 13C17.2091 13 19 11.2091 19 9C19 6.79086 17.2091 5 15 5M9 13C6.79086 13 5 11.2091 5 9C5 6.79086 6.79086 5 9 5C11.2091 5 13 6.79086 13 9C13 11.2091 11.2091 13 9 13Z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            />
            <CardDash
              title="Total de Despesa"
              content={"R$" + totalDespesas.toFixed(2)}
              titleColor="#ffffff"
              contentColor="#ffffff"
              color="#1A1A1A"
              fontSize="20px"
              icon={
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 19.9999C21 18.2583 19.3304 16.7767 17 16.2275M15 20C15 17.7909 12.3137 16 9 16C5.68629 16 3 17.7909 3 20M15 13C17.2091 13 19 11.2091 19 9C19 6.79086 17.2091 5 15 5M9 13C6.79086 13 5 11.2091 5 9C5 6.79086 6.79086 5 9 5C11.2091 5 13 6.79086 13 9C13 11.2091 11.2091 13 9 13Z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            />
            <CardDash
              title="Lucro"
              content={"R$" + lucro.toFixed(2)}
              titleColor="#ffffff"
              contentColor="#ffffff"
              color="#1A1A1A"
              fontSize="20px"
              icon={
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 19.9999C21 18.2583 19.3304 16.7767 17 16.2275M15 20C15 17.7909 12.3137 16 9 16C5.68629 16 3 17.7909 3 20M15 13C17.2091 13 19 11.2091 19 9C19 6.79086 17.2091 5 15 5M9 13C6.79086 13 5 11.2091 5 9C5 6.79086 6.79086 5 9 5C11.2091 5 13 6.79086 13 9C13 11.2091 11.2091 13 9 13Z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            />
          </div>
          <div className={styles.container_search}>
            <Input
              placeholder="Pesquisar"
              value={search}
              color="#1A1A1A"
              onChange={(e) => setSearch(e.target.value)}
            >
              <i className="fa-solid fa-magnifying-glass"></i>
            </Input>
            <div className={styles.buttons_container}>
              <Button
                bg_color="#DA9E00"
                color="#ffffff"
                height_size="50px"
                width_size="100%"
                padding_sz="10px"
                onClick={() => setIsOpen(true)}
              >
                <i className="fa-solid fa-plus"></i>
                Registrar Pagamento
              </Button>
              <Button
                bg_color="#fb8500"
                color="#ffffff"
                height_size="50px"
                width_size="100%"
                padding_sz="10px"
                onClick={handleResultados}
              >
                <i className="fa-solid fa-chart-line"></i>
                Análise Gráfica
              </Button>
            </div>
          </div>
          <div className={styles.container_table}>
            <Table dados={pagamentosFiltrados} />
          </div>
          <DespesaModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default Pagamentos;
