import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface ChartDataPoint {
  distance: number;
  pathLoss: number;
  rsl: number;
  margin: number;
}

interface ChartViewProps {
  data: ChartDataPoint[];
  currentDistance: number;
  rxSensitivity: number;
}

type MetricType = 'rsl' | 'pathLoss' | 'margin';

export function ChartView({ data, currentDistance, rxSensitivity }: ChartViewProps) {
  const [metric, setMetric] = useState<MetricType>('rsl');

  return (
    <div className="h-full w-full bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm flex flex-col min-h-[300px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h3 className="text-lg font-semibold text-slate-100">Distance Sweep Analysis</h3>
        
        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
          <button 
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${metric === 'rsl' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            onClick={() => setMetric('rsl')}
          >
            RSL
          </button>
          <button 
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${metric === 'margin' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            onClick={() => setMetric('margin')}
          >
            Fade Margin
          </button>
          <button 
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${metric === 'pathLoss' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            onClick={() => setMetric('pathLoss')}
          >
            Path Loss
          </button>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="distance" 
              stroke="#94a3b8" 
              tick={{ fill: '#94a3b8' }}
              tickFormatter={(val) => `${val}km`}
            />
            <YAxis 
              stroke="#94a3b8" 
              tick={{ fill: '#94a3b8' }}
              tickFormatter={(val) => `${Math.round(val)} ${metric === 'pathLoss' || metric === 'margin' ? 'dB' : 'dBm'}`}
              domain={['auto', 'auto']}
              width={70}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
              itemStyle={{ 
                color: metric === 'rsl' ? '#3b82f6' : metric === 'margin' ? '#10b981' : '#f59e0b'
              }}
              labelFormatter={(val) => `Distance: ${val} km`}
              formatter={(val: any) => [val != null ? `${Number(val).toFixed(2)} ${metric === 'pathLoss' || metric === 'margin' ? 'dB' : 'dBm'}` : '', metric === 'rsl' ? 'RSL' : metric === 'margin' ? 'Fade Margin' : 'Path Loss']}
            />
            
            {metric === 'rsl' && (
              <ReferenceLine y={rxSensitivity} stroke="#f43f5e" strokeDasharray="3 3" label={{ position: 'insideBottomRight', fill: '#f43f5e', value: 'Rx Sensitivity' }} />
            )}
            {metric === 'margin' && (
              <ReferenceLine y={0} stroke="#f43f5e" strokeDasharray="3 3" label={{ position: 'insideBottomRight', fill: '#f43f5e', value: 'Link Failure (0 dB)' }} />
            )}
            
            <ReferenceLine x={currentDistance} stroke="#cbd5e1" strokeDasharray="3 3" />
            
            <Line
              type="monotone"
              dataKey={metric}
              stroke={metric === 'rsl' ? '#3b82f6' : metric === 'margin' ? '#10b981' : '#f59e0b'}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: metric === 'rsl' ? '#3b82f6' : metric === 'margin' ? '#10b981' : '#f59e0b', stroke: '#1e293b', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
