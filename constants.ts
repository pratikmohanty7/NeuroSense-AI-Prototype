import { Subject, NeuroState, InfoDetail, DashboardZone } from './types';

export const COLORS = {
  background: '#0E1117',
  cyan: '#06b6d4', // Modern Cyan
  purple: '#a855f7', // Modern Purple
  green: '#22c55e', // Modern Green
  red: '#ef4444', // Modern Red
  blue: '#3b82f6', // Drowsy Occipital
  yellow: '#eab308', // Distracted
  orange: '#f97316', // Alpha
  grid: '#1f2937'
};

export const SUBJECTS: Subject[] = [
  { id: 'SUB-091-ACT', name: 'PRATIK, A. [CMDR] // SECTOR 7' },
  { id: 'SUB-092-OPS', name: 'SAI, L. [LT_CMDR] // OPS_MAIN' },
  { id: 'SUB-734-XEO', name: 'REYES, V. [CPT] // CALLSIGN: NOVA' },
  { id: 'SUB-099-HVY', name: 'THORNE, M. [SPC] // EXO_MECH' },
  { id: 'SUB-000-NULL', name: 'UNIDENTIFIED_SIGNAL_SOURCE' },
];

export const STATE_PARAMS = {
  [NeuroState.FOCUS]: {
    betaAmp: 1.5,
    alphaAmp: 0.3,
    thetaAmp: 0.2,
    blinkRate: 12,
    cogLoad: 92,
    fatigue: 12,
    status: 'OPTIMAL'
  },
  [NeuroState.DISTRACTED]: {
    betaAmp: 0.8,
    alphaAmp: 0.8,
    thetaAmp: 0.5,
    blinkRate: 25,
    cogLoad: 65,
    fatigue: 35,
    status: 'WARNING'
  },
  [NeuroState.DROWSY]: {
    betaAmp: 0.3,
    alphaAmp: 1.5,
    thetaAmp: 1.2,
    blinkRate: 8,
    cogLoad: 35,
    fatigue: 85,
    status: 'CRITICAL'
  },
  [NeuroState.MICROSLEEP]: {
    betaAmp: 0.1,
    alphaAmp: 0.4,
    thetaAmp: 2.5,
    blinkRate: 2,
    cogLoad: 15,
    fatigue: 98,
    status: 'EMERGENCY'
  }
};

