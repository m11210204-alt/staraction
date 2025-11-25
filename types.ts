
export enum ActionStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface Star {
  id: string;
  key: string;
  pointIndex: number;
}

export interface Comment {
  id:string;
  author: string;
  avatar?: string;
  text: string;
  imageUrl?: string;
  replies?: Comment[];
}

export interface Upload {
  id: string;
  url: string;
  caption: string;
}

export interface Resource {
  id: string;
  type: "經費" | "人力" | "物資";
  description: string;
  provider: string;
}

export interface Update {
  date: string;
  text: string;
}

export interface ShapePoint {
  x: number;
  y: number;
}

export interface ParticipationTag {
  label: string;
  target?: number;
  description?: string;
}

// SROI Data Structures
export interface SROIItem {
  name: string;
  value: string; // Display string e.g. "500 小時" or "$200,000"
  amount?: number; // Numeric value for calculation (Cost for inputs)
  description?: string;
}

export interface SROIOutcome extends SROIItem {
  monetizedValue: number; // The calculated financial proxy value
}

export interface SROIReport {
  lastUpdated: string;
  currencyUnit: string;
  sroiRatio: number;
  totalImpactValue: number;
  inputs: SROIItem[];
  outputs: SROIItem[];
  outcomes: SROIOutcome[];
}

export interface ConstellationData {
  id: string;
  name: string;
  category: string;
  region?: string;
  status: ActionStatus;
  summary: string;
  background: string;
  goals: string[];
  howToParticipate: string;
  participationTags: ParticipationTag[];
  initiator: string;
  ownerId?: string;
  participants: Star[];
  maxParticipants: number;
  shapePoints: ShapePoint[];
  comments: Comment[];
  updates: Update[];
  uploads: Upload[];
  resources: Resource[];
  sroiReport?: SROIReport; // Optional field for SROI data
}
