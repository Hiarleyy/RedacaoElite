import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import styles from "./styles.module.css";

const COLORS = {
  produzidos: "#4caf50",
  semProducao: "#f44336",
};

const Barras = ({ data, titulo }) => {
  // Calcular o valor máximo dinamicamente
  const getMaxValue = () => {
    if (!data || data.length === 0) return 10;
    
    const maxValue = Math.max(
      ...data.map(item => 
        Math.max(...Object.values(item).filter(val => typeof val === 'number'))
      )
    );
    
    return Math.max(maxValue + 2, 10); // Adiciona uma margem e garante mínimo de 10
  };

  // Verifica se há dados reais para exibir
  const temDados = data && data.length > 0 && 
    data.some(item => Object.values(item).some(val => typeof val === 'number' && val > 0));

  return (
    <div style={{ width: "100%" }}>
      {titulo && (
        <h3 className={styles.titulo} style={{ marginBottom: "20px" }}>
          {titulo}
        </h3>
      )}
      <div style={{ width: "100%", height: 300 }}>
        {temDados ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} barCategoryGap="20%">
              <XAxis dataKey="name" />
              <YAxis domain={[0, getMaxValue()]} />
              <Tooltip
                cursor={false}
                contentStyle={{
                  backgroundColor: "#DA9E00",
                  border: "9px solid #DA9E00",
                  borderRadius: "16px",
                }}
                labelStyle={{ color: "#fff" }}
                itemStyle={{ color: "#fff" }}
              />
              <Legend />
              {Object.entries(COLORS).map(([key, color]) => (
                <Bar
                  barSize={150}
                  key={key}
                  dataKey={key}
                  fill={color}
                  isAnimationActive={true}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            color: '#999',
            fontSize: '14px'
          }}>
            Nenhum dado disponível para o período selecionado
          </div>
        )}
      </div>
    </div>
  );
};

export default Barras;