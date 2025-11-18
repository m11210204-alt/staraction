
import React from 'react';
import { type ConstellationData } from '../types';
import StarfieldBackground from './StarfieldBackground';

interface InterestedActionsPageProps {
    allConstellations: ConstellationData[];
    interestedActionIds: string[];
    onViewAction: (action: ConstellationData) => void;
}

const InterestedActionsPage: React.FC<InterestedActionsPageProps> = ({
    allConstellations,
    interestedActionIds,
    onViewAction,
}) => {
    const interestedActions = allConstellations.filter(c =>
        interestedActionIds.includes(c.id)
    );

    return (
        <div className="relative min-h-screen w-full">
            <StarfieldBackground />
            <main className="relative z-10 container mx-auto px-6 py-24 text-white">
                <h1 className="text-4xl font-bold mb-10">我有興趣的行動</h1>

                <div className="space-y-4">
                    {interestedActions.length > 0 ? (
                        interestedActions.map(action => (
                            <div key={action.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between backdrop-blur-md transition-all hover:bg-white/10 animate-fadeIn">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="inline-block px-3 py-1 text-xs font-semibold text-[#e0b457] bg-[#D89C23]/20 border border-[#D89C23]/40 rounded-full">
                                            {action.category}
                                        </span>
                                        <h3 className="text-lg font-semibold">{action.name}</h3>
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        由 {action.initiator} 發起
                                    </p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button onClick={() => onViewAction(action)} className="text-sm text-gray-300 hover:text-white bg-white/10 px-4 py-1.5 rounded-md transition">查看</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white/5 border border-dashed border-white/20 rounded-2xl">
                            <p className="text-gray-300 text-lg">您尚未收藏任何行動。</p>
                            <p className="text-gray-400 mt-2">快去探索並收藏您感興趣的行動吧！</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default InterestedActionsPage;
