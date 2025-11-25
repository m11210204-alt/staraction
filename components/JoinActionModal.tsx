
import React, { useState } from 'react';
import { type ConstellationData, type User } from '../types';
import { CloseIcon } from './icons';

interface JoinActionModalProps {
    action: ConstellationData;
    user: User;
    onClose: () => void;
    onConfirm: (formData: JoinFormData) => void;
}

export interface JoinFormData {
    name: string;
    email: string;
    phone: string;
    motivation: string;
    selectedTags: string[];
    resourceDescription: string;
}

const JoinActionModal: React.FC<JoinActionModalProps> = ({ action, user, onClose, onConfirm }) => {
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [phone, setPhone] = useState('');
    const [motivation, setMotivation] = useState('');
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [resourceDescription, setResourceDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const hasTags = action.participationTags && action.participationTags.length > 0;

    const handleTagToggle = (index: number) => {
        setSelectedIndices(prev => 
            prev.includes(index) 
                ? prev.filter(i => i !== index) 
                : [...prev, index]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simulate a small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 800));

        // Convert indices back to descriptive strings for the record
        const selectedTags = selectedIndices.map(index => {
            const tag = action.participationTags[index];
            return tag.description ? `${tag.label} - ${tag.description}` : tag.label;
        });

        const formData: JoinFormData = {
            name,
            email,
            phone,
            motivation,
            selectedTags,
            resourceDescription
        };

        onConfirm(formData);
        setIsSubmitting(false);
    };

    const isFormValid = () => {
        if (isSubmitting) return false;
        
        // Validate Tags: Required if tags exist
        if (hasTags && selectedIndices.length === 0) return false;

        // Validate Description: Required
        if (!resourceDescription.trim()) return false;

        return true;
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn p-4">
            <div className="relative w-full max-w-2xl bg-[#1a1a1a] backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl shadow-black/50 text-white flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    <div>
                        <h2 className="text-2xl font-bold text-white">加入行動</h2>
                        <p className="text-sm text-[#D89C23] mt-1">專案：{action.name}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Form Content */}
                <div className="overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    <form id="join-form" onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* 1. Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-200 border-l-4 border-[#D89C23] pl-3">基本資料</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">姓名</label>
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-[#D89C23] focus:border-[#D89C23] outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">電子郵件</label>
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-gray-300 focus:ring-1 focus:ring-[#D89C23] outline-none cursor-not-allowed"
                                        readOnly
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-400 mb-1">聯絡電話 <span className="text-red-400">*</span></label>
                                    <input 
                                        type="tel" 
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="0912-345-678"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-[#D89C23] outline-none"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Motivation */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-200 border-l-4 border-[#D89C23] pl-3">參與動機</h3>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">為什麼想加入這個行動？</label>
                                <textarea 
                                    value={motivation}
                                    onChange={(e) => setMotivation(e.target.value)}
                                    rows={3}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-[#D89C23] outline-none"
                                    placeholder="請簡短分享您的想法..."
                                    required
                                />
                            </div>
                        </div>

                        {/* 3. Participation Ways */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-200 border-l-4 border-[#D89C23] pl-3">您希望如何參與？</h3>
                            <p className="text-xs text-gray-400 -mt-2">請勾選您可以提供的協助 (可複選) <span className="text-red-400">*</span></p>
                            
                            <div className="grid grid-cols-1 gap-3">
                                {hasTags ? (
                                    action.participationTags.map((tag, idx) => {
                                        const isSelected = selectedIndices.includes(idx);
                                        return (
                                            <label key={idx} className={`relative flex items-start p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-[#D89C23]/10 border-[#D89C23] shadow-[0_0_10px_rgba(216,156,35,0.1)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                                                <div className="flex items-center h-5">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 text-[#D89C23] border-gray-300 rounded focus:ring-[#D89C23] bg-transparent"
                                                        checked={isSelected}
                                                        onChange={() => handleTagToggle(idx)}
                                                    />
                                                </div>
                                                <div className="ml-3 text-sm">
                                                    <span className={`font-bold block ${isSelected ? 'text-[#D89C23]' : 'text-gray-200'}`}>
                                                        {tag.label}
                                                    </span>
                                                    {tag.description && (
                                                        <span className="text-gray-400 text-xs block mt-1">{tag.description}</span>
                                                    )}
                                                </div>
                                            </label>
                                        );
                                    })
                                ) : (
                                    <p className="text-gray-500 text-sm">此行動未設定具體標籤，請直接在下方說明您的資源。</p>
                                )}
                            </div>
                        </div>

                        {/* 4. Resource Description */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-200 border-l-4 border-[#D89C23] pl-3">可貢獻資源說明</h3>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">詳細說明 <span className="text-red-400">*</span></label>
                                <textarea 
                                    value={resourceDescription}
                                    onChange={(e) => setResourceDescription(e.target.value)}
                                    rows={3}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-[#D89C23] outline-none"
                                    placeholder="例如：我有兩箱閒置書籍、平日晚上有空可協助..."
                                    required
                                />
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-black/20 rounded-b-3xl">
                    <button 
                        type="submit" 
                        form="join-form"
                        disabled={!isFormValid()}
                        className="w-full bg-gradient-to-r from-[#D89C23] to-[#b8811f] hover:from-[#e6af3a] hover:to-[#c99026] text-black font-bold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-[#D89C23]/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                處理中...
                            </span>
                        ) : (
                            !isFormValid() ? '請填寫所有必填欄位' : '確認加入'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JoinActionModal;
