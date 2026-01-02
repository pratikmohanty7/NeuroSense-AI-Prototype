import React from 'react';
import { SYSTEM_INFO } from '../constants';
import { LogTerminal } from './LogTerminal';

interface InfoPanelProps {
    selectedKey: string | null;
    logs: string[];
    onClose: () => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ selectedKey, logs, onClose }) => {
    const info = selectedKey ? SYSTEM_INFO[selectedKey] : null;

    return (
        <div className="h-full bg-[#0b0d12] border-none flex flex-col relative overflow-hidden">
            {/* Header Tabs */}
            <div className="flex border-b border-gray-800 bg-gray-900/20">
                <button
                    onClick={onClose}
                    className={`px-4 py-2 text-[10px] font-bold tracking-wider uppercase border-r border-gray-800 transition-colors ${!selectedKey ? 'text-cyan-400 bg-gray-800/50' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    EVENT LOG
                </button>
                <button
                    className={`px-4 py-2 text-[10px] font-bold tracking-wider uppercase border-r border-gray-800 transition-colors ${selectedKey ? 'text-cyan-400 bg-gray-800/50' : 'text-gray-600'}`}
                >
                    ANALYSIS {selectedKey ? `// ${selectedKey}` : ''}
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative min-h-0">
                {!info ? (
                    <LogTerminal logs={logs} />
                ) : (
                    <div className="h-full p-4 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                        {/* Title Section */}
                        <div className="border-b border-gray-800 pb-2">
                            <div className="flex justify-between items-start mb-1">
                                <div className="text-gray-400 text-[10px] font-mono">{info.id}</div>
                                <div className="text-gray-600 text-[10px] font-mono uppercase">Reference</div>
                            </div>
                            <h2 className="text-lg text-white font-bold tracking-tight">{info.title}</h2>
                            <div className="flex gap-2 mt-2">
                                {info.frequencyBand && (
                                    <span className="inline-block px-1.5 py-0.5 bg-gray-800 text-gray-300 text-[9px] rounded font-mono">
                                        {info.frequencyBand}
                                    </span>
                                )}
                                {info.region && (
                                    <span className="inline-block px-1.5 py-0.5 bg-gray-800 text-gray-300 text-[9px] rounded font-mono">
                                        {info.region.toUpperCase()}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3 flex-1">
                            <div>
                                <h4 className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">
                                    Description
                                </h4>
                                <p className="text-gray-300 text-xs leading-relaxed">
                                    {info.description}
                                </p>
                            </div>

                            <div className="bg-gray-900/30 p-3 rounded border border-gray-800">
                                <h4 className="text-cyan-600 text-[10px] font-bold uppercase tracking-wider mb-1">
                                    Clinical Significance
                                </h4>
                                <p className="text-gray-400 text-xs leading-relaxed">
                                    {info.clinicalSignificance}
                                </p>
                            </div>
                        </div>

                        <div className="mt-auto pt-2 border-t border-gray-800 flex justify-end">
                            <button
                                onClick={onClose}
                                className="text-[10px] text-gray-500 hover:text-white uppercase font-bold"
                            >
                                Return to Log
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
