import React, { useMemo, useState } from 'react';
import { type ConstellationData, ActionStatus } from '../types';
import StarfieldBackground from './StarfieldBackground';

interface ActionPageProps {
    allConstellations: ConstellationData[];
    filter: 'all' | 'mine';
    onInitiateAction: () => void;
    onViewAction: (action: ConstellationData) => void;
    onEditAction: (action: ConstellationData) => void;
}

const ActionPage: React.FC<ActionPageProps> = ({ 
    allConstellations, 
    filter, 
    onInitiateAction,
    onViewAction,
    onEditAction 
}) => {
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedRegion, setSelectedRegion] = useState('all');

    const categories = useMemo(() => ['all', ...Array.from(new Set(allConstellations.map(c => c.category)))], [allConstellations]);
    const regions = useMemo(() => ['all', ...Array.from(new Set(allConstellations.map(c => c.region).filter((r): r is string => !!r)))], [allConstellations]);

    const displayedActions = useMemo(() => {
        let actions = allConstellations;
        if (filter === 'mine') {
            actions = allConstellations.filter(c => ["當前使用者", "IxDA Taiwan", "好事道", "國泰人壽", "配客嘉"].includes(c.initiator));
        }

        actions = actions.filter(action => {
            const categoryMatch = selectedCategory === 'all' || action.category === selectedCategory;
            const regionMatch = selectedRegion === 'all' || action.region === selectedRegion;
            return categoryMatch && regionMatch;
        });

        if (!searchTerm.trim()) {
            return actions;
        }

        const lowercasedTerm = searchTerm.toLowerCase();
        return actions.filter(action =>
            action.name.toLowerCase().includes(lowercasedTerm) ||
            action.summary.toLowerCase().includes(lowercasedTerm) ||
            action.category.toLowerCase().includes(lowercasedTerm)
        );

    }, [allConstellations, filter, selectedCategory, selectedRegion, searchTerm]);
    
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

    // A placeholder for checking if the current user is the initiator
    const isUserInitiator = (action: ConstellationData) => {
        return ["當前使用者", "IxDA Taiwan", "好事道", "國泰人壽", "配客嘉"].includes(action.initiator);
    };
    
    const selectClassName = "w-full md:w-auto bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-sm text-white focus:ring-[#D89C23] focus:border-[#D89C23] transition";

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
                    <div className="mb-8 p-4 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative w-full md:flex-1">
                            <input
                                type="text"
                                placeholder="搜尋行動名稱、摘要..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:ring-[#D89C23] focus:border-[#D89C23] transition"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg xmlns="http://www.w.3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                             <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className={selectClassName}>
                                <option value="all">全部類別</option>
                                {categories.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                             <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} className={selectClassName}>
                                <option value="all">全部地區</option>
                                {regions.filter(r => r !== 'all').map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {displayedActions.length > 0 ? (
                        displayedActions.map(action => (
                            <div key={action.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between backdrop-blur-md transition-all hover:bg-white/10 animate-fadeIn">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        {getStatusChip(action.status)}
                                        <h3 className="text-lg font-semibold">{action.name}</h3>
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        {action.participants.length} / {action.maxParticipants} 位參與者
                                    </p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    {isMyActionsPage && isUserInitiator(action) && (
                                        <button onClick={() => onEditAction(action)} className="text-sm text-gray-300 hover:text-white bg-white/10 px-4 py-1.5 rounded-md transition">編輯</button>
                                    )}
                                    <button onClick={() => onViewAction(action)} className="text-sm text-gray-300 hover:text-white bg-white/10 px-4 py-1.5 rounded-md transition">查看</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 bg-white/5 border border-dashed border-white/20 rounded-2xl">
                            {searchTerm.trim()
                                ? <p className="text-gray-300">找不到符合「{searchTerm}」的行動。</p>
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
                                : <p className="text-gray-300">找不到符合條件的行動。</p>
                            }
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ActionPage;
