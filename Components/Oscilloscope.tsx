import React, { useState, useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis, XAxis, CartesianGrid, ReferenceLine, BarChart, Bar, Cell } from 'recharts';
import { EegDataPoint } from '../types';
import { COLORS } from '../constants';

interface OscilloscopeProps {
  data: EegDataPoint[];
  onSelect: (key: string) => void;
  selectedKey: string | null;
  relatedKeys: string[];
}

export const Oscilloscope: React.FC<OscilloscopeProps> = ({ data, onSelect, selectedKey, relatedKeys }) => {
  const [mode, setMode] = useState<'TIME' | 'FFT'>('TIME');
  
  const isSelected = selectedKey === 'RAW_EEG';
  const isRelated = relatedKeys.includes('RAW_EEG');

  const fftData = useMemo(() => {
      if (data.length === 0) return [];
      const latest = data[data.length - 1];
      const spectrum = [];
      
      for(let i=1; i<=8; i++) {
          let val = Math.random() * 0.5;
          if (i >= 4) val += Math.abs(latest.theta) * 1.5; 
          spectrum.push({ freq: i, power: val });
      }
      for(let i=9; i<=13; i++) {
          let val = Math.random() * 0.5 + (Math.abs(latest.alpha) * 2);
          spectrum.push({ freq: i, power: val });
      }
      for(let i=14; i<=30; i++) {
          let val = Math.random() * 0.3 + (Math.abs(latest.beta) * 1.2);
          if (i > 25) val *= 0.8;
          spectrum.push({ freq: i, power: val });
      }
      for(let i=31; i<=40; i++) {
          spectrum.push({ freq: i, power: Math.random() * 0.2 });
      }

      return spectrum;
  }, [data]);

  return (
    <div 
        onClick={() => onSelect('RAW_EEG')}
        className="flex flex-col h-full w-full relative cursor-pointer"
    >
      <div className={`
        flex-1 relative h-full overflow-hidden transition-colors rounded
        ${isSelected || isRelated ? 'bg-gray-900/50' : 'bg-transparent'}
      `}>
        
        <div className="absolute top-0 left-0 w-full flex justify-between items-center p-2 z-10 pointer-events-none">
             <div className="text-xs font-bold text-gray-500 flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-cyan-500' : 'bg-green-600'}`}></span>
                {mode === 'TIME' ? 'RAW INPUT [CH 1]' : 'FFT ANALYSIS'}
            </div>

            <div className="flex gap-1 pointer-events-auto">
                 <button 
                    onClick={(e) => { e.stopPropagation(); setMode('TIME'); }}
                    className={`px-2 py-1 text-[9px] font-bold rounded transition-colors ${mode === 'TIME' ? 'bg-cyan-700 text-white' : 'bg-gray-800 text-gray-500 hover:text-gray-300'}`}
                >
                    TIME
                 </button>
                 <button 
                    onClick={(e) => { e.stopPropagation(); setMode('FFT'); }}
                    className={`px-2 py-1 text-[9px] font-bold rounded transition-colors ${mode === 'FFT' ? 'bg-purple-700 text-white' : 'bg-gray-800 text-gray-500 hover:text-gray-300'}`}
                >
                    SPECTRAL
                 </button>
            </div>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          {mode === 'TIME' ? (
              <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRaw" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e0e0e0" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#e0e0e0" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                
                <CartesianGrid stroke="#333" strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <YAxis domain={[-4, 4]} hide />
                <XAxis dataKey="time" hide />
                <ReferenceLine y={0} stroke="#444" strokeDasharray="5 5" />

                <Area 
                  type="monotone" 
                  dataKey="raw" 
                  stroke={isSelected || isRelated ? '#06b6d4' : '#9ca3af'} 
                  strokeWidth={1.5}
                  fillOpacity={1} 
                  fill="url(#colorRaw)" 
                  isAnimationActive={false}
                />
              </AreaChart>
          ) : (
             <BarChart data={fftData} margin={{ top: 40, right: 10, left: 10, bottom: 5 }} barCategoryGap={1}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="freq" tick={{fontSize: 9, fill: '#666'}} interval={4} />
                <YAxis hide domain={[0, 4]} />
                <Bar dataKey="power" isAnimationActive={false}>
                    {fftData.map((entry, index) => {
                        let fill = '#4b5563';
                        if (entry.freq >= 4 && entry.freq <= 8) fill = COLORS.cyan; 
                        if (entry.freq >= 8 && entry.freq <= 13) fill = COLORS.orange; 
                        if (entry.freq >= 13 && entry.freq <= 30) fill = COLORS.purple; 
                        return <Cell key={`cell-${index}`} fill={fill} fillOpacity={0.8} />;
                    })}
                </Bar>
             </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
