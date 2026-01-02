export enum NeuroState {
  FOCUS = 'COGNITIVE_FLOW_STATE',
  DISTRACTED = 'ATTENTION_FRAGMENTATION',
  DROWSY = 'HYPOVIGILANCE_ONSET',
  MICROSLEEP = 'SYNCOPE_WARNING_CLASS_4'
}

export type ArtifactType = 'OCULAR' | 'MUSCLE' | 'MAINS' | null;

export interface EegDataPoint {
  time: number;
  raw: number;
  alpha: number;
  beta: number;
  theta: number;
}

export interface Subject {
  id: string;
  name: string;
}

export interface SimulationConfig {
  neuroState: NeuroState;
  noiseFloor: number;
  fatigueThreshold: number; // Sensitivity control
  subject: Subject;
}

export interface InfoDetail {
  id: string;
  title: string;
  description: string;
  clinicalSignificance: string;
  frequencyBand?: string;
  region?: string;
}

export type DashboardZone = 'METRICS' | 'OSCILLOSCOPE' | 'BANDS' | 'MAP' | 'INFO' | null;