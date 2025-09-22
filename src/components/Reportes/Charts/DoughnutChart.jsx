import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({ 
  data, 
  title, 
  height = 300,
  showLegend = true,
  showPercentage = true
}) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = new Intl.NumberFormat('es-ES').format(context.parsed);
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            
            if (showPercentage) {
              return `${label}: ${value} (${percentage}%)`;
            }
            return `${label}: ${value}`;
          }
        }
      }
    },
    cutout: '60%',
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    }
  };

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default DoughnutChart;
