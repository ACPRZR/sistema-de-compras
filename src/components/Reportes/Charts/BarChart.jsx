import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({ 
  data, 
  title, 
  height = 300,
  showLegend = true,
  showGrid = true,
  horizontal = false,
  stacked = false
}) => {
  const options = {
    indexAxis: horizontal ? 'y' : 'x',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'top',
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
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = new Intl.NumberFormat('es-ES').format(context.parsed[horizontal ? 'x' : 'y']);
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: showGrid,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#6B7280'
        },
        stacked: stacked
      },
      y: {
        display: true,
        grid: {
          display: showGrid,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#6B7280',
          callback: function(value) {
            return new Intl.NumberFormat('es-ES').format(value);
          }
        },
        stacked: stacked
      }
    },
    interaction: {
      mode: 'nearest',
      axis: horizontal ? 'y' : 'x',
      intersect: false
    }
  };

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default BarChart;
