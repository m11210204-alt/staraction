import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { mockConstellations } from '../data/mockData';
import type {
  ActionRecord,
  Interaction,
  Participation,
  UserRecord,
} from './types';

const storagePath = path.join(process.cwd(), 'server', 'storage.json');

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

const seedActions = (): ActionRecord[] =>
  mockConstellations.map((action) => {
    const cloned = cloneAction(action) as ActionRecord;
    cloned.ownerId = users.find((u) => u.email === 'admin@example.com')?.id || cloned.ownerId;
    cloned.comments = (cloned.comments || []).map((comment) => ({
      ...comment,
      replies: comment.replies || [],
    }));
    cloned.participants = cloned.participants || [];
    cloned.uploads = cloned.uploads || [];
    cloned.updates = cloned.updates || [];
    return cloned;
  });

const loadPersisted = (): {
  actions: ActionRecord[];
  participations: Participation[];
  interactions: Interaction[];
} | null => {
  if (!fs.existsSync(storagePath)) return null;
  try {
    const raw = fs.readFileSync(storagePath, 'utf8');
    const parsed = JSON.parse(raw);
    const adminId = users.find((u) => u.email === 'admin@example.com')?.id;
    if (adminId && Array.isArray(parsed.actions)) {
      parsed.actions = parsed.actions.map((a: ActionRecord) => ({
        ...a,
        ownerId: adminId,
      }));
    }
    return parsed;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Failed to load persisted data, using seed', err);
    return null;
  }
};

const persisted = loadPersisted();

export const actions: ActionRecord[] = persisted?.actions ?? seedActions();

export const participations: Participation[] = persisted?.participations ?? [];

export const interactions: Interaction[] = persisted?.interactions ?? [];

export const generateId = (prefix: string) => `${prefix}-${uuidv4()}`;

export const saveData = () => {
  const payload = {
    actions,
    participations,
    interactions,
  };
  try {
    fs.writeFileSync(storagePath, JSON.stringify(payload, null, 2), 'utf8');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to persist data', err);
  }
};

// Ensure we have a persisted snapshot after bootstrapping
if (!persisted) {
  saveData();
}
