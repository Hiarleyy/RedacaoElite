import CardDash from "../../../components/CardDash/CardDash";
import Title from "../../../components/Title/Title";
import styles from "./styles.module.css";
import { useEffect, useState } from "react";
import Taggle from "../../../components/Taggle/Taggle";
import GraficoLinha from "../../../components/GraficoDeLinhaPagamentos/GraficoDeLinhaPagamentos";
import GraficoBarLinhas from "../../../components/GraficoBarLinha/GraficoBarLinha";
import GraficoBarrasPagamentos from "../../../components/GraficoBarraPagamentos/GraficoBarraPagamentos";
import FinancialCard from "../../../components/FinanciaCard/FinanciaCard";
import fetchData from "../../../utils/fetchData";

const baseURL = import.meta.env.VITE_API_BASE_URL

const GerenciaPagamentos = () => {
  const [taggle, setTaggle] = useState("Análise Geral");
  const [dataPagamentos, setDataPagamentos] = useState([]);

  const Graficos = (DadosBrutos) => {
    const meses = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];
    const agrupado = {};

    DadosBrutos.forEach((item) => {
      const data = new Date(item.dataPagamento);
      const mes = meses[data.getMonth()];

      if (!agrupado[mes]) {
        agrupado[mes] = { entrada: 0, saida: 0 };
      }

      if (item.status === "ENTRADA") {
        agrupado[mes].entrada += item.valor;
      } else if (item.status === "SAÍDA" || item.status === "SAIDA") {
        agrupado[mes].saida += item.valor;
      }
    });

    const resultado = meses.map((mes) => {
      const entrada = agrupado[mes]?.entrada || 0;
      const saida = agrupado[mes]?.saida || 0;

      return {
        mes,
        entrada,
        saida,
        saldo: entrada - saida,
      };
    });

    return resultado;
  };

  // grafico distribuição de despesas
  const GraficoDespensas = (DadosBrutos) => {
    const categorias = {};


    DadosBrutos.forEach((item) => {
      const categoria = item.tipoDespensa;
 
      if (item.status === "SAÍDA" || item.status === "SAIDA") {
        if (!categorias[categoria]) {
          categorias[categoria] = 0;
        }
        categorias[categoria] += item.valor;
      }
    });
    console.log(categorias);

    
    const categoriasArray = Object.entries(categorias)
      .map(([categoria, valor]) => ({ categoria, valor }))
      .sort((a, b) => b.valor - a.valor);

    // Paleta de cores para as categorias
    const cores = [
      "#ef4444",
      "#f97316",
      "#70e000",
      "#004e98",
      "#10b981",
      "#3b82f6",
    ];

    return categoriasArray.map((item, index) => ({
      ...item,
      cor: cores[index % cores.length], // Cicla pelas cores disponíveis
    }));
  };

  const GraficoCard = (dados) => {
    const meses = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];

    const agrupadoPorMes = {};
    dados.forEach(({ dataPagamento, status, tipoDespensa, valor }) => {
      const data = new Date(dataPagamento);
      const mesAno = `${meses[data.getMonth()]}/${data.getFullYear()}`;

      if (!agrupadoPorMes[mesAno]) {
        agrupadoPorMes[mesAno] = {
          mes: mesAno,
          faturamento: 0,
          totalDespesas: 0,
          resultado: 0,
          itensDespesas: [],
        };
      }

      if (status === "ENTRADA") {
        agrupadoPorMes[mesAno].faturamento += valor;
      }
      if (status === "SAÍDA" || status === "SAIDA") {
        agrupadoPorMes[mesAno].totalDespesas += valor;
        agrupadoPorMes[mesAno].itensDespesas.push({ tipoDespensa, valor });
      }

      agrupadoPorMes[mesAno].resultado =
        agrupadoPorMes[mesAno].faturamento -
        agrupadoPorMes[mesAno].totalDespesas;
    });
    return Object.values(agrupadoPorMes);
  };

  useEffect(() => {
    const Pagamentos = async () => {
      const { getPagamentos } = fetchData();
      const response = await getPagamentos();
      setDataPagamentos(response);
    };
    Pagamentos();
  }, []);

  const dados = Graficos(dataPagamentos);
  const dadosGraficoBar = GraficoDespensas(dataPagamentos);
  const dadosGraficoCard = GraficoCard(dataPagamentos);
  
  const mesesOrdem = {
    Janeiro: 0,
    Fevereiro: 1,
    Março: 2,
    Abril: 3,
    Maio: 4,
    Junho: 5,
    Julho: 6,
    Agosto: 7,
    Setembro: 8,
    Outubro: 9,
    Novembro: 10,
    Dezembro: 11,
  };

  const dadosOrdenados = [...dadosGraficoCard].sort((a, b) => {
    const [mesA, anoA] = a.mes.split("/");
    const [mesB, anoB] = b.mes.split("/");

    if (anoA !== anoB) return parseInt(anoA) - parseInt(anoB);
    return mesesOrdem[mesA] - mesesOrdem[mesB];
  });

  // Cálculos
  const totalRecebido = dataPagamentos
    .filter((p) => p.status === "ENTRADA")
    .reduce((acc, curr) => acc + curr.valor, 0);

  const totalDespesas = dataPagamentos
    .filter((p) => p.status === "SAÍDA" || p.status === "SAIDA")
    .reduce((acc, curr) => acc + curr.valor, 0);

  const lucro = totalRecebido - totalDespesas;

  return (
    <div className="container">
      <Title title="Análise de Pagamentos" />
      <div className={styles.main_content}>
        <div className={styles.container_pag}>
          <h1>Controle Financeiro</h1>
          <p> Acompanhe sua saúde financeira</p>
          <div className={styles.CardDashs_container}>
            <CardDash
              title="Total Recebido"
              content={'R$ ' + totalRecebido}
              titleColor="#ffffff"
              contentColor="#ffffff"
              color="#1A1A1A"
              fontSize="20px"
              icon={
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 19.9999C21 18.2583 19.3304 16.7767 17 16.2275M15 20C15 17.7909 12.3137 16 9 16C5.68629 16 3 17.7909 3 20M15 13C17.2091 13 19 11.2091 19 9C19 6.79086 17.2091 5 15 5M9 13C6.79086 13 5 11.2091 5 9C5 6.79086 6.79086 5 9 5C11.2091 5 13 6.79086 13 9C13 11.2091 11.2091 13 9 13Z"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              }
            />
            <CardDash
              title="Total de Despesas"
              content={'R$ ' + totalDespesas}
              titleColor="#ffffff"
              contentColor="#ffffff"
              color="#1A1A1A"
              fontSize="20px"
              icon={
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 19.9999C21 18.2583 19.3304 16.7767 17 16.2275M15 20C15 17.7909 12.3137 16 9 16C5.68629 16 3 17.7909 3 20M15 13C17.2091 13 19 11.2091 19 9C19 6.79086 17.2091 5 15 5M9 13C6.79086 13 5 11.2091 5 9C5 6.79086 6.79086 5 9 5C11.2091 5 13 6.79086 13 9C13 11.2091 11.2091 13 9 13Z"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              }
            />
            <CardDash
              title="Lucro"
              content={'R$ ' + lucro}
              titleColor="#ffffff"
              contentColor="#ffffff"
              color="#1A1A1A"
              fontSize="20px"
              icon={
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 19.9999C21 18.2583 19.3304 16.7767 17 16.2275M15 20C15 17.7909 12.3137 16 9 16C5.68629 16 3 17.7909 3 20M15 13C17.2091 13 19 11.2091 19 9C19 6.79086 17.2091 5 15 5M9 13C6.79086 13 5 11.2091 5 9C5 6.79086 6.79086 5 9 5C11.2091 5 13 6.79086 13 9C13 11.2091 11.2091 13 9 13Z"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              }
            />
          </div>
          <div className={styles.taggle}>
            <Taggle
              data1="Análise Geral"
              data2="Análise Mensal"
              setTaggle={setTaggle}
              taggle_manual={"Análise Geral"}
            />
          </div>
          <div className={styles.container_Grafico}>
            {taggle === "Análise Geral" && (
              <div className={styles.container_GraficoGeral}>
                <div className={styles.container_GraficoLinha}>
                  <GraficoLinha array={dados} height_size={370}></GraficoLinha>
                </div>
                <div className={styles.container_GraficoBarLinhas}>
                  <GraficoBarLinhas data={dadosGraficoBar}></GraficoBarLinhas>
                </div>
              </div>
            )}
            {taggle === "Análise Mensal" && (
              <div className={styles.container_GraficoMensal}>
                <GraficoBarrasPagamentos data={dados}></GraficoBarrasPagamentos>
                <div className={styles.container_GraficoCard}>
                  {dadosOrdenados.map((item, index) => (
                    <FinancialCard
                      key={index}
                      mes={item.mes}
                      faturamento={item.faturamento}
                      despesas={item.totalDespesas}
                      resultado={item.resultado}
                      itensDespesas={item.itensDespesas}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GerenciaPagamentos;
