import React from 'react';
import { type ConstellationData } from '../types';
import StarfieldBackground from './StarfieldBackground';
import { ChartBarIcon } from './icons';

interface ParticipatedActionsPageProps {
    allConstellations: ConstellationData[];
    onViewAction: (action: ConstellationData) => void;
    currentUserId: string;
}

const ParticipatedActionsPage: React.FC<ParticipatedActionsPageProps> = ({
    allConstellations,
    onViewAction,
    currentUserId,
}) => {
    const participatedActions = allConstellations.filter(c =>
        c.participants.some(p => p.id === currentUserId)
    );

    return (
        <div className="relative min-h-screen w-full">
            <StarfieldBackground />
            <main className="relative z-10 container mx-auto px-6 py-24 text-white">
                <h1 className="text-4xl font-bold mb-10">我參與的行動</h1>

                <div className="space-y-6">
                    {participatedActions.length > 0 ? (
                        participatedActions.map(action => {
                            const latestUpdate = action.updates.length > 0 ? action.updates[0] : null;
                            return (
                                <div key={action.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md transition-all hover:bg-white/10">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="inline-block px-3 py-1 mb-2 text-xs font-semibold text-[#e0b457] bg-[#D89C23]/20 border border-[#D89C23]/40 rounded-full">
                                                {action.category}
                                            </span>
                                            <h3 className="text-xl font-semibold mb-3">{action.name}</h3>
                                        </div>
                                        <button onClick={() => onViewAction(action)} className="text-sm text-gray-300 hover:text-white bg-white/10 px-4 py-1.5 rounded-md transition whitespace-nowrap">查看詳情</button>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <div className="flex items-center text-sm text-gray-300">
                                            <ChartBarIcon className="w-5 h-5 mr-2 text-[#D89C23]"/>
                                            <h4 className="font-semibold text-gray-200">最新近況</h4>
                                        </div>
                                        {latestUpdate ? (
                                            <div className="relative pl-6 mt-2">
                                                 <div className="absolute left-1 top-1.5 w-2 h-2 bg-[#D89C23] rounded-full border-2 border-white/20 animate-slow-pulse"></div>
                                                <p className="font-semibold text-[#e0b457] text-sm">{latestUpdate.date}</p>
                                                <p className="text-gray-200 mt-1">{latestUpdate.text}</p>
                                            </div>
                                        ) : (
                                            <p className="text-gray-400 mt-2 pl-6">目前尚無更新。</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-20 bg-white/5 border border-dashed border-white/20 rounded-2xl">
                            <p className="text-gray-300 text-lg">您尚未參與任何行動。</p>
                            <p className="text-gray-400 mt-2">探索並加入一個行動，成為改變的一份子！</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ParticipatedActionsPage;