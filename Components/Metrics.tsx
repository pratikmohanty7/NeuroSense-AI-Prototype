import React from 'react';
import { NeuroState } from '../types';
import { STATE_PARAMS, COLORS } from '../constants';

interface MetricsProps {
  neuroState: NeuroState;
  onSelect: (key: string) => void;
  selectedKey: string | null;
  relatedKeys: string[];
}

export const Metrics: React.FC<MetricsProps> = ({ neuroState, onSelect, selectedKey, relatedKeys }) => {
  const params = STATE_PARAMS[neuroState];

  const getFatigueColor = (val: number) => {
    if (val < 20) return COLORS.green;
    if (val < 60) return COLORS.yellow;
    return COLORS.red;
  };

  const getLoadColor = (val: number) => {
    if (val > 80) return COLORS.green; 
    if (val > 40) return COLORS.yellow;
    return COLORS.red; 
  };

  const MetricCard = ({ id, title, value, sub, color, barValue }: any) => {
      const isSelected = selectedKey === id;
      const isRelated = relatedKeys.includes(id);

      return (
        <div 
            onClick={() => onSelect(id)}
            className={`
                relative p-3 rounded-sm border transition-all duration-300 cursor-pointer group overflow-hidden flex flex-col justify-between
                ${isSelected 
                    ? 'bg-cyan-950/30 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)] z-10 scale-[1.02]' 
                    : isRelated 
                        ? 'related-pulse border-cyan-500/60 bg-cyan-950/10' 
                        : 'bg-black/60 border-gray-800 hover:border-gray-600 hover:bg-gray-900/80'
                }
            `}
        >
            {/* Animated Locking Brackets for Related Items */}
            {isRelated && !isSelected && (
                <>
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-500 animate-[ping_1.5s_infinite] opacity-50"></div>
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-500 animate-[ping_1.5s_infinite] opacity-50"></div>
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-500 animate-[ping_1.5s_infinite] opacity-50"></div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-500 animate-[ping_1.5s_infinite] opacity-50"></div>
                </>
            )}

            {/* Corner Accents (Static) */}
            <div className={`absolute top-0 left-0 w-1.5 h-1.5 border-t border-l transition-colors ${isSelected ? 'border-cyan-400' : isRelated ? 'border-cyan-500' : 'border-gray-700 group-hover:border-gray-500'}`}></div>
            <div className={`absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r transition-colors ${isSelected ? 'border-cyan-400' : isRelated ? 'border-cyan-500' : 'border-gray-700 group-hover:border-gray-500'}`}></div>

            <div className="flex justify-between items-start mb-2 relative z-10">
                <div className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isSelected ? 'text-cyan-300' : isRelated ? 'text-cyan-400' : 'text-gray-400'}`}>
                    {title}
                </div>
                {isRelated && !isSelected && (
                    <div className="flex items-center gap-1">
                         <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_5px_cyan]"></span>
                         <div className="text-[9px] text-cyan-300 font-mono tracking-tighter border border-cyan-900/50 px-1.5 rounded-sm bg-black/80">LINKED</div>
                    </div>
                )}
            </div>

            <div className="flex items-end justify-between gap-2 relative z-10">
                <div className="text-2xl font-mono leading-none tracking-tighter font-bold" style={{ color: color || '#fff' }}>
                    {value}
                </div>
                {sub && <div className="text-[10px] text-gray-500 font-mono mb-0.5">{sub}</div>}
            </div>
            
            {/* Progress Bar */}
            {barValue !== undefined && (
                <div className="w-full bg-gray-900 h-1 mt-2 rounded-none overflow-hidden border border-gray-800 relative z-10">
                    <div 
                        className="h-full transition-all duration-500" 
                        style={{ width: `${barValue}%`, backgroundColor: color }}
                    ></div>
                </div>
            )}
             {/* Decorator Lines */}
            {barValue === undefined && (
                 <div className="w-full flex gap-0.5 mt-2 relative z-10">
                     <div className="h-0.5 w-1/3 bg-gray-800"></div>
                     <div className="h-0.5 w-1/6 bg-gray-800"></div>
                     <div className="h-0.5 w-full bg-gray-800"></div>
                 </div>
            )}
            
            {/* Background Glitch for selected */}
            {isSelected && (
                 <div className="absolute inset-0 bg-cyan-400/5 z-0 animate-pulse"></div>
            )}
        </div>
      )
  }

  return (
    <div className="grid grid-cols-4 gap-3 mb-3">
      <MetricCard 
        id="COG_LOAD" 
        title="COG_WORKLOAD" 
        value={params.cogLoad} 
        sub="INDEX"
        color={getLoadColor(params.cogLoad)} 
        barValue={params.cogLoad} 
      />
      <MetricCard 
        id="FATIGUE" 
        title="FATIGUE_PROB(p)" 
        value={`0.${params.fatigue}`} 
        color={getFatigueColor(params.fatigue)} 
        barValue={params.fatigue} 
      />
      <MetricCard 
        id="BLINK_RATE" 
        title="OCULOMETRICS" 
        value={params.blinkRate} 
        sub="EOG/MIN"
        color="white" 
      />
      <MetricCard 
        id="STATUS" 
        title="SYS_INTEGRITY" 
        value={params.status === 'OPTIMAL' ? 'NOMINAL' : params.status} 
        color={params.status === 'OPTIMAL' ? COLORS.green : params.status === 'EMERGENCY' ? COLORS.red : COLORS.yellow} 
      />
    </div>
  );
};
