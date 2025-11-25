
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { type ConstellationData, ActionStatus, type User } from '../types';
import StarfieldBackground from './StarfieldBackground';
import { FunnelIcon, CloseIcon } from './icons';
import { aiApi } from '../lib/api';

interface ActionPageProps {
    allConstellations: ConstellationData[];
    filter: 'all' | 'mine';
    onInitiateAction: () => void;
    onViewAction: (action: ConstellationData) => void;
    onEditAction: (action: ConstellationData) => void;
    onDeleteAction: (actionId: string) => void;
    onArchiveAction: (actionId: string) => void;
    currentUser: User | null;
}

const ActionPage: React.FC<ActionPageProps> = ({ 
    allConstellations, 
    filter, 
    onInitiateAction,
    onViewAction,
    onEditAction,
    onDeleteAction,
    onArchiveAction,
    currentUser
}) => {
    
    const [searchTerm, setSearchTerm] = useState('');
    const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
    const [aiStatus, setAiStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
    const [aiError, setAiError] = useState<string | null>(null);
    const [aiInfo, setAiInfo] = useState<string>('');
    const [aiSearchIds, setAiSearchIds] = useState<string[]>([]);
    const [aiSearchStatus, setAiSearchStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedRegion, setSelectedRegion] = useState('all');
    const [selectedTag, setSelectedTag] = useState('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);

    const categories = useMemo(() => ['all', ...Array.from(new Set(allConstellations.map(c => c.category)))], [allConstellations]);
    const regions = useMemo(() => ['all', ...Array.from(new Set(allConstellations.map(c => c.region).filter((r): r is string => !!r)))], [allConstellations]);
    const tags = useMemo(() => {
        const allTags = allConstellations.flatMap(c => c.participationTags ? c.participationTags.map(t => t.label) : []);
        return ['all', ...Array.from(new Set(allTags))];
    }, [allConstellations]);

    const displayedActions = useMemo(() => {
        let actions = allConstellations;
        if (filter === 'mine') {
            actions = allConstellations.filter(c => {
                if (!currentUser) return false;
                return c.ownerId === currentUser.id || c.initiator === currentUser.name;
            });
        }

        actions = actions.filter(action => {
            const categoryMatch = selectedCategory === 'all' || action.category === selectedCategory;
            const regionMatch = selectedRegion === 'all' || action.region === selectedRegion;
            const tagMatch = selectedTag === 'all' || (action.participationTags && action.participationTags.some(t => t.label === selectedTag));
            return categoryMatch && regionMatch && tagMatch;
        });

        // AI 搜尋優先：如果有結果，直接用 AI 搜尋清單
        if (aiSearchIds.length > 0) {
            const order = new Map(aiSearchIds.map((id, idx) => [id, idx]));
            const subset = actions.filter(a => order.has(a.id));
            return subset.sort((a, b) => order.get(a.id)! - order.get(b.id)!);
        }

        // AI 推薦：基於歷史/熱門
        if (aiRecommendations.length > 0) {
            const order = new Map(aiRecommendations.map((id, idx) => [id, idx]));
            const subset = actions.filter(a => order.has(a.id));
            return subset.sort((a, b) => order.get(a.id)! - order.get(b.id)!);
        }

        let filtered = actions;
        if (searchTerm.trim()) {
            const lowercasedTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(action =>
                action.name.toLowerCase().includes(lowercasedTerm) ||
                action.summary.toLowerCase().includes(lowercasedTerm) ||
                action.category.toLowerCase().includes(lowercasedTerm)
            );
        }

        return filtered;

    }, [allConstellations, filter, selectedCategory, selectedRegion, selectedTag, searchTerm, currentUser, aiRecommendations, aiSearchIds]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        };

        if (isFilterOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isFilterOpen]);

    const pageTitle = filter === 'mine' ? '我的行動空間' : '行動列表';
    const isMyActionsPage = filter === 'mine';

    const getStatusChip = (status: ActionStatus) => {
        switch(status) {
            case ActionStatus.IN_PROGRESS:
            case ActionStatus.PENDING:
                return <span className="px-2 py-1 text-xs font-medium text-green-300 bg-green-900/50 rounded-full">進行中</span>;
            case ActionStatus.COMPLETED: 
                return <span className="px-2 py-1 text-xs font-medium text-gray-300 bg-gray-700/50 rounded-full">已結束</span>;
            default: 
                return <span className="px-2 py-1 text-xs font-medium text-gray-300 bg-gray-700/50 rounded-full">未知</span>;
        }
    }

    const isUserInitiator = (action: ConstellationData) => {
        if (!currentUser) return false;
        return action.ownerId === currentUser.id || action.initiator === currentUser.name;
    };
    
    const activeFiltersCount = [
        selectedCategory !== 'all',
        selectedRegion !== 'all',
        selectedTag !== 'all'
    ].filter(Boolean).length;

    const clearFilters = () => {
        setSelectedCategory('all');
        setSelectedRegion('all');
        setSelectedTag('all');
        setIsFilterOpen(false);
        setAiRecommendations([]);
        setAiSearchIds([]);
    };

    const clearSearch = () => {
        setSearchTerm('');
        setAiSearchIds([]);
        setAiSearchStatus('idle');
        setAiError(null);
        setAiInfo('');
    };

    const handleAIRecommend = async () => {
        setAiStatus('loading');
        setAiError(null);
        setAiInfo('');
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 6000);
        try {
            const ids = await aiApi.recommend({
                query: searchTerm.trim() || '推薦行動',
            }, undefined, controller.signal);
            setAiRecommendations(ids);
            if (ids.length > 0) {
                setAiStatus('done');
                setAiInfo(`AI 已篩出 ${ids.length} 筆相關行動`);
            } else {
                setAiStatus('error');
                setAiError('AI 暫時沒有找到匹配的行動');
            }
        } catch (err) {
            setAiStatus('error');
            const message = (err as Error).name === 'AbortError' ? 'AI 回應逾時，稍後再試' : (err as Error).message;
            setAiError(message || 'AI 推薦失敗');
        } finally {
            clearTimeout(timer);
        }
    };

    const runAISearch = async (value: string) => {
        if (!value.trim()) {
            setAiSearchIds([]);
            setAiSearchStatus('idle');
            return;
        }
        setAiSearchStatus('loading');
        try {
            const ids = await aiApi.search({ query: value.trim() });
            setAiSearchIds(ids);
            setAiSearchStatus('done');
        } catch (err) {
            setAiSearchStatus('error');
            console.warn('AI search failed', err);
        }
    };

    const FilterSection = ({ title, options, selected, onSelect }: { title: string, options: string[], selected: string, onSelect: (val: string) => void }) => (
        <div className="mb-6 last:mb-0">
            <h4 className="text-sm font-semibold text-gray-400 mb-3">{title}</h4>
            <div className="flex flex-wrap gap-2">
                {options.map(option => (
                    <button
                        key={option}
                        onClick={() => onSelect(option)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                            selected === option
                                ? "bg-[#D89C23] text-black border-[#D89C23]"
                                : "bg-white/5 text-gray-300 border-white/10 hover:border-white/30 hover:bg-white/10"
                        }`}
                    >
                        {option === 'all' ? '全部' : option}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="relative min-h-screen w-full">
            <StarfieldBackground />

            <main className="relative z-10 container mx-auto px-6 py-24 text-white">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-4xl font-bold">{pageTitle}</h1>
                     {isMyActionsPage && (
                        <button 
                            onClick={onInitiateAction}
                            className="bg-gradient-to-r from-[#D89C23] to-[#b8811f] hover:from-[#b8811f] hover:to-[#9e6f1a] text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 shadow-lg shadow-[#D89C23]/30"
                        >
                            + 發起新行動
                        </button>
                    )}
                </div>
                
                {!isMyActionsPage && (
                    <div className="mb-8 p-4 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 flex flex-col lg:flex-row lg:items-center gap-3 relative z-20">
                        <div className="relative w-full lg:flex-1">
                            <input
                                type="text"
                                placeholder="輸入關鍵字或需求"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:ring-[#D89C23] focus:border-[#D89C23] transition"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                </svg>
                            </div>
                            {searchTerm.trim() && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs px-2"
                                >
                                    清除
                                </button>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-3 w-full lg:w-auto">
                            <button
                                onClick={() => void runAISearch(searchTerm)}
                                disabled={aiSearchStatus === 'loading'}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border bg-white/5 text-gray-200 border-white/20 hover:border-white/40 hover:text-white hover:bg-white/10 transition disabled:opacity-60"
                            >
                                {aiSearchStatus === 'loading' ? 'AI 搜尋中...' : 'AI 搜尋'}
                            </button>
                            <button
                                onClick={handleAIRecommend}
                                disabled={aiStatus === 'loading'}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border bg-white/5 text-gray-200 border-white/20 hover:border-white/40 hover:text-white hover:bg-white/10 transition disabled:opacity-60"
                            >
                                {aiStatus === 'loading' ? 'AI 配對中...' : 'AI 推薦'}
                            </button>
                            {aiStatus === 'done' && aiInfo && <span className="text-xs text-green-300 whitespace-nowrap">{aiInfo}</span>}
                            {aiStatus === 'error' && aiError && <span className="text-xs text-red-300 whitespace-nowrap">{aiError}</span>}
                        </div>

                        <div className="relative" ref={filterRef}>
                            <button 
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 ${isFilterOpen || activeFiltersCount > 0 ? 'bg-[#D89C23]/20 border-[#D89C23] text-[#D89C23]' : 'bg-white/5 border-white/20 text-gray-300 hover:text-white hover:border-white/40'}`}
                            >
                                <FunnelIcon className="w-5 h-5" />
                                <span>篩選</span>
                                {activeFiltersCount > 0 && (
                                    <span className="ml-1 bg-[#D89C23] text-black text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </button>

                            {isFilterOpen && (
                                <div className="absolute right-0 top-full mt-2 w-80 md:w-96 p-6 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl animate-fadeIn z-50 origin-top-right backdrop-blur-3xl">
                                    <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                                        <h3 className="text-lg font-bold text-white">篩選條件</h3>
                                        <button onClick={() => setIsFilterOpen(false)} className="text-gray-400 hover:text-white">
                                            <CloseIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                    
                                    <div className="max-h-[60vh] overflow-y-auto pr-2 -mr-2 space-y-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                                        <FilterSection title="行動類別" options={categories} selected={selectedCategory} onSelect={setSelectedCategory} />
                                        <FilterSection title="地區" options={regions} selected={selectedRegion} onSelect={setSelectedRegion} />
                                        <FilterSection title="參與方式" options={tags} selected={selectedTag} onSelect={setSelectedTag} />
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
                                        <button 
                                            onClick={clearFilters}
                                            className="text-sm text-gray-400 hover:text-white px-4 py-2 transition-colors mr-2"
                                        >
                                            清除全部
                                        </button>
                                        <button 
                                            onClick={() => setIsFilterOpen(false)}
                                            className="bg-[#D89C23] hover:bg-[#b8811f] text-black text-sm font-bold px-6 py-2 rounded-lg transition-colors"
                                        >
                                            套用
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {displayedActions.length > 0 ? (
                        displayedActions.map(action => (
                            <div 
                                key={action.id} 
                                className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between backdrop-blur-md transition-all hover:bg-white/10 animate-fadeIn cursor-pointer"
                                onClick={() => onViewAction(action)}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        {getStatusChip(action.status)}
                                        <h3 className="text-lg font-semibold">{action.name}</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        <span className="text-xs font-medium text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">{action.category}</span>
                                        {action.region && <span className="text-xs font-medium text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">{action.region}</span>}
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        {action.participants.length} / {action.maxParticipants} 位參與者
                                    </p>
                                    {action.participationTags && action.participationTags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {action.participationTags.slice(0, 3).map((tag, i) => (
                                                <span key={i} className="text-[10px] text-[#D89C23] border border-[#D89C23]/30 px-1.5 py-0.5 rounded-full bg-[#D89C23]/10">
                                                    #{tag.label}
                                                </span>
                                            ))}
                                            {action.participationTags.length > 3 && (
                                                <span className="text-[10px] text-gray-500 px-1.5 py-0.5">+{action.participationTags.length - 3}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center space-x-3 ml-4">
                                    {isMyActionsPage && isUserInitiator(action) && (
                                        <>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onEditAction(action);} } 
                                                className="text-sm text-gray-300 hover:text-white bg-white/10 px-3 py-1.5 rounded-md transition whitespace-nowrap"
                                            >
                                                編輯
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onArchiveAction(action.id);} } 
                                                className="text-sm text-yellow-300 hover:text-yellow-100 bg-yellow-500/10 px-3 py-1.5 rounded-md transition whitespace-nowrap border border-yellow-500/40"
                                            >
                                                封存
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onDeleteAction(action.id);} } 
                                                className="text-sm text-red-300 hover:text-red-100 bg-red-500/10 px-3 py-1.5 rounded-md transition whitespace-nowrap border border-red-500/40"
                                            >
                                                刪除
                                            </button>
                                        </>
                                    )}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onViewAction(action);} } 
                                        className="text-sm text-gray-300 hover:text-white bg-white/10 px-4 py-1.5 rounded-md transition whitespace-nowrap"
                                    >
                                        查看
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 bg-white/5 border border-dashed border-white/20 rounded-2xl">
                            {searchTerm.trim() || activeFiltersCount > 0
                                ? <div className="flex flex-col items-center">
                                    <p className="text-gray-300 mb-4">找不到符合條件的行動。</p>
                                    <button onClick={clearFilters} className="text-[#D89C23] hover:underline text-sm">清除篩選條件</button>
                                  </div>
                                : isMyActionsPage
                                ? <>
                                    <p className="text-gray-300">您尚未發起任何行動。</p>
                                    <button 
                                        onClick={onInitiateAction}
                                        className="mt-4 text-lg font-semibold text-[#D89C23] hover:text-yellow-300 transition"
                                    >
                                        開始發起第一個行動！
                                    </button>
                                  </>
                                : <p className="text-gray-300">找不到行動。</p>
                            }
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ActionPage;
