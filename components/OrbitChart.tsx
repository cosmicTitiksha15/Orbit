
import React, { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData,
} from 'chart.js';
import { Line, getElementAtEvent } from 'react-chartjs-2';
import { STUDY_DATA } from '../constants';
import { StudyDay } from '../types';

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

interface OrbitChartProps {
  onDayClick: (day: StudyDay) => void;
}

const OrbitChart: React.FC<OrbitChartProps> = ({ onDayClick }) => {
  const chartRef = useRef<any>(null);

  const onClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { current: chart } = chartRef;
    if (!chart) return;

    const element = getElementAtEvent(chart, event);
    if (element.length > 0) {
      const { index } = element[0];
      onDayClick(STUDY_DATA[index]);
    }
  };

  const data: ChartData<'line'> = {
    labels: STUDY_DATA.map(d => d.date),
    datasets: [
      {
        label: 'Mastery Level (%)',
        data: STUDY_DATA.map(d => d.readiness_score),
        borderColor: '#a855f7', // Purple-500
        backgroundColor: (context) => {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return null;
            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient.addColorStop(0, 'rgba(168, 85, 247, 0.05)');
            gradient.addColorStop(1, 'rgba(168, 85, 247, 0.4)');
            return gradient;
        },
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#a855f7',
        pointBorderColor: '#ffffff',
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#a855f7',
        pointRadius: 4,
        borderWidth: 3,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleFont: { size: 14, family: 'Inter' },
        bodyFont: { size: 12, family: 'Inter' },
        padding: 12,
        borderColor: 'rgba(168, 85, 247, 0.5)',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: (context) => `Mastery: ${context.parsed.y}%`,
          footer: () => 'Click to view topic details'
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          font: { size: 10 },
          maxRotation: 45,
          minRotation: 45,
          callback: function(value, index) {
              // Show fewer labels on X axis to avoid clutter
              const labels = this.getLabels() as string[];
              if (index % 5 === 0) return labels[index];
              return '';
          }
        },
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          callback: (value) => `${value}%`,
        },
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  return (
    <div className="w-full h-[400px]">
      <Line
        ref={chartRef}
        data={data}
        options={options}
        onClick={onClick}
      />
    </div>
  );
};

export default OrbitChart;
