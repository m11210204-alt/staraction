import React, { useState } from 'react';
import { type ConstellationData } from '../types';
import { CloseIcon, HeartIcon } from './icons';

interface ActionSummaryCardProps {
    data: ConstellationData | null;
    onClose: () => void;
    onViewDetail: () => void;
}

const ActionSummaryCard: React.FC<ActionSummaryCardProps> = ({ data, onClose, onViewDetail }) => {
    const [interactions, setInteractions] = useState({ supported: false, meaningful: false, interested: false });

    if (!data) return null;

    const handleInteract = (type: "supported" | "meaningful" | "interested") => {
        setInteractions((prev) => ({ ...prev, [type]: !prev[type] }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fadeIn">
            <div className="relative w-11/12 max-w-md p-8 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl shadow-black/50 text-white">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                    <CloseIcon className="w-6 h-6" />
                </button>
                <div className="inline-block px-3 py-1 mb-3 text-xs font-semibold text-[#e0b457] bg-[#D89C23]/20 border border-[#D89C23]/40 rounded-full backdrop-blur-sm">
                    {data.category}
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">{data.name}</h2>
                <p className="text-gray-200 text-sm leading-relaxed mb-6">{data.summary}</p>

                <div className="flex justify-around items-center mb-6 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                    <button
                        onClick={() => handleInteract("supported")}
                        className={`flex flex-col items-center space-y-1 transition-colors ${interactions.supported ? "text-[#D89C23]" : "text-gray-300 hover:text-white"}`}
                    >
                        <HeartIcon className="w-7 h-7" isFilled={interactions.supported} />
                        <span className="text-xs font-semibold">支持</span>
                    </button>
                    <button
                        onClick={() => handleInteract("meaningful")}
                        className={`px-4 py-2 rounded-full text-xs font-semibold border backdrop-blur-sm transition-all duration-300 ${interactions.meaningful ? "bg-[#D89C23]/30 border-[#D89C23] text-yellow-200 shadow-[0_0_10px_rgba(216,156,35,0.4)]" : "bg-white/10 border-white/20 text-gray-200 hover:bg-white/15"}`}
                    >
                        💡 好有意義
                    </button>
                    <button
                        onClick={() => handleInteract("interested")}
                        className={`px-4 py-2 rounded-full text-xs font-semibold border backdrop-blur-sm transition-all duration-300 ${interactions.interested ? "bg-[#D89C23]/30 border-[#D89C23] text-yellow-200 shadow-[0_0_10px_rgba(216,156,35,0.4)]" : "bg-white/10 border-white/20 text-gray-200 hover:bg-white/15"}`}
                    >
                        🙌 想加入
                    </button>
                </div>

                <button
                    onClick={onViewDetail}
                    className="w-full bg-gradient-to-r from-[#D89C23] to-[#b8811f] hover:from-[#b8811f] hover:to-[#9e6f1a] text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-[#D89C23]/30"
                >
                    查看詳情
                </button>
            </div>
        </div>
    );
};

export default ActionSummaryCard;