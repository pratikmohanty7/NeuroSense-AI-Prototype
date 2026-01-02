import React, { useState } from 'react';
import { SUBJECTS } from '../constants';
import { NeuroState, SimulationConfig, ArtifactType } from '../types';
import { soundEngine } from '../utils/SoundEngine';

interface SidebarProps {
    config: SimulationConfig;
    setConfig: (config: SimulationConfig) => void;
    onSelectState: (stateKey: string) => void;
    onInjectArtifact: (type: ArtifactType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ config, setConfig, onSelectState, onInjectArtifact }) => {
    const [isCalibrating, setIsCalibrating] = useState(false);

    const handleCalibration = () => {
        soundEngine.playComputing();
        setIsCalibrating(true);

        // Simulate a hardware handshake sequence
        setTimeout(() => {
            setIsCalibrating(false);
            soundEngine.playPing();
        }, 2000);
    };

    const handleStateSelect = (state: NeuroState) => {
        if (isCalibrating) return;
        setConfig({ ...config, neuroState: state });

        let key = 'FOCUS';
        if (state === NeuroState.DISTRACTED) key = 'DISTRACTED';
        if (state === NeuroState.DROWSY) key = 'DROWSY';
        if (state === NeuroState.MICROSLEEP) key = 'MICROSLEEP';

        onSelectState(key);
    };

    return (
        <div className="h-full flex flex-col relative bg-[#090a0e] border-r border-gray-800">

            {/* Enhanced Controller Header */}
            <div className="p-5 border-b border-gray-800 bg-gradient-to-b from-gray-900 to-[#090a0e] relative overflow-hidden group">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-600 shadow-[0_0_10px_#0891b2]"></div>
                <div className="absolute top-0 right-0 w-px h-6 bg-gray-700"></div>
                <div className="absolute bottom-0 right-0 w-6 h-px bg-gray-700"></div>

                <h1 className="text-sm font-bold text-white tracking-[0.25em] uppercase flex flex-col gap-1 relative z-10 font-sans">
                    <span className="text-[10px] text-cyan-500 font-mono tracking-normal">TERMINAL_01</span>
                    System Controller
                </h1>
                <div className="absolute top-2 right-2 flex gap-1">
                    <div className="w-1 h-1 bg-cyan-500 rounded-full animate-ping"></div>
                </div>
            </div>

            <div className="p-4 flex flex-col gap-8 overflow-y-auto flex-1 custom-scrollbar">

                {/* High-Fidelity Subject ID Card */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="text-[10px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2">
                            <span className="text-cyan-600">///</span> TARGET_SUBJECT
                        </div>
                        <div className="text-[9px] font-mono text-emerald-500 bg-emerald-950/30 px-1.5 rounded border border-emerald-900/50">
                            BIO_SYNC_ACTIVE
                        </div>
                    </div>

                    <div className="bg-[#0c0e12] border border-gray-800 rounded overflow-hidden relative group hover:border-cyan-800/50 transition-colors">
                        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

                        <div className="p-3 flex gap-3">
                            {/* Dynamic Avatar Placeholder */}
                            <div className="w-12 h-12 bg-gray-900 rounded border border-gray-700 flex items-center justify-center relative overflow-hidden shrink-0">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1),transparent)]"></div>
                                <svg className="w-6 h-6 text-gray-600 relative z-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                                {/* Scanline overlay on avatar */}
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent h-[200%] w-full animate-[scan_4s_linear_infinite]"></div>
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                                <div className="relative">
                                    <select
                                        className="w-full bg-transparent text-xs font-bold text-white outline-none cursor-pointer uppercase font-sans tracking-wide appearance-none relative z-10 hover:text-cyan-400 transition-colors"
                                        value={config.subject.id}
                                        onChange={(e) => {
                                            const sub = SUBJECTS.find(s => s.id === e.target.value);
                                            if (sub) setConfig({ ...config, subject: sub });
                                        }}
                                    >
                                        {SUBJECTS.map(s => (
                                            <option key={s.id} value={s.id} className="bg-gray-900 text-gray-300">
                                                {s.name.split('//')[0]}
                                            </option>
                                        ))}
                                    </select>
                                    {/* Custom arrow */}
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-[9px] font-mono text-gray-500">
                                    <span>ID: <span className="text-gray-400">{config.subject.id.split('-')[1]}</span></span>
                                    <span>SEC: <span className="text-gray-400">07</span></span>
                                </div>
                            </div>
                        </div>

                        {/* Mini Bio-Graph Visualizer at bottom of card */}
                        <div className="h-6 bg-black/50 border-t border-gray-800 flex items-end justify-between px-3 pb-1 gap-0.5">
                            {[40, 60, 30, 80, 50, 90, 40, 20, 50, 70, 40, 60].map((h, i) => (
                                <div
                                    key={i}
                                    className="w-1 bg-cyan-900/40 rounded-sm"
                                    style={{
                                        height: `${h}%`,
                                        animation: `pulse ${1 + Math.random()}s infinite`
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Signal Integrity Monitor */}
                <div className="space-y-2">
                    <div className="flex justify-between items-end border-b border-gray-800/50 pb-1">
                        <div className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Signal Integrity</div>
                        <div className={`text-[9px] font-mono font-bold ${isCalibrating ? 'text-yellow-500 animate-pulse' : 'text-emerald-500'}`}>
                            {isCalibrating ? 'DIAGNOSTICS...' : '● OPTIMAL'}
                        </div>
                    </div>
                    <div className="bg-[#0c0e12] border border-gray-800 rounded p-3 space-y-3">
                        <div className="space-y-2">
                            {['Fp1', 'Fp2', 'T3', 'O1'].map((label) => (
                                <div key={label} className="flex items-center gap-3">
                                    <span className="text-[9px] text-gray-500 w-6 font-mono font-bold text-right">{label}</span>
                                    <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden flex items-center relative">
                                        <div
                                            className={`h-full rounded-full ${isCalibrating ? 'bg-yellow-500' : 'bg-cyan-500'} shadow-[0_0_5px_currentColor] transition-all duration-500`}
                                            style={{ width: isCalibrating ? `${30 + Math.random() * 40}%` : `${85 + Math.random() * 10}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-[9px] text-gray-500 font-mono w-6 text-right">{isCalibrating ? '...' : 'OK'}</span>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={handleCalibration}
                            disabled={isCalibrating}
                            className="w-full mt-1 text-[9px] py-2 bg-gray-900 border border-gray-700 hover:border-gray-500 hover:bg-gray-800 rounded text-gray-300 hover:text-white transition-all uppercase font-bold tracking-wider flex items-center justify-center gap-2 group"
                        >
                            {isCalibrating ? (
                                <span>Running Check...</span>
                            ) : (
                                <>
                                    <span>Verify Impedance</span>
                                    <span className="text-cyan-500 group-hover:translate-x-0.5 transition-transform">→</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Protocol Selection */}
                <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 border-t border-gray-800 pt-4">
                        <div className="w-1 h-3 bg-cyan-800"></div>
                        <div className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                            Simulation Protocol
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {Object.values(NeuroState).map((state) => {
                            const isActive = config.neuroState === state;
                            let stateColorClass = 'cyan';
                            if (state.includes('FLOW')) stateColorClass = 'emerald';
                            if (state.includes('FRAGMENT')) stateColorClass = 'yellow';
                            if (state.includes('HYPO')) stateColorClass = 'orange';
                            if (state.includes('SYNCOPE')) stateColorClass = 'red';

                            return (
                                <button
                                    key={state}
                                    onClick={() => handleStateSelect(state)}
                                    className={`
                                relative text-left px-3 py-3 text-[10px] font-mono transition-all rounded border group overflow-hidden
                                ${isActive
                                            ? `border-${stateColorClass}-500/50 bg-${stateColorClass}-900/20 text-white shadow-[0_0_15px_rgba(0,0,0,0.5)]`
                                            : 'border-gray-800 bg-[#0c0e12] text-gray-500 hover:border-gray-600 hover:text-gray-300 hover:bg-gray-900'}
                            `}
                                >
                                    {isActive && <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${stateColorClass}-500`}></div>}
                                    <div className="flex justify-between items-center relative z-10">
                                        <span className="font-bold tracking-tight">{state}</span>
                                        {isActive && <span className={`w-1.5 h-1.5 rounded-full bg-${stateColorClass}-400 animate-pulse shadow-[0_0_5px_currentColor]`}></span>}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Artifact & Noise Controls */}
                <div className="space-y-4 pt-4 mt-auto border-t border-gray-800">
                    {/* Artifacts */}
                    <div className="space-y-2">
                        <div className="text-[9px] font-bold text-gray-500 tracking-widest uppercase mb-2">Noise Injection</div>
                        <div className="grid grid-cols-3 gap-2">
                            {['OCULAR', 'MUSCLE', 'MAINS'].map((art) => (
                                <button
                                    key={art}
                                    onClick={() => onInjectArtifact(art as ArtifactType)}
                                    className="bg-gray-900 border border-gray-800 hover:border-gray-600 hover:bg-gray-800 text-[9px] font-bold text-gray-400 hover:text-white py-2 rounded font-sans transition-all active:scale-95"
                                >
                                    {art}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Fatigue Slider */}
                    <div className="bg-[#0c0e12] p-3 rounded border border-gray-800">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-[9px] font-bold text-gray-400 tracking-widest uppercase">Fatigue Limit</label>
                            <span className="text-[9px] font-mono text-cyan-400 font-bold">
                                {(config.fatigueThreshold * 100).toFixed(0)}%
                            </span>
                        </div>
                        <div className="relative h-1.5 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                            <div className="absolute top-0 left-0 h-full bg-cyan-600 shadow-[0_0_5px_cyan]" style={{ width: `${config.fatigueThreshold * 100}%` }}></div>
                            <input
                                type="range"
                                min="0.1"
                                max="1.0"
                                step="0.05"
                                value={config.fatigueThreshold}
                                onChange={(e) => setConfig({ ...config, fatigueThreshold: parseFloat(e.target.value) })}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