// Accurate BCI Information Database
export const SYSTEM_INFO: Record<string, InfoDetail> = {
  // BANDS
  'ALPHA': {
    id: 'BND_ALPHA',
    title: 'Alpha Rhythm (8-13 Hz)',
    frequencyBand: '8 - 13 Hz',
    description: 'Rhythmic thalamocortical oscillations. Primary marker of posterior cortical idling. Exhibits inverse correlation with visual attention load.',
    clinicalSignificance: 'Alpha attenuation (Event-Related Desynchronization) confirms visual cortex engagement. Paradoxical alpha bursts indicate cognitive lapse.'
  },
  'BETA': {
    id: 'BND_BETA',
    title: 'Beta Rhythm (13-30 Hz)',
    frequencyBand: '13 - 30 Hz',
    description: 'Desynchronized low-voltage fast activity. Correlates with active GABAergic inhibitory maintenance during sensorimotor and cognitive tasks.',
    clinicalSignificance: 'High-Beta (>25Hz) indicates hyper-vigilance or anxiety. Stable Mid-Beta confirms executive function engagement.'
  },
  'THETA': {
    id: 'BND_THETA',
    title: 'Theta Rhythm (4-8 Hz)',
    frequencyBand: '4 - 8 Hz',
    description: 'Slow-wave synchronous activity generated in the hippocampus and anterior cingulate cortex. Modulates memory encoding and sleep onset.',
    clinicalSignificance: 'Anterior dominance suggests working memory load; generalized slowing indicates Stage 1 NREM sleep transition.'
  },
  'RAW_EEG': {
    id: 'SIG_RAW',
    title: 'Raw Microvolt Potential',
    description: 'Unfiltered differential voltage between active and reference electrodes. Includes EMG/EOG artifacts and ambient noise floor.',
    clinicalSignificance: 'Baseline for artifact rejection algorithms. Verify signal-to-noise ratio (SNR) > 10dB before spectral analysis.'
  },
  
  // METRICS
  'COG_LOAD': {
    id: 'MTR_LOAD',
    title: 'Cognitive Workload Index',
    description: 'Composite metric derived from Beta/(Alpha+Theta) power ratio at Fp1/Fp2 sites. Proxies working memory saturation.',
    clinicalSignificance: 'Values < 30% indicate disengagement. Values > 90% risk cognitive overload and decision fatigue.'
  },
  'FATIGUE': {
    id: 'MTR_FATIGUE',
    title: 'Fatigue Probability (p)',
    description: 'Logistic regression model utilizing spectral slowing (Alpha-to-Theta shift) and oculomotor latency variables.',
    clinicalSignificance: 'p > 0.75 necessitates intervention (Protocol: HAPTIC_WAKE). Correlates with reaction time degradation > 200ms.'
  },
  'BLINK_RATE': {
    id: 'MTR_EOG',
    title: 'Oculometrics (EOG)',
    description: 'Electrooculography tracking. Monitors blink duration, frequency, and PERCLOS (Percentage of Eyelid Closure).',
    clinicalSignificance: 'Blink duration > 500ms and slow-rolling eye movements (SEMs) are definitive biomarkers for hypovigilance.'
  },
  'STATUS': {
    id: 'SYS_INTEGRITY',
    title: 'System Integrity Monitor',
    description: 'Real-time diagnostic loop checking electrode impedance (<5kΩ) and data packet loss rates.',
    clinicalSignificance: 'Determines reliability confidence interval. "CRITICAL" state triggers automated safety lockout procedures.'
  },

  // REGIONS
  'FRONTAL': {
    id: 'LOBE_FRONTAL',
    title: 'Frontal Cortex (Fp1/Fp2)',
    region: 'Anterior',
    description: 'Prefrontal cortex; locus of executive function, voluntary motor planning, and decision-making logic gates.',
    clinicalSignificance: 'Delta/Theta intrusion here is the primary marker for "Hypofrontality" associated with sleep deprivation.'
  },
  'TEMPORAL': {
    id: 'LOBE_TEMPORAL',
    title: 'Temporal Lobe (T3/T4)',
    region: 'Lateral',
    description: 'Processing hub for auditory sensory input and semantic memory retention.',
    clinicalSignificance: 'Asymmetry (>15%) suggests localized cortical stress or electrode contact failure.'
  },
  'OCCIPITAL': {
    id: 'LOBE_OCCIPITAL',
    title: 'Occipital Lobe (O1/O2)',
    region: 'Posterior',
    description: 'Visual processing center (V1). The primary generator of the posterior dominant rhythm (Alpha).',
    clinicalSignificance: 'Standard reference for "Eyes Open/Closed" calibration. Absence of Alpha blocking indicates inattention blindness.'
  },

  // STATES
  'FOCUS': {
    id: 'ST_FLOW',
    title: 'State: Cognitive Flow',
    description: 'Optimal neural efficiency. characterized by stable Beta coherence and suppressed low-frequency bands.',
    clinicalSignificance: 'Peak operational readiness. Sustained duration limit ~45min before performance degradation.'
  },
  'DISTRACTED': {
    id: 'ST_FRAG',
    title: 'State: Attention Fragmentation',
    description: 'Inconsistent cortical synchronization. Intermittent Alpha bursts appearing during visual tasks.',
    clinicalSignificance: 'Reduced task efficiency. Recommend sensory cueing to re-orient attention network.'
  },
  'DROWSY': {
    id: 'ST_HYPO',
    title: 'State: Hypovigilance',
    description: 'Wake-Sleep transition. Characterized by "Alpha Dropout", Theta emergence, and oculomotor slowing.',
    clinicalSignificance: 'HAZARD CLASS 2. Response latency compromised. Immediate operator stimulus required.'
  },
  'MICROSLEEP': {
    id: 'ST_SYNC',
    title: 'State: Syncope/Microsleep',
    description: 'Brief (1-10s) episodes of unconsciousness. EEG morphology resembles NREM Stage 1 (Vertex waves).',
    clinicalSignificance: 'HAZARD CLASS 1 (EMERGENCY). Total environmental dissociation. Engage automated override systems.'
  }
};

// Relationship Mapping for Cross-Highlighting
export const RELATIONSHIPS: Record<string, string[]> = {
  'ALPHA': ['OCCIPITAL', 'FATIGUE', 'DISTRACTED'],
  'BETA': ['FRONTAL', 'COG_LOAD', 'FOCUS', 'STATUS'],
  'THETA': ['TEMPORAL', 'DROWSY', 'MICROSLEEP', 'FATIGUE'],
  'RAW_EEG': ['STATUS', 'BLINK_RATE'],
  'COG_LOAD': ['BETA', 'FRONTAL', 'FOCUS'],
  'FATIGUE': ['THETA', 'ALPHA', 'BLINK_RATE', 'DROWSY'],
  'BLINK_RATE': ['FRONTAL', 'RAW_EEG', 'DROWSY'],
  'STATUS': ['RAW_EEG', 'MICROSLEEP'],
  'FRONTAL': ['BETA', 'COG_LOAD', 'BLINK_RATE', 'FOCUS'],
  'TEMPORAL': ['THETA'],
  'OCCIPITAL': ['ALPHA', 'DISTRACTED'],
  'FOCUS': ['BETA', 'FRONTAL', 'COG_LOAD'],
  'DISTRACTED': ['ALPHA', 'OCCIPITAL'],
  'DROWSY': ['THETA', 'FATIGUE', 'BLINK_RATE'],
  'MICROSLEEP': ['THETA', 'FATIGUE', 'STATUS', 'RAW_EEG']
};

export const KEY_TO_ZONE_MAP: Record<string, DashboardZone> = {
  'ALPHA': 'BANDS',
  'BETA': 'BANDS',
  'THETA': 'BANDS',
  'RAW_EEG': 'OSCILLOSCOPE',
  'COG_LOAD': 'METRICS',
  'FATIGUE': 'METRICS',
  'BLINK_RATE': 'METRICS',
  'STATUS': 'METRICS',
  'FRONTAL': 'MAP',
  'TEMPORAL': 'MAP',
  'OCCIPITAL': 'MAP',
  'FOCUS': 'INFO',
  'DISTRACTED': 'INFO',
  'DROWSY': 'INFO',
  'MICROSLEEP': 'INFO'
};
