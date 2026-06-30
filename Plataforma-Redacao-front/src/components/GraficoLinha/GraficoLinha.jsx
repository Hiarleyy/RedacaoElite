import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: true,
      text: 'Evolução das notas do aluno',
      color: '#E0E0E0',
      font: {
        size: 18,
        weight: 'bold',
        family: 'Inter, sans-serif'
      },
      padding: {
        top: 10,
        bottom: 30
      },
      
    },
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: '#111827',
      titleColor: '#fff',
      bodyColor: '#d1d5db'
    }
  },
  scales: {
    x: {
      ticks: {
        display: false
      },
      grid: {
        display: false
      }
    },
    y: {
      beginAtZero: true,
      min: 0,
      max: 1050,
      ticks: {
        stepSize: 100,
        color: '#d1d5db',
        font: {
          family: 'Inter, sans-serif',
          size: 12
        },
        display: false
      },
      grid: {
        color: '#374151'
      }
    }
  }
}

const GraficoNotas = ({ array, height_size }) => {
  const dados = array

  const data = {
    labels: dados.map(d => new Date(d.data).toLocaleDateString()),
    datasets: [
      {
        label: 'Nota da Redação',
        data: dados.map(d => d.nota),
        borderColor: '#DA9E00', 
        backgroundColor: '#1a1a1a88',
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#DA9E00',
        pointHoverRadius: 6,
        fill: true,
      }
    ]
  }

  return <div style={{ width: "100%", height: height_size }}><Line data={data} options={options} /></div> 
}

export default GraficoNotas