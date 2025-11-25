import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { z } from 'zod';
import {
  actions,
  generateId,
  interactions,
  participations,
  saveData,
  users,
} from './data';
import type {
  ActionRecord,
  AuthenticatedRequest,
  CommentRecord,
  InteractionType,
  TokenPayload,
  UserRecord,
} from './types';
import { ActionStatus } from '../types';

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const uploadDir = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e5)}`;
    const ext = path.extname(file.originalname) || '.bin';
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({ storage });

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(uploadDir));

const toPublicUser = (user: UserRecord) => {
  const { passwordHash, ...rest } = user;
  return rest;
};

const signToken = (userId: string) =>
  jwt.sign({ userId } satisfies TokenPayload, JWT_SECRET, {
    expiresIn: '7d',
  });

const requireAuth = (
  req: AuthenticatedRequest,
  res: express.Response,
  next: express.NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : undefined;
  const token = bearerToken || req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
    const user = users.find((u) => u.id === payload.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.currentUser = user;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const findAction = (actionId: string) =>
  actions.find((a) => a.id === actionId);

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  avatar: z.string().url().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const participationSchema = z.object({
  motivation: z.string().min(1, 'Motivation is required'),
  selectedTags: z.array(z.string()).optional(),
  resourceDescription: z.string().min(1, 'Resource description is required'),
  phone: z.string().min(1, 'Phone is required'),
});

const updateActionSchema = z.object({
  name: z.string().optional(),
  category: z.string().optional(),
  region: z.string().optional(),
  status: z.nativeEnum(ActionStatus).optional(),
  summary: z.string().optional(),
  background: z.string().optional(),
  goals: z.array(z.string()).optional(),
  howToParticipate: z.string().optional(),
  participationTags: z
    .array(
      z.object({
        title: z.string().optional(),
        label: z.string(),
        target: z.number().optional(),
        description: z.string().optional(),
      }),
    )
    .optional(),
  initiator: z.string().optional(),
  maxParticipants: z.number().int().positive().optional(),
  shapePoints: z
    .array(
      z.object({
        x: z.number(),
        y: z.number(),
      }),
    )
    .optional(),
  updates: z
    .array(
      z.object({
        date: z.string(),
        text: z.string(),
      }),
    )
    .optional(),
  sroiReport: z
    .object({
      lastUpdated: z.string(),
      currencyUnit: z.string(),
      sroiRatio: z.number(),
      totalImpactValue: z.number(),
      inputs: z.array(
        z.object({
          name: z.string(),
          value: z.string(),
          amount: z.number().optional(),
          description: z.string().optional(),
        }),
      ),
      outputs: z.array(
        z.object({
          name: z.string(),
          value: z.string(),
          description: z.string().optional(),
        }),
      ),
      outcomes: z.array(
        z.object({
          name: z.string(),
          value: z.string(),
          amount: z.number().optional(),
          description: z.string().optional(),
          monetizedValue: z.number(),
        }),
      ),
    })
    .optional(),
});

const createActionSchema = updateActionSchema.required({
  name: true,
  category: true,
  status: true,
  summary: true,
  background: true,
  goals: true,
  howToParticipate: true,
  participationTags: true,
  maxParticipants: true,
  shapePoints: true,
  initiator: true,
});

const commentSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  imageUrl: z.string().url().optional(),
});

const filterActions = (query: {
  category?: string;
  region?: string;
  status?: string;
  search?: string;
}) => {
  let results = actions;
  if (query.category) {
    results = results.filter(
      (a) => a.category.toLowerCase() === query.category!.toLowerCase(),
    );
  }
  if (query.region) {
    results = results.filter(
      (a) => a.region?.toLowerCase() === query.region!.toLowerCase(),
    );
  }
  if (query.status) {
    results = results.filter(
      (a) => a.status.toLowerCase() === query.status!.toLowerCase(),
    );
  }
  if (query.search) {
    const needle = query.search.toLowerCase();
    results = results.filter(
      (a) =>
        a.name.toLowerCase().includes(needle) ||
        a.summary.toLowerCase().includes(needle) ||
        a.background.toLowerCase().includes(needle),
    );
  }
  return results;
};

const getInteractionSummary = (actionId: string) => {
  const summary = {
    support: 0,
    meaningful: 0,
    interested: 0,
  };
  interactions.forEach((i) => {
    if (i.actionId === actionId) {
      summary[i.type] += 1;
    }
  });
  return summary;
};

const nextPointIndex = (action: ActionRecord) => {
  const used = new Set(action.participants.map((p) => p.pointIndex));
  if (used.size < action.shapePoints.length) {
    for (let i = 0; i < action.shapePoints.length; i += 1) {
      if (!used.has(i)) return i;
    }
  }
  return action.participants.length % action.shapePoints.length;
};

const findComment = (
  comments: CommentRecord[],
  commentId: string,
): CommentRecord | undefined => {
  for (const c of comments) {
    if (c.id === commentId) return c;
    if (c.replies?.length) {
      const nested = findComment(c.replies as CommentRecord[], commentId);
      if (nested) return nested;
    }
  }
  return undefined;
};

const toUploadUrl = (req: express.Request, value?: string) => {
  if (!value) return undefined;
  if (value.startsWith('http')) return value;
  return `${req.protocol}://${req.get('host')}/uploads/${value}`;
};

