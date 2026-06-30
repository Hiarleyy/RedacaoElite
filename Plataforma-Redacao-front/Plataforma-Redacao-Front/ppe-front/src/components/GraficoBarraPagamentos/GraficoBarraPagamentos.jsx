import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import styles from "./styles.module.css";

const GraficoBarLinha = ({ data }) => {
  // Normaliza os dados recebidos
  const normalizedData = (Array.isArray(data) ? data : []).map((item) => ({
    label: item.label || item.mes || "", // suporte a "label" ou "mes"
    entrada: Number(item.entrada) || 0,
    saida: Number(item.saida) || 0,
  }));

  return (
    <div className={styles.chartContainer}>

      
      {/* Legenda do gráfico */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.entradaLegend}></span> Faturamento
        </div>
        <div className={styles.legendItem}>
          <span className={styles.saidaLegend}></span> Despesas
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={normalizedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          {/* Tooltip com estilo personalizado */}
          <Tooltip 
            formatter={(value) => `R$ ${value.toLocaleString("pt-BR")}`} 
            contentStyle={{
              backgroundColor: "#333", // cor de fundo escura
              border: "1px solid #ccc", // borda clara
              borderRadius: "4px", // borda arredondada
              padding: "10px", // espaço interno
            }} 
            labelStyle={{
              color: "#fff", // cor do texto da chave
              fontWeight: "bold", // negrito na chave
            }} 
            itemStyle={{
              color: "#fff", // cor do texto dos valores
            }} 
          />
          <Legend />
          <Bar dataKey="entrada" fill="#4CAF50" barSize={20} />
          <Bar dataKey="saida" fill="#F44336" barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoBarLinha;
