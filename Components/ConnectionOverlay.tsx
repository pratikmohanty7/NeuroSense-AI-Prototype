import React, { useMemo } from 'react';
import { DashboardZone } from '../types';

interface ConnectionOverlayProps {
  zones: DashboardZone[];
}

// Optimized coordinates to align better with component centers
// These are percentages relative to the main content area
const ZONE_COORDS: Record<string, { x: number; y: number }> = {
  'METRICS': { x: 50, y: 12 },       // Adjusted for top row metrics
  'OSCILLOSCOPE': { x: 35, y: 38 },  // Adjusted for top-left large chart
  'BANDS': { x: 35, y: 72 },         // Adjusted for bottom-left large chart
  'MAP': { x: 82, y: 52 },           // Adjusted for map center
  'INFO': { x: 82, y: 82 }           // Adjusted for info panel
};

export const ConnectionOverlay: React.FC<ConnectionOverlayProps> = ({ zones }) => {
  if (zones.length < 2) return null;

  const uniqueZones = Array.from(new Set(zones)).filter(z => z !== null) as string[];
  
  const connections = useMemo(() => {
    const pairs: {x1: number, y1: number, x2: number, y2: number, id: string}[] = [];
    const source = uniqueZones[0];
    
    for (let i = 1; i < uniqueZones.length; i++) {
        const target = uniqueZones[i];
        if (ZONE_COORDS[source] && ZONE_COORDS[target]) {
            pairs.push({
                x1: ZONE_COORDS[source].x,
                y1: ZONE_COORDS[source].y,
                x2: ZONE_COORDS[target].x,
                y2: ZONE_COORDS[target].y,
                id: `${source}-${target}`
            });
        }
    }
    return pairs;
  }, [uniqueZones]);

  return (
    <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
      <svg className="w-full h-full">
        <defs>
          <filter id="glow-line" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          <linearGradient id="packet-gradient" gradientUnits="userSpaceOnUse">
             <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
             <stop offset="30%" stopColor="#06b6d4" stopOpacity="0.8" />
             <stop offset="70%" stopColor="#fff" stopOpacity="1" />
             <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </linearGradient>
        </defs>

        {connections.map((conn) => (
            <g key={conn.id}>
                {/* Base static wire - visible but subtle */}
                <line 
                    x1={`${conn.x1}%`} y1={`${conn.y1}%`} 
                    x2={`${conn.x2}%`} y2={`${conn.y2}%`}
                    stroke="#0e7490" 
                    strokeWidth="1" 
                    opacity="0.3"
                />
                
                {/* Endpoints - Connecting Nodes */}
                <circle cx={`${conn.x1}%`} cy={`${conn.y1}%`} r="3" fill="#06b6d4" opacity="0.8">
                    <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0.4;0.8" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <circle cx={`${conn.x2}%`} cy={`${conn.y2}%`} r="3" fill="#06b6d4" opacity="0.8">
                    <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" begin="0.75s"/>
                    <animate attributeName="opacity" values="0.8;0.4;0.8" dur="1.5s" repeatCount="indefinite" begin="0.75s"/>
                </circle>
            </g>
        ))}
      </svg>
      
      {/* Animated Data Packets Layer */}
      {connections.map((conn) => (
         <div key={`div-${conn.id}`} style={{ display: 'contents' }}>
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                 <line 
                    x1={`${conn.x1}%`} y1={`${conn.y1}%`} 
                    x2={`${conn.x2}%`} y2={`${conn.y2}%`}
                    stroke="url(#packet-gradient)" 
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="packet-flow"
                    style={{ filter: 'drop-shadow(0 0 4px #06b6d4)' }}
                />
            </svg>
         </div>
      ))}
      
      <style>{`
        .packet-flow {
            stroke-dasharray: 80 300; /* Packet length 80, Gap 300 */
            stroke-dashoffset: 380;
            animation: movePacket 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes movePacket {
            0% { stroke-dashoffset: 380; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { stroke-dashoffset: -80; opacity: 0; }
        }
      `}</style>
    </div>
  );
};