import React from 'react';
import { NeuroState } from '../types';
import { COLORS } from '../constants';

interface BrainMapProps {
  neuroState: NeuroState;
  betaLevel: number;
  thetaLevel: number;
  onSelect: (key: string) => void;
  selectedKey: string | null;
  relatedKeys: string[];
}

export const BrainMap: React.FC<BrainMapProps> = ({ neuroState, betaLevel, thetaLevel, onSelect, selectedKey, relatedKeys }) => {

  const getElectrodeColor = (region: 'frontal' | 'temporal' | 'occipital'): string => {
    switch (neuroState) {
      case NeuroState.FOCUS:
        if (region === 'frontal') return COLORS.red;
        return '#333';
      case NeuroState.DROWSY:
      case NeuroState.MICROSLEEP:
        if (region === 'occipital') return COLORS.blue;
        return '#333';
      case NeuroState.DISTRACTED:
        return COLORS.yellow;
      default:
        return '#555';
    }
  };

  const getGlow = (region: 'frontal' | 'temporal' | 'occipital') => {
    const color = getElectrodeColor(region);
    if (color === '#333' || color === '#555') return 'none';

    let intensity = 0.5;
    if (region === 'frontal' && neuroState === NeuroState.FOCUS) intensity = Math.abs(betaLevel);
    else if (region === 'occipital' && (neuroState === NeuroState.DROWSY || neuroState === NeuroState.MICROSLEEP)) intensity = Math.abs(thetaLevel);
    else if (neuroState === NeuroState.DISTRACTED) intensity = 1.2;

    intensity = Math.max(0.5, Math.min(intensity, 2.5));
    return `drop-shadow(0 0 ${intensity * 3}px ${color}) drop-shadow(0 0 ${intensity * 8}px ${color})`;
  };

  // Convert region name to ID key
  const getRegionKey = (r: string) => r.toUpperCase();

  const electrodes = [
    { id: 'Fp1', x: 80, y: 50, region: 'frontal' },
    { id: 'Fp2', x: 120, y: 50, region: 'frontal' },
    { id: 'F7', x: 40, y: 80, region: 'frontal' },
    { id: 'F8', x: 160, y: 80, region: 'frontal' },
    { id: 'T3', x: 30, y: 120, region: 'temporal' },
    { id: 'T4', x: 170, y: 120, region: 'temporal' },
    { id: 'O1', x: 70, y: 180, region: 'occipital' },
    { id: 'O2', x: 130, y: 180, region: 'occipital' },
  ] as const;

  // Define connections for Coherence Visualization
  const connections = [
    { from: 'Fp1', to: 'Fp2' },
    { from: 'Fp1', to: 'F7' },
    { from: 'Fp2', to: 'F8' },
    { from: 'F7', to: 'T3' },
    { from: 'F8', to: 'T4' },
    { from: 'T3', to: 'O1' },
    { from: 'T4', to: 'O2' },
    { from: 'O1', to: 'O2' },
    // Cross-hemisphere
    { from: 'Fp1', to: 'O1' },
    { from: 'Fp2', to: 'O2' },
  ];

  const getElectrodePos = (id: string) => electrodes.find(e => e.id === id);

  return (
    <div className="flex flex-col h-full bg-black/40 rounded border border-gray-800 p-4 relative overflow-hidden transition-all duration-300 group">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.2)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

      <div className="flex justify-between items-start z-10 mb-2">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-800 pb-1">Cortex Map // Coherence</h3>
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_lime]"></div>
      </div>

      <div className="flex-1 flex items-center justify-center relative z-10">
        <svg width="220" height="240" viewBox="0 0 200 220" className="opacity-90">
          {/* Head Outline */}
          <path
            d="M 100 20 C 150 20 180 60 180 110 C 180 180 150 210 100 210 C 50 210 20 180 20 110 C 20 60 50 20 100 20 Z"
            fill="none"
            stroke={selectedKey && ['FRONTAL', 'OCCIPITAL', 'TEMPORAL'].includes(selectedKey) ? '#374151' : '#4b5563'}
            strokeWidth="2"
          />
          <path d="M 90 20 L 100 10 L 110 20" fill="none" stroke="#4b5563" strokeWidth="2" />

          {/* Connectivity Lines */}
          {connections.map((conn) => {
            const start = getElectrodePos(conn.from);
            const end = getElectrodePos(conn.to);
            if (!start || !end) return null;

            // Dynamic opacity based on state
            let opacity = 0.1;
            let stroke = '#374151';

            if (neuroState === NeuroState.FOCUS && conn.from.startsWith('F') && conn.to.startsWith('F')) {
              opacity = 0.6 + (Math.sin(Date.now() / 200) * 0.2); // Pulsing frontal coherence
              stroke = COLORS.purple;
            } else if (neuroState === NeuroState.DROWSY && conn.from.startsWith('O') && conn.to.startsWith('O')) {
              opacity = 0.6 + (Math.sin(Date.now() / 400) * 0.2);
              stroke = COLORS.cyan;
            } else if (selectedKey) {
              // Highlight connections if regions are selected
              // Simplified check: does this connection touch a selected region?
              const startRegion = getRegionKey(start.region);
              const endRegion = getRegionKey(end.region);

              if (selectedKey === startRegion || selectedKey === endRegion) {
                opacity = 0.4;
                stroke = COLORS.cyan;
              }
            }

            return (
              <line
                key={`${conn.from}-${conn.to}`}
                x1={start.x} y1={start.y}
                x2={end.x} y2={end.y}
                stroke={stroke}
                strokeWidth="1"
                opacity={opacity}
                strokeDasharray={opacity > 0.2 ? "none" : "2 2"}
              />
            );
          })}

          {/* Grid lines */}
          <line x1="100" y1="20" x2="100" y2="210" stroke="#1f2937" strokeWidth="1" strokeDasharray="4 2" />
          <line x1="20" y1="110" x2="180" y2="110" stroke="#1f2937" strokeWidth="1" strokeDasharray="4 2" />

          {/* Electrodes */}
          {electrodes.map((e) => {
            const regionKey = getRegionKey(e.region);
            const isRegionSelected = selectedKey === regionKey;
            const isRegionRelated = relatedKeys.includes(regionKey);
            const glow = getGlow(e.region as any);

            return (
              <g
                key={e.id}
                onClick={(ev) => { ev.stopPropagation(); onSelect(regionKey); }}
                className="cursor-pointer transition-opacity hover:opacity-100"
                style={{ opacity: (selectedKey || relatedKeys.length > 0) && !isRegionSelected && !isRegionRelated ? 0.3 : 1 }}
              >
                {/* Selection Indicator Ring */}
                {isRegionSelected && (
                  <circle cx={e.x} cy={e.y} r="10" fill="none" stroke={COLORS.cyan} strokeWidth="1" className="animate-ping" opacity="0.5" />
                )}
                {/* Related Pulse Ring */}
                {isRegionRelated && !isRegionSelected && (
                  <circle
                    cx={e.x}
                    cy={e.y}
                    r="9"
                    fill="none"
                    className="related-pulse-svg"
                  />
                )}

                <circle
                  cx={e.x}
                  cy={e.y}
                  r="6"
                  fill={getElectrodeColor(e.region as any)}
                  stroke={isRegionSelected ? COLORS.cyan : isRegionRelated ? COLORS.cyan : "#000"}
                  strokeWidth={isRegionSelected ? 2 : isRegionRelated ? 1 : 1}
                  style={{
                    filter: glow,
                    transition: 'all 0.2s ease-out'
                  }}
                />
                <text
                  x={e.x}
                  y={e.y - 12}
                  fontSize="11"
                  fill={isRegionSelected ? COLORS.cyan : isRegionRelated ? COLORS.cyan : "#9ca3af"}
                  textAnchor="middle"
                  className="font-mono tracking-wider font-bold select-none"
                >
                  {e.id}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="absolute bottom-2 left-0 w-full text-center text-[10px] text-gray-500">
        CLICK REGION FOR ANALYSIS
      </div>
    </div>
  );
};
