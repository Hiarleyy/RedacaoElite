import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#ef233c", // 0-500 - Vermelho (crítico)
  "#ff6b35", // 500-600 - Laranja
  "#f77f00", // 600-700 - Amarelo-alaranjado
  "#DA9E00", // 700-800 - Dourado (cor do tema)
  "#fcbf49", // 800-900 - Amarelo claro
  "#8ecae6", // 900-999 - Azul claro
  "#023047", // 1000 - Azul escuro (excelência)
];

// Função para agrupar os dados por faixa de nota
function agruparPorFaixa(data) {
  const faixas = [
    { name: "0-600", min: 0, max: 600 },
    { name: "600-700", min: 600, max: 700 },
    { name: "700-800", min: 700, max: 800 },
    { name: "800-950", min: 800, max: 950 },
    { name: "950-980", min: 950, max: 980 },
    { name: "980-1000", min: 980, max: 1000 }
  ];

  const contagem = {};

  // Inicializar contagem
  faixas.forEach((faixa) => {
    contagem[faixa.name] = 0;
  });

  // Se não há dados válidos, retorna array vazio
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [];
  }

  // Contar notas por faixa
  data.forEach((item) => {
    const nota = parseFloat(item.nota) || 0;
    
    if (nota > 0) { // Só conta notas maiores que 0
      const faixa = faixas.find((f) => nota >= f.min && nota <= f.max);
      if (faixa) {
        contagem[faixa.name]++;
      }
    }
  });

  // Retornar apenas faixas com valores > 0
  const resultado = Object.entries(contagem)
    .map(([name, value]) => ({ name, value }))
    .filter((item) => item.value > 0);
    
  return resultado;
}

const GraficoPizza = ({ data, titulo }) => {
  const dadosAgrupados = agruparPorFaixa(data);
  const temDados = dadosAgrupados && dadosAgrupados.length > 0;

  if (!temDados) {
    return (
      <div style={{ 
        width: "100%", 
        height: 450, 
        display: "flex", 
        flexDirection: "column",
        justifyContent: "center", 
        alignItems: "center",
        color: "#ffffff",
        backgroundColor: "#242424",
        borderRadius: "10px",
        border: "1px solid #da9e00",
        padding: "20px"
      }}>
        <h3 style={{ 
          marginBottom: "20px", 
          color: "#ffffff",
          textAlign: "center",
          fontSize: "1.5rem",
          fontWeight: "600"
        }}>
          {titulo}
        </h3>
        <p style={{ 
          fontSize: "16px", 
          color: "#a0a0a0",
          textAlign: "center",
          marginBottom: "10px"
        }}>
          Nenhum dado disponível para exibir
        </p>
        <p style={{ 
          fontSize: "14px", 
          color: "#a0a0a0",
          textAlign: "center"
        }}>
          Selecione uma turma com dados ou verifique o período
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      width: "100%", 
      height: 450,
      backgroundColor: "#242424",
      borderRadius: "10px",
      border: "1px solid #da9e00",
      padding: "20px"
    }}>
      <h3 style={{ 
        textAlign: "center", 
        marginBottom: "10px", 
        color: "#ffffff",
        fontSize: "1.5rem",
        fontWeight: "600"
      }}>
        {titulo}
      </h3>
      <ResponsiveContainer width="100%" height={380}>
        <PieChart>
          <Pie
            data={dadosAgrupados}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={110}
            fill="#8884d8"
            dataKey="value"
            label={({ name, value, percent }) => 
              `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
            }
            labelStyle={{
              fill: "#ffffff",
              fontSize: "12px",
              fontWeight: "500"
            }}
          >
            {dadosAgrupados.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                stroke="#242424"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [
              `${value} redação${value !== 1 ? 'ões' : ''}`, 
              `Faixa ${name}`
            ]}
            contentStyle={{
              backgroundColor: "#242424",
              border: "1px solid #da9e00",
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              color: "#ffffff"
            }}
            labelStyle={{ 
              color: "#da9e00",
              fontWeight: "600"
            }}
            itemStyle={{
              color: "#ffffff"
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => `Faixa ${value}`}
            wrapperStyle={{
              color: "#ffffff",
              fontSize: "14px"
            }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoPizza;
