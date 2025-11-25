import type { Request } from 'express';
import type { ConstellationData } from '../types';

export type Role = 'user' | 'admin';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  avatar: string;
  passwordHash: string;
  role: Role;
}

export interface Participation {
  id: string;
  actionId: string;
  userId: string;
  motivation: string;
  selectedTags: string[];
  resourceDescription: string;
  phone: string;
  joinedAt: string;
  pointIndex: number;
}

export type InteractionType = 'support' | 'meaningful' | 'interested';

export interface Interaction {
  id: string;
  actionId: string;
  userId: string;
  type: InteractionType;
  createdAt: string;
}

export interface CommentRecord {
  id: string;
  actionId: string;
  userId: string;
  author: string;
  avatar?: string;
  text: string;
  imageUrl?: string;
  parentId?: string;
  createdAt: string;
  replies?: CommentRecord[];
}

export interface ActionRecord extends ConstellationData {
  ownerId: string;
}

export interface AuthenticatedRequest extends Request {
  currentUser?: UserRecord;
}

export interface TokenPayload {
  userId: string;
}
