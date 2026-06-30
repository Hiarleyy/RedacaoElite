import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { useEffect, useState } from 'react';

const GraficoRedacoes = ({ 
  data = [], 
  xKey = 'data', 
  yKey = 'nota', 
  title = 'Evolução das notas do aluno',
  height_size = '300px',
  labelFormat = 'date', // 'date' or 'string'
  yAxisMax = 1050,
  yAxisStep = 100,
  lineColor = '#DA9E00',
  backgroundColor = '#1a1a1a88',
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
    // Format X-axis labels based on the labelFormat
  const formatLabel = (value) => {
    if (labelFormat === 'date' && value) {
      return new Date(value).toLocaleDateString();
    }
    return value;
  };

  // Get only the last 4 records
  const last4Data = data.slice(-4);

  const chartData = {
    labels: last4Data.map(item => formatLabel(item[xKey])),
    datasets: [
      {
        label: 'Nota da Redação',
        data: last4Data.map(item => item[yKey]),
        borderColor: lineColor, 
        backgroundColor: backgroundColor,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: lineColor,
        pointHoverRadius: 6,
        fill: true,
      }
    ]
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: title,
        color: '#E0E0E0',
        font: {
          size: isMobile ? 14 : 18,
          weight: 'bold',
          family: 'Inter, sans-serif'
        },
        padding: {
          top: isMobile ? 5 : 10,
          bottom: isMobile ? 15 : 30
        }
      },
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#fff',
        bodyColor: '#d1d5db',
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          },          title: function(context) {
            return formatLabel(last4Data[context[0].dataIndex][xKey]);
          }
        }
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
        max: yAxisMax,
        ticks: {
          stepSize: yAxisStep,
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
  };  return (
    <div style={{ 
      width: "100%", 
      height: isMobile ? "250px" : height_size,
      padding: isMobile ? "0 5px" : "0"
    }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default GraficoRedacoes;