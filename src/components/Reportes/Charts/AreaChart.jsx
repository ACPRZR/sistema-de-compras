import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AreaChart = ({ 
  data, 
  title, 
  height = 300,
  showLegend = true,
  showGrid = true,
  tension = 0.4
}) => {
  const options = {
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
        borderWidth: 1
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
        }
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
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    elements: {
      line: {
        tension: tension,
        fill: true
      },
      point: {
        radius: 3,
        hoverRadius: 5
      }
    }
  };

  // Modificar los datasets para que tengan fill: true
  const modifiedData = {
    ...data,
    datasets: data.datasets.map(dataset => ({
      ...dataset,
      fill: true
    }))
  };

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <Line data={modifiedData} options={options} />
    </div>
  );
};

export default AreaChart;
