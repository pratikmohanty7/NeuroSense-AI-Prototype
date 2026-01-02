import React, { useMemo } from 'react';
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
import { EegDataPoint } from '../types';
import { COLORS } from '../constants';

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

interface BandChartsProps {
  data: EegDataPoint[];
  onSelect: (key: string) => void;
  selectedKey: string | null;
  relatedKeys: string[];
}

const getChartOptions = (min: number, max: number) => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 0 },
  layout: { padding: 5 },
  scales: {
    x: { display: false },
    y: {
      display: true,
      min: min,
      max: max,
      grid: {
        color: 'rgba(55, 65, 81, 0.1)',
        drawBorder: false,
      },
      ticks: { display: false }
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false }
  },
  elements: {
    point: { radius: 0 },
    line: {
      tension: 0.4,
      borderWidth: 2,
    }
  }
});

const SingleBandChart = React.memo(({ title, color, dataKey, min, max, data, onClick, isSelected, isRelated }: {
  title: string,
  color: string,
  dataKey: keyof EegDataPoint,
  min: number,
  max: number,
  data: EegDataPoint[],
  onClick: () => void,
  isSelected: boolean,
  isRelated: boolean
}) => {
  const options = useMemo(() => getChartOptions(min, max), [min, max]);

  const chartData = useMemo(() => ({
    labels: data.map(d => d.time),
    datasets: [
      {
        data: data.map(d => d[dataKey]),
        borderColor: color,
        backgroundColor: `${color}10`,
        fill: true,
      }
    ]
  }), [data, color, dataKey]);

  return (
    <div
      onClick={onClick}
      className={`
                flex flex-col overflow-hidden h-full rounded border cursor-pointer transition-colors
                ${isSelected
          ? 'border-cyan-600 bg-gray-900/50'
          : isRelated
            ? 'border-cyan-900 bg-gray-900/20'
            : 'border-gray-800 bg-[#0f1115] hover:border-gray-700'
        }
            `}
    >
      <div className="flex justify-between items-center px-3 py-2 border-b border-gray-800/50 bg-white/5">
        <div className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-2 text-gray-400">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></div>
          {title}
        </div>
      </div>

      <div className="flex-1 min-h-0 relative p-1">
        <div className="absolute inset-0 w-full h-full p-2">
          <Line options={options} data={chartData} />
        </div>
      </div>
    </div>
  );
});

export const BandCharts: React.FC<BandChartsProps> = ({ data, onSelect, selectedKey, relatedKeys }) => {
  return (
    <div className="grid grid-cols-3 gap-4 h-full">
      <SingleBandChart
        title="Alpha (8-13Hz)"
        color={COLORS.orange}
        dataKey="alpha"
        min={-2}
        max={2}
        data={data}
        onClick={() => onSelect('ALPHA')}
        isSelected={selectedKey === 'ALPHA'}
        isRelated={relatedKeys.includes('ALPHA')}
      />
      <SingleBandChart
        title="Beta (13-30Hz)"
        color={COLORS.purple}
        dataKey="beta"
        min={-2}
        max={2}
        data={data}
        onClick={() => onSelect('BETA')}
        isSelected={selectedKey === 'BETA'}
        isRelated={relatedKeys.includes('BETA')}
      />
      <SingleBandChart
        title="Theta (4-8Hz)"
        color={COLORS.cyan}
        dataKey="theta"
        min={-2.5}
        max={2.5}
        data={data}
        onClick={() => onSelect('THETA')}
        isSelected={selectedKey === 'THETA'}
        isRelated={relatedKeys.includes('THETA')}
      />
    </div>
  );
};
