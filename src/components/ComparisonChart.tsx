import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { SimulationParams, calculateBounds } from '@/src/types';

interface ComparisonChartProps {
  params: SimulationParams;
  varyingParam: 'm' | 'epsilon' | 'delta';
  title: string;
  onMouseEnter?: (param: 'm' | 'epsilon' | 'delta') => void;
  onMouseLeave?: () => void;
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  params,
  varyingParam,
  title,
  onMouseEnter,
  onMouseLeave
}) => {
  const generateData = () => {
    const data = [];
    const min = varyingParam === 'm' ? 10 : 0.05;
    const max = varyingParam === 'm' ? 500 : 1.0;
    const step = varyingParam === 'm' ? 50 : 0.05;

    for (let val = min; val <= max; val += step) {
      const currentParams = { ...params, [varyingParam]: val };
      const results = calculateBounds(currentParams);
      data.push({
        name: varyingParam === 'm' ? val : val.toFixed(2),
        steps: Math.round(results.steps),
        proofSize: Math.round(results.proofSize),
        depth: Number(results.depth.toFixed(2))
      });
    }
    return data;
  };

  const data = generateData();

  return (
    <div 
      className="w-full h-[400px] border border-gray-200 bg-white p-6 mt-8 transition-all duration-300 hover:border-black active:border-black"
      onMouseEnter={() => onMouseEnter?.(varyingParam)}
      onMouseLeave={() => onMouseLeave?.()}
    >
      <div className="mb-6">
        <h4 className="font-serif italic text-lg">{title}</h4>
        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mt-1">
          Behavior analysis as <span className="text-black font-bold font-sans">({varyingParam})</span> varies
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorSteps" x1="0" y2="1">
              <stop offset="5%" stopColor="#141414" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#141414" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorSize" x1="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 10, fontFamily: 'monospace' }} 
            axisLine={{ stroke: '#000' }}
          />
          <YAxis 
            tick={{ fontSize: 10, fontFamily: 'monospace' }} 
            axisLine={{ stroke: '#000' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #000', 
              borderRadius: '0',
              fontFamily: 'monospace',
              fontSize: '12px'
            }} 
          />
          <Legend 
             wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1px' }}
          />
          <Area 
            type="monotone" 
            dataKey="steps" 
            name="Th.2: Convergence Steps" 
            stroke="#141414" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorSteps)" 
          />
          <Area 
            type="monotone" 
            dataKey="proofSize" 
            name="Th.3: Proof Size" 
            stroke="#3b82f6" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorSize)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
