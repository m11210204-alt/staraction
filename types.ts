
export enum ActionStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
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
  initiator: string;
  participants: Star[];
  maxParticipants: number;
  shapePoints: ShapePoint[];
  comments: Comment[];
  updates: Update[];
  uploads: Upload[];
  resources: Resource[];
}