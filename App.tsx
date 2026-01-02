import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Sidebar } from './Components/Sidebar';
import { Metrics } from './Components/Metrics';
import { Oscilloscope } from './Components/Oscilloscope';
import { BandCharts } from './Components/BandCharts';
import { BrainMap } from './Components/BrainMap';
import { InfoPanel } from './Components/InfoPanel';
import { NeuroState, SimulationConfig, EegDataPoint, ArtifactType } from './types';
import { SUBJECTS, STATE_PARAMS, RELATIONSHIPS } from './constants';
import { soundEngine } from './utils/SoundEngine';

const App: React.FC = () => {
    const [isSystemActive, setIsSystemActive] = useState(false);
    const [config, setConfig] = useState<SimulationConfig>({
        neuroState: NeuroState.FOCUS,
        noiseFloor: 0.5,
        fatigueThreshold: 0.75, // Default clinical threshold
        subject: SUBJECTS[0],
    });

    const [eegData, setEegData] = useState<EegDataPoint[]>([]);

    // Recording State - Optimized with useRef to prevent re-render lag
    const recordedDataRef = useRef<EegDataPoint[]>([]);
    const [isRecording, setIsRecording] = useState(false);

    const [alerts, setAlerts] = useState<string[]>([]);
    const [sessionDuration, setSessionDuration] = useState(0);

    const [currentBeta, setCurrentBeta] = useState(0);
    const [currentTheta, setCurrentTheta] = useState(0);

    // Artifact State
    const [activeArtifact, setActiveArtifact] = useState<ArtifactType>(null);
    const artifactTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // New State for Interactivity
    const [selectedInfoKey, setSelectedInfoKey] = useState<string | null>(null);

    // Computed related keys for "Interconnected" highlighting
    const relatedKeys = useMemo(() => {
        return selectedInfoKey && RELATIONSHIPS[selectedInfoKey]
            ? RELATIONSHIPS[selectedInfoKey]
            : [];
    }, [selectedInfoKey]);

    // Ref for Smoothing Algorithm: Rolling Window Buffer (Size 12)
    const historyBuffer = useRef<{ alpha: number[]; beta: number[]; theta: number[] }>({
        alpha: Array(12).fill(0),
        beta: Array(12).fill(0),
        theta: Array(12).fill(0)
    });

    const initializeSystem = () => {
        soundEngine.init();
        soundEngine.playPing();
        setIsSystemActive(true);
        setAlerts(prev => [
            "KERNEL_INIT_SEQ_START",
            "AUDIO_CORE_DRIVER :: MOUNTED",
            "NEURAL_LINK_BRIDGE :: ESTABLISHED",
            "ACCESS_GRANTED :: LEVEL_5",
            ...prev
        ]);
    };

    const handleSelection = (key: string) => {
        if (selectedInfoKey === key) {
            setSelectedInfoKey(null);
        } else {
            setSelectedInfoKey(key);
            soundEngine.playClick();
        }
    };

    const clearSelection = () => {
        setSelectedInfoKey(null);
    };

    const toggleRecording = () => {
        if (isRecording) {
            setIsRecording(false);
            setAlerts(prev => [`RECORDING_STOPPED: ${recordedDataRef.current.length} SAMPLES SAVED`, ...prev]);
            soundEngine.playClick();
        } else {
            setIsRecording(true);
            recordedDataRef.current = []; // Reset buffer
            setAlerts(prev => ["RECORDING_STARTED", ...prev]);
            soundEngine.playPing();
        }
    };

    const exportData = () => {
        const data = recordedDataRef.current;
        if (data.length === 0) {
            setAlerts(prev => ["EXPORT_ERROR: NO_DATA_RECORDED", ...prev]);
            return;
        }

        const csvContent = "data:text/csv;charset=utf-8,"
            + "Time,Raw,Alpha,Beta,Theta\n"
            + data.map(e => `${e.time},${e.raw.toFixed(4)},${e.alpha.toFixed(4)},${e.beta.toFixed(4)},${e.theta.toFixed(4)}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `neuro_session_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setAlerts(prev => ["DATA_EXPORT_COMPLETE", ...prev]);
        soundEngine.playClick();
    };

    const handleArtifactInjection = (type: ArtifactType) => {
        if (!type) return;

        setActiveArtifact(type);

        const duration = type === 'OCULAR' ? 400 : 2000;
        let impactDesc = "";

        if (type === 'OCULAR') {
            impactDesc = "Simulated EOG spike. Signal deviation > 200µV. Beta band SNR suppressed by ~45%.";
        } else if (type === 'MUSCLE') {
            impactDesc = "Simulated EMG interference. Broadband high-frequency noise. Alpha rhythm obscured.";
        } else if (type === 'MAINS') {
            impactDesc = "50/60Hz Line Noise. Cyclic sinusoidal artifact injection. Signal purity degraded.";
        }

        setAlerts(prev => [
            `[ARTIFACT_INJECT] >> TYPE: ${type} | DUR: ${duration}ms | IMPACT: ${impactDesc}`,
            ...prev
        ]);

        soundEngine.playClick();

        if (artifactTimeout.current) clearTimeout(artifactTimeout.current);
        artifactTimeout.current = setTimeout(() => {
            setActiveArtifact(null);
        }, duration);
    };

    const calculatedStatus = useCallback(() => {
        if (config.noiseFloor > 3.5) return 'SIGNAL_LOST';
        if (config.noiseFloor > 2.0) return 'UNSTABLE';

        // Use the custom fatigue threshold
        const fatigueLevel = STATE_PARAMS[config.neuroState].fatigue / 100;
        if (fatigueLevel > config.fatigueThreshold) {
            if (config.neuroState === NeuroState.MICROSLEEP) return 'EMERGENCY';
            return 'CRITICAL';
        }

        if (config.neuroState === NeuroState.DISTRACTED) return 'WARNING';
        return 'OPTIMAL';
    }, [config.noiseFloor, config.neuroState, config.fatigueThreshold])();

    // AUDIO LOGIC
    useEffect(() => {
        if (!isSystemActive) return;

        const params = STATE_PARAMS[config.neuroState];
        soundEngine.setDronePitch(params.fatigue);

        let interval: ReturnType<typeof setInterval>;

        if (calculatedStatus === 'EMERGENCY') {
            soundEngine.playCriticalAlarm();
            interval = setInterval(() => {
                soundEngine.playCriticalAlarm();
            }, 400);
        } else if (calculatedStatus === 'CRITICAL') {
            soundEngine.playDrowsyAlert();
            interval = setInterval(() => {
                soundEngine.playDrowsyAlert();
            }, 1500);
        }

        return () => clearInterval(interval);
    }, [config.neuroState, isSystemActive, calculatedStatus]);


    // DATA GENERATION
    const generateDataPoint = useCallback((time: number): EegDataPoint => {
        const params = STATE_PARAMS[config.neuroState];
        const t = time * 0.001;

        // 1. Generate Base Waveforms (Idealized)
        const betaBase = (Math.sin(t * 4.0) * params.betaAmp) + (Math.sin(t * 7.5) * params.betaAmp * 0.5);
        const thetaBase = (Math.sin(t * 2.0) * params.thetaAmp) + (Math.cos(t * 3.5) * params.thetaAmp * 0.5);
        const alphaBase = (Math.sin(t * 3.0) * params.alphaAmp) + (Math.sin(t * 5.2) * params.alphaAmp * 0.3);

        // 2. Update Rolling Buffer (SMA Logic)
        const updateBuffer = (buffer: number[], newVal: number) => {
            const newBuf = [...buffer.slice(1), newVal];
            return newBuf;
        };

        historyBuffer.current.alpha = updateBuffer(historyBuffer.current.alpha, alphaBase);
        historyBuffer.current.beta = updateBuffer(historyBuffer.current.beta, betaBase);
        historyBuffer.current.theta = updateBuffer(historyBuffer.current.theta, thetaBase);

        // 3. Compute Averages (Displayed Values)
        const getAvg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

        const smoothAlpha = getAvg(historyBuffer.current.alpha);
        const smoothBeta = getAvg(historyBuffer.current.beta);
        const smoothTheta = getAvg(historyBuffer.current.theta);

        // 4. Compute Raw Signal
        const random = () => Math.random() - 0.5;
        const noiseMag = config.noiseFloor;
        let rawNoise = (random() * noiseMag) + (Math.sin(t * 55) * 0.15); // HF interference

        if (activeArtifact === 'OCULAR') {
            rawNoise += Math.sin(t * 10) * 8.0;
        } else if (activeArtifact === 'MUSCLE') {
            rawNoise += (Math.random() - 0.5) * 5.0;
        } else if (activeArtifact === 'MAINS') {
            rawNoise += Math.sin(t * 377) * 2.5;
        }

        const raw = smoothBeta + smoothTheta + smoothAlpha + rawNoise;

        return { time, raw, alpha: smoothAlpha, beta: smoothBeta, theta: smoothTheta };
    }, [config.neuroState, config.noiseFloor, activeArtifact]);

    // MAIN LOOP
    useEffect(() => {
        if (!isSystemActive) return;

        const interval = setInterval(() => {
            const time = Date.now();
            const newPoint = generateDataPoint(time);

            setEegData(prev => {
                const newData = [...prev, newPoint];
                if (newData.length > 60) return newData.slice(newData.length - 60);
                return newData;
            });

            if (isRecording) {
                // Efficiently push to ref instead of updating state
                recordedDataRef.current.push(newPoint);
            }

            setCurrentBeta(newPoint.beta);
            setCurrentTheta(newPoint.theta);
            setSessionDuration(prev => prev + 1);

            // Auto Trigger Logic
            if (config.neuroState === NeuroState.DROWSY && Math.random() > 0.995) {
                setConfig(prev => ({ ...prev, neuroState: NeuroState.MICROSLEEP }));
                setAlerts(prev => [`[AUTO_TRIG] >> SUBJECT_STATE_CHANGE :: SYNCOPE_EVENT`, ...prev]);
            }

        }, 50);

        return () => clearInterval(interval);
    }, [generateDataPoint, isSystemActive, config.neuroState, isRecording]);

    // LOGGING
    useEffect(() => {
        if (config.neuroState === NeuroState.DROWSY || config.neuroState === NeuroState.MICROSLEEP) {
            const id = setInterval(() => {
                const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
                const type = config.neuroState === NeuroState.MICROSLEEP ? "EMERGENCY" : "WARNING";
                const code = config.neuroState === NeuroState.MICROSLEEP ? "FATAL_ERROR" : "THRESHOLD_BREACH";
                setAlerts(prev => [`[${timestamp}] [${type}] >> ${code} :: ${config.neuroState}`, ...prev.slice(0, 250)]);
            }, 2000);
            return () => clearInterval(id);
        }
    }, [config.neuroState]);

    const handleStateChange = (newConfig: SimulationConfig) => {
        setConfig(newConfig);
        soundEngine.playClick();
    };

    const handleSidebarStateSelect = (stateKey: string) => {
        setSelectedInfoKey(stateKey);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    if (!isSystemActive) {
        return (
            <div className="h-screen w-screen bg-[#0E1117] flex items-center justify-center relative overflow-hidden font-sans text-gray-400">
                {/* Professional Minimal Background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.02),transparent_70%)]"></div>

                <div className="z-10 w-[450px] bg-black/40 backdrop-blur-md rounded-lg border border-gray-800 p-10 shadow-2xl">
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <div className="text-[11px] text-cyan-600 tracking-[0.2em] mb-2 uppercase font-bold">Secure Access</div>
                            <h1 className="text-3xl font-bold text-white tracking-wide">NEUROSENSE<span className="text-cyan-500">.AI</span></h1>
                        </div>
                    </div>

                    <div className="space-y-4 mb-10">
                        <div className="flex items-center justify-between text-[11px] border-b border-gray-800 pb-2">
                            <span className="text-gray-400 font-bold">SYSTEM INTEGRITY</span>
                            <span className="text-cyan-500 font-mono">READY</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] border-b border-gray-800 pb-2">
                            <span className="text-gray-400 font-bold">ENCRYPTION</span>
                            <span className="text-cyan-500 font-mono">AES-256</span>
                        </div>
                    </div>

                    <button
                        onClick={initializeSystem}
                        className="w-full h-12 bg-cyan-600 hover:bg-cyan-500 text-white font-bold tracking-widest rounded transition-colors flex items-center justify-center gap-2 text-xs"
                    >
                        INITIALIZE SESSION
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-[#0E1117] text-[#e0e0e0] overflow-hidden font-sans">
            <style>{`
        /* Global minimalistic pulse for selected items */
        .related-pulse {
          animation: simple-pulse 2s infinite ease-in-out;
        }
        @keyframes simple-pulse {
          0%, 100% { border-color: rgba(6, 182, 212, 0.2); }
          50% { border-color: rgba(6, 182, 212, 0.6); }
        }
      `}</style>

            {/* Sidebar */}
            <div className="w-80 flex-shrink-0 z-20 border-r border-gray-800 bg-[#0b0d12]">
                <Sidebar
                    config={config}
                    setConfig={handleStateChange}
                    onSelectState={handleSidebarStateSelect}
                    onInjectArtifact={handleArtifactInjection}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col p-6 overflow-hidden relative">

                {/* Header & Controls */}
                <div className="flex justify-between items-center mb-5 border-b border-gray-800 pb-3 relative z-10">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
                            NEUROSENSE.AI
                            <span className="text-[10px] bg-cyan-950/30 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-900/50 font-mono">
                                LIVE_MONITOR
                            </span>
                        </h2>
                        <div className="flex items-center gap-4 mt-1.5">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${['SIGNAL_LOST', 'EMERGENCY', 'CRITICAL'].includes(calculatedStatus)
                                        ? 'bg-red-500'
                                        : calculatedStatus === 'OPTIMAL'
                                            ? 'bg-cyan-400'
                                            : 'bg-yellow-400'
                                    }`}></div>
                                <p className="text-[11px] font-mono font-bold tracking-wider text-gray-300">
                                    STATUS: {calculatedStatus}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Control Toolbar */}
                    <div className="flex items-center gap-4">
                        <div className="flex bg-gray-900 rounded p-1 gap-1 border border-gray-800">
                            <button
                                onClick={toggleRecording}
                                title={isRecording ? "Stop Recording" : "Start Recording"}
                                className={`
                            px-3 py-1.5 text-[10px] font-bold rounded flex items-center gap-3 transition-all min-w-[95px] justify-between
                            ${isRecording
                                        ? 'bg-red-500/10 text-red-400 border border-red-500/50 shadow-[0_0_10px_rgba(220,38,38,0.2)]'
                                        : 'hover:bg-gray-800 text-gray-400 border border-transparent hover:border-gray-700'
                                    }
                        `}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${isRecording ? 'bg-red-500 animate-pulse shadow-[0_0_5px_red]' : 'bg-red-900'}`}></div>
                                    <span>{isRecording ? 'STOP' : 'REC'}</span>
                                </div>
                                <span className={`font-mono tabular-nums ${isRecording ? 'text-white' : 'text-gray-600'}`}>
                                    {isRecording ? formatTime(recordedDataRef.current.length * 0.05) : '--:--'}
                                </span>
                            </button>
                            <button
                                onClick={exportData}
                                title="Export Recorded Data to CSV"
                                disabled={recordedDataRef.current.length === 0}
                                className={`px-3 py-1.5 text-[10px] font-bold rounded flex items-center gap-2 transition-all ${recordedDataRef.current.length > 0 ? 'hover:bg-gray-800 text-cyan-400' : 'text-gray-700 cursor-not-allowed'}`}
                            >
                                <span>EXPORT CSV</span>
                            </button>
                        </div>

                        <div className="h-6 w-px bg-gray-800"></div>

                        <div className="text-right">
                            <div className="text-[10px] text-gray-600 font-mono tracking-widest mb-0.5">SESSION</div>
                            <div className="text-lg font-mono text-white tracking-widest leading-none">{formatTime(sessionDuration)}</div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="flex-1 flex flex-col min-h-0 relative z-10 gap-4">
                    {/* Metrics */}
                    <Metrics
                        neuroState={config.neuroState}
                        onSelect={handleSelection}
                        selectedKey={selectedInfoKey}
                        relatedKeys={relatedKeys}
                    />

                    {/* Charts Area */}
                    <div className="flex-1 flex gap-4 min-h-0">
                        <div className="flex-[3] flex flex-col gap-4">
                            <div className="h-1/3 border border-gray-800 rounded bg-[#0b0d12]">
                                <Oscilloscope
                                    data={eegData}
                                    onSelect={handleSelection}
                                    selectedKey={selectedInfoKey}
                                    relatedKeys={relatedKeys}
                                />
                            </div>
                            <div className="h-2/3 border border-gray-800 rounded bg-[#0b0d12]">
                                <BandCharts
                                    data={eegData}
                                    onSelect={handleSelection}
                                    selectedKey={selectedInfoKey}
                                    relatedKeys={relatedKeys}
                                />
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col gap-4 min-w-[320px]">
                            <div className="flex-1 border border-gray-800 rounded bg-[#0b0d12]">
                                <BrainMap
                                    neuroState={config.neuroState}
                                    betaLevel={currentBeta}
                                    thetaLevel={currentTheta}
                                    onSelect={handleSelection}
                                    selectedKey={selectedInfoKey}
                                    relatedKeys={relatedKeys}
                                />
                            </div>
                            <div className="h-72 border border-gray-800 rounded bg-[#0b0d12]">
                                <InfoPanel
                                    selectedKey={selectedInfoKey}
                                    logs={alerts}
                                    onClose={clearSelection}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;