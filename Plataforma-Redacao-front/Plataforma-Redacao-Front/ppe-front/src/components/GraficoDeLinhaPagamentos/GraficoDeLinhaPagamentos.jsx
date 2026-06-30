import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import styles from './styles.module.css';

const GraficoLinha = ({ array, height_size = 250 }) => {
  const data = array 
  // Tooltip customizado
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#1f2937', // dark background
        padding: '10px',
        borderRadius: '8px',
        color: 'white',
        boxShadow: '0 0 10px rgba(0,0,0,0.2)',
      }}>
        <p><strong>{label}</strong></p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.stroke, margin: 0 }}>
            {entry.name}: R$ {entry.value.toLocaleString('pt-BR')}
          </p>
        ))}
      </div>
    );
  }

  return null;
  };

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.title}>📈 Evolução do Fluxo de Caixa</h3>
      <LineChart width={450}height={height_size} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="mes" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line type="monotone" dataKey="entrada" stroke="#10b981" />
        <Line type="monotone" dataKey="saida" stroke="#ef4444" />
        <Line type="monotone" dataKey="saldo" stroke="#3b82f6" />
      </LineChart>
    </div>
  );
};

export default GraficoLinha;
