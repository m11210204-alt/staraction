import type { ConstellationData, User } from '../types';

export interface AIRecommendInput {
  query: string;
  actions: ConstellationData[];
  interestedIds?: string[];
  currentUser?: User | null;
}

const getOpenAIKey = () => {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('OPENAI_API_KEY');
    if (stored) return stored;
  }
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_OPENAI_API_KEY) {
    return (import.meta as any).env.VITE_OPENAI_API_KEY as string;
  }
  return '';
};

const basicHeuristic = (query: string, actions: ConstellationData[]): string[] => {
  const needle = query.toLowerCase();
  return actions
    .map((a) => {
      const text = `${a.name} ${a.summary} ${a.background} ${a.category} ${(a.participationTags || [])
        .map((t) => `${t.title || ''} ${t.label} ${t.description || ''}`)
        .join(' ')}`.toLowerCase();
      const score = text.includes(needle) ? 2 : 0.5;
      return { id: a.id, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((r) => r.id);
};

export const getAIRecommendations = async ({
  query,
  actions,
  interestedIds = [],
  currentUser,
}: AIRecommendInput): Promise<string[]> => {
  const key = getOpenAIKey();
  if (!query.trim()) return [];
  if (!key) {
    return basicHeuristic(query, actions);
  }

  const prompt = [
    {
      role: 'system',
      content:
        '你是行動推薦助理，根據使用者輸入、偏好、歷史參與，從提供的行動列表回傳最相關的 5 個行動 id 陣列，JSON 格式，例如 ["const-1","const-2"]。只輸出 JSON。',
    },
    {
      role: 'user',
      content: JSON.stringify({
        query,
        interestedIds,
        userId: currentUser?.id,
        actions: actions.map((a) => ({
          id: a.id,
          name: a.name,
          category: a.category,
          summary: a.summary,
          participationTags: a.participationTags,
        })),
      }),
    },
  ];

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: prompt,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('No AI response');
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed as string[];
    if (Array.isArray(parsed?.ids)) return parsed.ids as string[];
    return basicHeuristic(query, actions);
  } catch (err) {
    console.warn('AI recommend failed, fallback', err);
    return basicHeuristic(query, actions);
  }
};
