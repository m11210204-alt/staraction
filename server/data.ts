import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { mockConstellations } from '../data/mockData';
import type {
  ActionRecord,
  Interaction,
  Participation,
  UserRecord,
} from './types';

export const users: UserRecord[] = [
  {
    id: 'user-demo',
    name: 'Demo User',
    email: 'demo@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=random&color=fff&background=D89C23',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'user',
  },
  {
    id: 'user-admin',
    name: 'Grace Admin',
    email: 'admin@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Grace+Admin&background=random&color=fff&background=D89C23',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'admin',
  },
];

const cloneAction = <T>(action: T): T => JSON.parse(JSON.stringify(action));

export const actions: ActionRecord[] = mockConstellations.map((action, idx) => {
  const cloned = cloneAction(action) as ActionRecord;
  cloned.ownerId = action.ownerId ?? (idx % 2 === 0 ? users[0].id : users[1].id);
  cloned.comments = (cloned.comments || []).map((comment) => ({
    ...comment,
    replies: comment.replies || [],
  }));
  cloned.participants = cloned.participants || [];
  cloned.uploads = cloned.uploads || [];
  cloned.updates = cloned.updates || [];
  return cloned;
});

export const participations: Participation[] = [];

export const interactions: Interaction[] = [];

export const generateId = (prefix: string) => `${prefix}-${uuidv4()}`;