const optionalAuth = (
  req: AuthenticatedRequest,
  _res: express.Response,
  next: express.NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : undefined;
  const token = bearerToken || req.cookies?.token;
  if (!token) {
    return next();
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
    const user = users.find((u) => u.id === payload.userId);
    if (user) req.currentUser = user;
  } catch {
    // ignore invalid token for optional flow
  }
  return next();
};

const aiKey = process.env.OPENAI_API_KEY;

const aiFallback = (query: string) => {
  const needle = query.toLowerCase();
  return actions
    .map((a) => {
      const text = `${a.name} ${a.summary} ${a.background} ${a.category} ${(a.participationTags || [])
        .map((t) => `${t.title || ''} ${t.label} ${t.description || ''}`)
        .join(' ')}`.toLowerCase();
      const score =
        (text.includes(needle) ? 2 : 0) +
        (a.participationTags || []).filter((t) => t.label.toLowerCase().includes(needle)).length * 0.5;
      return { id: a.id, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((r) => r.id);
};

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/api/auth/register', (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }
  const { name, email, password, avatar } = parsed.data;
  const existing = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  );
  if (existing) {
    return res.status(409).json({ message: 'Email already registered' });
  }
  const user: UserRecord = {
    id: generateId('user'),
    name,
    email: email.toLowerCase(),
    avatar:
      avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name,
      )}&background=random&color=fff&background=D89C23`,
    passwordHash: bcrypt.hashSync(password, 10),
    role: 'user',
  };
  users.push(user);
  const token = signToken(user.id);
  return res.json({ token, user: toPublicUser(user) });
});

app.post('/api/auth/login', (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }
  const { email, password } = parsed.data;
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  );
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = signToken(user.id);
  return res.json({ token, user: toPublicUser(user) });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  return res.json({ user: toPublicUser(req.currentUser!) });
});

app.get('/api/actions', (req, res) => {
  const { category, region, status, search } = req.query;
  const page = Math.max(parseInt((req.query.page as string) || '1', 10), 1);
  const pageSize = Math.min(
    Math.max(parseInt((req.query.pageSize as string) || '10', 10), 1),
    50,
  );
  const filtered = filterActions({
    category: category as string,
    region: region as string,
    status: status as string,
    search: search as string,
  });
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize).map((action) => ({
    ...action,
    interactions: getInteractionSummary(action.id),
  }));
  return res.json({ data, page, pageSize, total });
});

app.get('/api/actions/:id', (req, res) => {
  const action = findAction(req.params.id);
  if (!action) {
    return res.status(404).json({ message: 'Action not found' });
  }
  return res.json({
    action: {
      ...action,
      interactions: getInteractionSummary(action.id),
    },
    participations: participations.filter((p) => p.actionId === action.id),
  });
});

app.post('/api/actions', requireAuth, (req, res) => {
  const parsed = createActionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }
  const newAction: ActionRecord = {
    ...parsed.data,
    id: generateId('action'),
    ownerId: req.currentUser!.id,
    participants: [],
    comments: [],
    uploads: [],
    updates: parsed.data.updates || [],
    resources: [],
  };
  actions.unshift(newAction);
  saveData();
  return res.status(201).json({ action: newAction });
});

app.put('/api/actions/:id', requireAuth, (req, res) => {
  const action = findAction(req.params.id);
  if (!action) {
    return res.status(404).json({ message: 'Action not found' });
  }
  if (
    action.ownerId !== req.currentUser!.id &&
    req.currentUser!.role !== 'admin'
  ) {
    return res.status(403).json({ message: 'Not authorized to update' });
  }
  const parsed = updateActionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }
  Object.assign(action, parsed.data);
  saveData();
  return res.json({ action });
});

app.post('/api/actions/:id/join', requireAuth, (req, res) => {
  const action = findAction(req.params.id);
  if (!action) {
    return res.status(404).json({ message: 'Action not found' });
  }
  const parsed = participationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const alreadyJoined = participations.find(
    (p) => p.actionId === action.id && p.userId === req.currentUser!.id,
  );
  if (alreadyJoined) {
    return res.status(400).json({ message: 'Already joined this action' });
  }
  if (
    action.maxParticipants &&
    action.participants.length >= action.maxParticipants
  ) {
    return res.status(400).json({ message: 'Action is full' });
  }
  const requiresTags = action.participationTags?.length;
  if (requiresTags && (!parsed.data.selectedTags || !parsed.data.selectedTags.length)) {
    return res
      .status(400)
      .json({ message: 'Please select at least one participation tag' });
  }

  const pointIndex = nextPointIndex(action);

  const participation = {
    id: generateId('part'),
    actionId: action.id,
    userId: req.currentUser!.id,
    motivation: parsed.data.motivation,
    selectedTags: parsed.data.selectedTags || [],
    resourceDescription: parsed.data.resourceDescription.trim(),
    phone: parsed.data.phone,
    joinedAt: new Date().toISOString(),
    pointIndex,
  };
  participations.push(participation);

  action.participants.push({
    id: req.currentUser!.id,
    key: `${req.currentUser!.id}-${action.id}`,
    pointIndex,
  });
  saveData();

  return res.status(201).json({
    participation,
    pointIndex,
    participantCount: action.participants.length,
  });
});

app.post('/api/actions/:id/interact', requireAuth, (req, res) => {
  const action = findAction(req.params.id);
  if (!action) {
    return res.status(404).json({ message: 'Action not found' });
  }
  const type = (req.body?.type || '') as InteractionType;
  if (!['support', 'meaningful', 'interested'].includes(type)) {
    return res.status(400).json({ message: 'Invalid interaction type' });
  }
  const existingIndex = interactions.findIndex(
    (i) =>
      i.actionId === action.id &&
      i.userId === req.currentUser!.id &&
      i.type === type,
  );
  if (existingIndex >= 0) {
    interactions.splice(existingIndex, 1);
  } else {
    interactions.push({
      id: generateId('ia'),
      actionId: action.id,
      userId: req.currentUser!.id,
      type,
      createdAt: new Date().toISOString(),
    });
  }
  saveData();
  const summary = getInteractionSummary(action.id);
  const interestedIds = interactions
    .filter((i) => i.userId === req.currentUser!.id && i.type === 'interested')
    .map((i) => i.actionId);
  return res.json({
    status: 'ok',
    summary,
    interestedIds,
  });
});

app.get('/api/users/me/interested', requireAuth, (req, res) => {
  const interested = interactions
    .filter(
      (i) => i.userId === req.currentUser!.id && i.type === 'interested',
    )
    .map((i) => i.actionId);
  return res.json({ actionIds: interested });
});

app.post(
  '/api/actions/:id/comments',
  requireAuth,
  upload.single('image'),
  (req, res) => {
    const action = findAction(req.params.id);
    if (!action) {
      return res.status(404).json({ message: 'Action not found' });
    }

    const imageUrl = toUploadUrl(req, req.file?.filename || req.body.imageUrl);
    const parsed = commentSchema.safeParse({
      text: req.body.text,
      imageUrl,
    });
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0].message });
    }

    const comment: CommentRecord = {
      id: generateId('cmt'),
      actionId: action.id,
      userId: req.currentUser!.id,
      author: req.currentUser!.name,
      avatar: req.currentUser!.avatar,
      text: parsed.data.text,
      imageUrl,
    createdAt: new Date().toISOString(),
    replies: [],
  };

  action.comments.push(comment);
  saveData();
  return res.status(201).json({ comment });
},
);

app.post(
  '/api/comments/:commentId/reply',
  requireAuth,
  upload.single('image'),
  (req, res) => {
    const imageUrl = toUploadUrl(req, req.file?.filename || req.body.imageUrl);
    const parsed = commentSchema.safeParse({
      text: req.body.text,
      imageUrl,
    });
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0].message });
    }
    let targetAction: ActionRecord | undefined;
    let parent: CommentRecord | undefined;
    for (const action of actions) {
      const found = findComment(action.comments as CommentRecord[], req.params.commentId);
      if (found) {
        parent = found;
        targetAction = action;
        break;
      }
    }
    if (!parent || !targetAction) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    const reply: CommentRecord = {
      id: generateId('reply'),
      actionId: targetAction.id,
      userId: req.currentUser!.id,
      author: req.currentUser!.name,
      avatar: req.currentUser!.avatar,
      text: parsed.data.text,
      imageUrl,
      parentId: parent.id,
      createdAt: new Date().toISOString(),
      replies: [],
    };
    parent.replies = parent.replies || [];
    parent.replies.push(reply);
    saveData();
    return res.status(201).json({ reply });
  },
);

app.post('/api/upload', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  return res.status(201).json({ url, filename: req.file.originalname });
});

app.post('/api/actions/:id/outcomes', requireAuth, (req, res) => {
  const action = findAction(req.params.id);
  if (!action) {
    return res.status(404).json({ message: 'Action not found' });
  }
  if (
    action.ownerId !== req.currentUser!.id &&
    req.currentUser!.role !== 'admin'
  ) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  const { url, caption } = req.body || {};
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ message: 'Outcome URL is required' });
  }
  const uploadItem = {
    id: generateId('upload'),
    url,
    caption: caption || '',
  };
  action.uploads.push(uploadItem);
  saveData();
  return res.status(201).json({ upload: uploadItem });
});

app.put('/api/actions/:id/outcomes/:uploadId', requireAuth, (req, res) => {
  const action = findAction(req.params.id);
  if (!action) {
    return res.status(404).json({ message: 'Action not found' });
  }
  if (
    action.ownerId !== req.currentUser!.id &&
    req.currentUser!.role !== 'admin'
  ) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  const uploadItem = action.uploads.find((u) => u.id === req.params.uploadId);
  if (!uploadItem) {
    return res.status(404).json({ message: 'Outcome not found' });
  }
  uploadItem.caption = req.body?.caption ?? uploadItem.caption;
  uploadItem.url = req.body?.url ?? uploadItem.url;
  saveData();
  return res.json({ upload: uploadItem });
});

app.delete('/api/actions/:id/outcomes/:uploadId', requireAuth, (req, res) => {
  const action = findAction(req.params.id);
  if (!action) {
    return res.status(404).json({ message: 'Action not found' });
  }
  if (
    action.ownerId !== req.currentUser!.id &&
    req.currentUser!.role !== 'admin'
  ) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  const index = action.uploads.findIndex((u) => u.id === req.params.uploadId);
  if (index === -1) {
    return res.status(404).json({ message: 'Outcome not found' });
  }
  action.uploads.splice(index, 1);
  saveData();
  return res.json({ message: 'Deleted' });
});

app.post('/api/ai/recommend', optionalAuth, async (req, res) => {
  const query = (req.body?.query as string) || '';
  const interestedIds = (req.body?.interestedIds as string[]) || [];
  const userId = req.currentUser?.id;

  if (!query.trim()) return res.json({ ids: [] });

  // If no key, avoid誤導，直接回空
  if (!aiKey) {
    return res.json({ ids: [], source: 'fallback:no-key' });
  }

  try {
    const actionSummary = actions.map((a) => ({
      id: a.id,
      name: a.name,
      category: a.category,
      summary: a.summary,
      tags: a.participationTags,
    }));

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            '你是行動推薦助理，根據使用者輸入與偏好，從提供的行動列表回傳最相關的 5 個行動 id 陣列（只回傳 JSON 陣列）。',
        },
        {
          role: 'user',
          content: JSON.stringify({
            query,
            userId,
            interestedIds,
            actions: actionSummary,
          }),
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${aiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) {
      throw new Error(`OpenAI error ${response.status}`);
    }
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) {
      return res.json({ ids: [], source: 'fallback:empty-response' });
    }
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return res.json({ ids: [], source: 'fallback:parse-error' });
    }
    if (Array.isArray(parsed)) {
      return res.json({ ids: parsed, source: 'openai' });
    }
    if (Array.isArray(parsed?.ids)) {
      return res.json({ ids: parsed.ids, source: 'openai' });
    }
    return res.json({ ids: [], source: 'fallback:unexpected-shape' });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('AI recommend error', err);
    return res.json({
      ids: [],
      source: 'fallback:error',
      error: (err as Error)?.message || 'unknown',
    });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API server running at http://localhost:${PORT}`);
});
