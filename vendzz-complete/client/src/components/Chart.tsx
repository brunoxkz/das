import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface ChartProps {
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  data: ChartData[];
  title?: string;
  width?: number;
  height?: number;
  showLegend?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

const Chart: React.FC<ChartProps> = ({
  type,
  data,
  title,
  width = 400,
  height = 300,
  showLegend = true,
  backgroundColor = '#3b82f6',
  borderColor = '#1d4ed8',
  borderWidth = 2,
}) => {
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        label: title || 'Dados',
        data: data.map(item => item.value),
        backgroundColor: type === 'pie' || type === 'doughnut' 
          ? data.map(item => item.color || backgroundColor)
          : backgroundColor,
        borderColor: type === 'pie' || type === 'doughnut'
          ? data.map(item => item.color || borderColor)
          : borderColor,
        borderWidth,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: showLegend,
        position: 'top' as const,
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: type === 'pie' || type === 'doughnut' ? {} : {
      y: {
        beginAtZero: true,
        grid: {
          color: '#e5e7eb',
        },
      },
      x: {
        grid: {
          color: '#e5e7eb',
        },
      },
    },
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={chartData} options={options} width={width} height={height} />;
      case 'line':
        return <Line data={chartData} options={options} width={width} height={height} />;
      case 'pie':
        return <Pie data={chartData} options={options} width={width} height={height} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={options} width={width} height={height} />;
      default:
        return <Bar data={chartData} options={options} width={width} height={height} />;
    }
  };

  return (
    <div className="w-full max-w-full overflow-hidden">
      {renderChart()}
    </div>
  );
};

export default Chart;