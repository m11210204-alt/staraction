
import React, { useState, useRef } from 'react';
import { type ConstellationData, ActionStatus, type Comment, type User, type Upload } from '../types';
import { CloseIcon, InfoIcon, TargetIcon, UsersIcon, ChartBarIcon, HeartIcon, BookmarkIcon, PhotoIcon, DocumentCheckIcon, TrashIcon, PencilIcon, PlusIcon, CheckIcon } from './icons';
import JoinActionModal, { type JoinFormData } from './JoinActionModal';

interface ActionDetailCardProps {
    data: ConstellationData | null;
    onClose: () => void;
    onUpdateConstellation: (updatedData: ConstellationData) => void;
    interestedActionIds: string[];
    onToggleInterested: (actionId: string) => void;
    onJoinAction: (actionId: string, formData: JoinFormData) => Promise<ConstellationData | null>;
    currentUser: User | null;
    onLoginRequest: () => void;
}

const ActionDetailCard: React.FC<ActionDetailCardProps> = ({ data, onClose, onUpdateConstellation, interestedActionIds, onToggleInterested, onJoinAction, currentUser, onLoginRequest }) => {
    const [activeTab, setActiveTab] = useState("background");
    const [newComment, setNewComment] = useState("");
    const [imageToUpload, setImageToUpload] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [interactions, setInteractions] = useState({ supported: false, meaningful: false, interested: false });
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    
    // Outcome Upload State
    const [showOutcomeUpload, setShowOutcomeUpload] = useState(false);
    const [outcomeImageDraft, setOutcomeImageDraft] = useState<string | null>(null);
    const [outcomeCaptionDraft, setOutcomeCaptionDraft] = useState("");
    const outcomeFileInputRef = useRef<HTMLInputElement>(null);
    
    // Outcome Edit State
    const [editingOutcomeId, setEditingOutcomeId] = useState<string | null>(null);
    const [editingOutcomeCaption, setEditingOutcomeCaption] = useState("");

    // Join Modal State
    const [showJoinModal, setShowJoinModal] = useState(false);

    if (!data) return null;

    const currentUserId = currentUser?.id;
    const isUserParticipant = currentUserId ? data.participants.some(p => p.id === currentUserId) : false;
    const progress = (data.participants.length / data.maxParticipants) * 100;
    const isCompleted = data.status === ActionStatus.COMPLETED;
    const isInterested = interestedActionIds.includes(data.id);
    const isFull = data.participants.length >= data.maxParticipants;
    const isCurrentUserInitiator = currentUser ? (data.ownerId === currentUser.id || data.initiator === currentUser.name) : false;
    const hasSROI = !!data.sroiReport;

    const handleJoinClick = () => {
        if (!currentUser) {
            onLoginRequest();
            return;
        }
        if (isUserParticipant || isFull || isCompleted) return;
        
        // Instead of joining directly, open the modal
        setShowJoinModal(true);
    };

    const handleConfirmJoin = async (formData: JoinFormData) => {
        if (!currentUser || !data) return;

        const updated = await onJoinAction(data.id, formData);
        if (updated) {
            onUpdateConstellation(updated);
            setShowJoinModal(false);
        }
    };

    const handleInteract = (type: "supported" | "meaningful" | "interested") => {
        setInteractions((prev) => ({ ...prev, [type]: !prev[type] }));
    };

    const handleAddComment = () => {
        if (!currentUser) {
            onLoginRequest();
            return;
        }

        if (newComment.trim() === "" && !imageToUpload) return;
        const newCommentObject: Comment = {
            id: `c${Date.now()}`,
            author: currentUser.name,
            avatar: currentUser.avatar,
            text: newComment,
            imageUrl: imageToUpload || undefined,
        };
        const updatedData = { ...data, comments: [...data.comments, newCommentObject] };
        onUpdateConstellation(updatedData);
        setNewComment("");
        setImageToUpload(null);
    };
    
    const handleAddReply = (parentCommentId: string) => {
        if (!currentUser) {
            onLoginRequest();
            return;
        }
        if (replyText.trim() === "") return;

        const newReply: Comment = {
            id: `reply-${Date.now()}`,
            author: currentUser.name,
            avatar: currentUser.avatar,
            text: replyText,
        };

        const updatedComments = data.comments.map(comment => {
            if (comment.id === parentCommentId) {
                return {
                    ...comment,
                    replies: [...(comment.replies || []), newReply],
                };
            }
            return comment;
        });

        const updatedData = { ...data, comments: updatedComments };
        onUpdateConstellation(updatedData);
        setReplyText("");
        setReplyingTo(null);
    };

    const handleImageUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageToUpload(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
        event.target.value = '';
    };

    // --- Outcome Upload Logic ---
    const handleOutcomeFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setOutcomeImageDraft(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
        event.target.value = '';
    };

    const handleAddOutcome = () => {
        if (!outcomeImageDraft) return;
        
        const newUpload: Upload = {
            id: `u-${Date.now()}`,
            url: outcomeImageDraft,
            caption: outcomeCaptionDraft || "成果照片"
        };
        
        const updatedData = {
            ...data,
            uploads: [newUpload, ...data.uploads]
        };
        
        onUpdateConstellation(updatedData);
        setOutcomeImageDraft(null);
        setOutcomeCaptionDraft("");
        setShowOutcomeUpload(false);
    };

    const handleDeleteOutcome = (uploadId: string) => {
        if (!confirm("確定要刪除這張照片嗎？")) return;
        const updatedData = {
            ...data,
            uploads: data.uploads.filter(u => u.id !== uploadId)
        };
        onUpdateConstellation(updatedData);
    };

    const handleStartEditOutcome = (upload: Upload) => {
        setEditingOutcomeId(upload.id);
        setEditingOutcomeCaption(upload.caption);
    };

    const handleSaveEditOutcome = () => {
        if (!editingOutcomeId) return;
        
        const updatedData = {
            ...data,
            uploads: data.uploads.map(u => 
                u.id === editingOutcomeId ? { ...u, caption: editingOutcomeCaption } : u
            )
        };
        onUpdateConstellation(updatedData);
        setEditingOutcomeId(null);
        setEditingOutcomeCaption("");
    };

    const tabs = [
        { id: "background", label: "相關背景", icon: InfoIcon },
        { id: "goals", label: "行動目標", icon: TargetIcon },
        { id: "howToParticipate", label: "參與方式", icon: UsersIcon },
        { id: "updates", label: "近況更新", icon: ChartBarIcon },
    ];

    if (hasSROI) {
        tabs.push({ id: "sroi", label: "成果報告 (SROI)", icon: DocumentCheckIcon });
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case "background":
                return <p className="text-gray-200 text-base leading-relaxed whitespace-pre-line">{data.background}</p>;
            case "goals":
                return (
                    <ul className="list-disc list-inside space-y-2 text-gray-200">
                        {data.goals.map((goal, index) => (
                            <li key={index}>{goal}</li>
                        ))}
                    </ul>
                );
            case "howToParticipate":
                return (
                    <div className="space-y-6">
                        {data.participationTags && data.participationTags.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {data.participationTags.map((tag, index) => (
                                    <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col justify-between">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[#D89C23] text-sm font-bold border border-[#D89C23]/30 px-2 py-0.5 rounded-full bg-[#D89C23]/10">
                                                #{tag.label}
                                            </span>
                                            {tag.target && (
                                                <span className="text-xs text-gray-400 bg-black/30 px-2 py-1 rounded-md">
                                                    需求: <span className="text-white font-semibold">{tag.target}</span>
                                                </span>
                                            )}
                                        </div>
                                        {tag.description && (
                                            <p className="text-gray-300 text-sm leading-snug">
                                                {tag.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <h4 className="text-[#D89C23] font-bold mb-2 text-sm">詳細說明</h4>
                            <p className="text-gray-200 text-base leading-relaxed whitespace-pre-line">{data.howToParticipate}</p>
                        </div>
                    </div>
                );
            case "updates":
                return (
                    <div className="space-y-4">
                        {data.updates.length > 0 ? (
                            data.updates.map((update, index) => (
                                <div key={index} className="relative pl-6 before:absolute before:left-1 before:top-2 before:w-2 before:h-2 before:bg-[#D89C23] before:rounded-full before:border-2 before:border-white/20">
                                    <p className="font-semibold text-[#e0b457] text-sm">{update.date}</p>
                                    <p className="text-gray-200">{update.text}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-300">目前沒有更新。</p>
                        )}
                    </div>
                );
            case "sroi":
                const sroi = data.sroiReport!;
                return (
                    <div className="space-y-8 animate-fadeIn">
                        {/* Dashboard Header */}
                        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between">
                            <div className="mb-4 md:mb-0">
                                <h3 className="text-lg font-bold text-gray-200 mb-1">社會投資報酬率 (SROI)</h3>
                                <p className="text-sm text-gray-400">計算基準日：{sroi.lastUpdated}</p>
                            </div>
                            <div className="flex items-center space-x-6">
                                <div className="text-center">
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">SROI Ratio</p>
                                    <p className="text-4xl font-serif font-bold text-[#D89C23]">1 : {sroi.sroiRatio}</p>
                                </div>
                                <div className="h-10 w-px bg-white/20 hidden md:block"></div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">總社會價值</p>
                                    <p className="text-2xl font-bold text-white">${sroi.totalImpactValue.toLocaleString()} {sroi.currencyUnit}</p>
                                </div>
                            </div>
                        </div>

                        {/* Impact Flow */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Inputs */}
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2 border-b border-white/10 pb-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                    <h4 className="font-bold text-blue-200">投入 Inputs</h4>
                                </div>
                                <div className="space-y-3">
                                    {sroi.inputs.map((item, i) => (
                                        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3">
                                            <div className="flex justify-between items-start">
                                                <span className="font-medium text-gray-200">{item.name}</span>
                                                <span className="text-[#e0b457] font-bold text-sm">{item.value}</span>
                                            </div>
                                            {item.description && <p className="text-xs text-gray-400 mt-1">{item.description}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Outputs */}
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2 border-b border-white/10 pb-2">
                                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                                    <h4 className="font-bold text-green-200">產出 Outputs</h4>
                                </div>
                                <div className="space-y-3">
                                    {sroi.outputs.map((item, i) => (
                                        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 relative">
                                            {/* Arrow for flow */}
                                            <div className="hidden lg:block absolute -left-4 top-1/2 -translate-y-1/2 text-white/20">➝</div>
                                            <div className="flex justify-between items-start">
                                                <span className="font-medium text-gray-200">{item.name}</span>
                                                <span className="text-[#e0b457] font-bold text-sm">{item.value}</span>
                                            </div>
                                            {item.description && <p className="text-xs text-gray-400 mt-1">{item.description}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Outcomes */}
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2 border-b border-white/10 pb-2">
                                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                                    <h4 className="font-bold text-purple-200">成果 Outcomes</h4>
                                </div>
                                <div className="space-y-3">
                                    {sroi.outcomes.map((item, i) => (
                                        <div key={i} className="bg-gradient-to-br from-purple-900/20 to-transparent border border-purple-500/30 rounded-xl p-3 relative">
                                            {/* Arrow for flow */}
                                            <div className="hidden lg:block absolute -left-4 top-1/2 -translate-y-1/2 text-white/20">➝</div>
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-medium text-purple-100">{item.name}</span>
                                                <span className="text-purple-300 font-bold text-sm">${item.monetizedValue.toLocaleString()}</span>
                                            </div>
                                            <p className="text-xs text-gray-400">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fadeIn">
                <div className="relative w-11/12 max-w-3xl h-[90vh] p-8 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl shadow-black/50 text-white flex flex-col">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors z-10">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                    <div className="flex-shrink-0">
                        <div className="inline-block px-3 py-1 mb-3 text-xs font-semibold text-[#e0b457] bg-[#D89C23]/20 border border-[#D89C23]/40 rounded-full backdrop-blur-sm">
                            {data.category}
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">{data.name}</h2>
                        <p className="text-sm text-gray-300 mb-2">由 <span className="font-semibold text-gray-200">{data.initiator}</span> 發起</p>
                        <p className="text-gray-200 text-lg leading-loose my-6">{data.summary}</p>
                        <div className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                            <div className="flex justify-between items-center mb-2 text-sm">
                                <span className="font-semibold text-gray-200">參與者</span>
                                <span className="font-bold text-white">{data.participants.length} / {data.maxParticipants}</span>
                            </div>
                            <div className="w-full bg-black/30 rounded-full h-2">
                                <div className="bg-gradient-to-r from-[#D89C23] to-[#b881f] h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-grow overflow-y-auto mt-6 pr-4 -mr-4" style={{ scrollbarWidth: "thin", scrollbarColor: "#D89C23 #1e293b" }}>
                        <div className="border-b border-white/10 mb-4">
                            <nav className="-mb-px flex space-x-6 overflow-x-auto">
                                {tabs.map((tab) => (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-2 whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm transition-colors ${activeTab === tab.id ? "border-[#D89C23] text-[#D89C23]" : "border-transparent text-gray-300 hover:text-white hover:border-gray-400"}`}>
                                        <tab.icon className="w-5 h-5" />
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                        <div className="min-h-[120px] mb-6">{renderTabContent()}</div>
                        
                        {/* Hide comments section when viewing SROI to keep layout clean, or keep it at bottom */}
                        {activeTab !== 'sroi' && (
                            <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-100 mb-3 border-b border-white/10 pb-2">留言</h3>
                                <div className="space-y-4 max-h-48 overflow-y-auto">
                                    {data.comments.map((comment) => {
                                        const isCommentFromInitiator = comment.author === data.initiator;
                                        return (
                                        <div key={comment.id}>
                                            <div className="flex items-start space-x-3">
                                                <img src={comment.avatar || `https://loremflickr.com/40/40/portrait?random=${comment.id}`} alt={comment.author} className="w-8 h-8 rounded-full" />
                                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-3 rounded-lg flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                            <p className="font-semibold text-sm text-[#e0b457]">{comment.author}</p>
                                                            {isCommentFromInitiator && (
                                                                <span className="px-2 py-0.5 text-xs font-medium text-blue-300 bg-blue-900/50 rounded-full">主辦方</span>
                                                            )}
                                                        </div>
                                                        {(isCurrentUserInitiator || comment.author === currentUser?.name) && !isCommentFromInitiator && (
                                                            <button
                                                                onClick={() => {
                                                                    setReplyingTo(replyingTo === comment.id ? null : comment.id);
                                                                    setReplyText('');
                                                                }}
                                                                className="text-xs text-gray-400 hover:text-white"
                                                            >
                                                                {replyingTo === comment.id ? '取消' : '回覆'}
                                                            </button>
                                                        )}
                                                    </div>
                                                    {comment.text && <p className="text-gray-200 text-sm mt-1">{comment.text}</p>}
                                                    {comment.imageUrl && <img src={comment.imageUrl} alt="comment attachment" className="mt-2 rounded-lg max-h-48 w-auto border border-white/10" />}
                                                </div>
                                            </div>

                                            {comment.replies && comment.replies.length > 0 && (
                                                <div className="ml-8 mt-3 space-y-3 pl-3 border-l-2 border-white/10">
                                                    {comment.replies.map(reply => (
                                                        <div key={reply.id} className="flex items-start space-x-3">
                                                            <img src={reply.avatar || `https://loremflickr.com/40/40/logo?random=${reply.id}`} alt={reply.author} className="w-8 h-8 rounded-full" />
                                                            <div className="bg-black/20 backdrop-blur-sm border border-white/10 p-3 rounded-lg flex-1">
                                                                <div className="flex items-center space-x-2">
                                                                    <p className="font-semibold text-sm text-blue-300">{reply.author}</p>
                                                                    <span className="px-2 py-0.5 text-xs font-medium text-blue-300 bg-blue-900/50 rounded-full">主辦方</span>
                                                                </div>
                                                                {reply.text && <p className="text-gray-200 text-sm mt-1">{reply.text}</p>}
                                                                {reply.imageUrl && <img src={reply.imageUrl} alt="reply attachment" className="mt-2 rounded-lg max-h-48 w-auto border border-white/10" />}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {replyingTo === comment.id && (
                                                <div className="ml-11 mt-3">
                                                    <div className="flex space-x-2">
                                                        <input
                                                            type="text"
                                                            value={replyText}
                                                            onChange={(e) => setReplyText(e.target.value)}
                                                            placeholder={`回覆 ${comment.author}...`}
                                                            className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-400 focus:ring-[#D89C23] focus:border-[#D89C23] transition"
                                                            autoFocus
                                                        />
                                                        <button onClick={() => handleAddReply(comment.id)} className="bg-[#D89C23] hover:bg-[#b8811f] text-white font-semibold px-4 py-2 rounded-lg text-sm transition">
                                                            送出
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        )
                                    })}
                                    {data.comments.length === 0 && <p className="text-gray-300 text-sm">還沒有人留言。</p>}
                                </div>
                                <div className="my-4 pt-4 border-t border-white/10 flex justify-around items-center">
                                    <button
                                        onClick={() => handleInteract("supported")}
                                        className={`flex flex-col items-center space-y-1 transition-colors ${interactions.supported ? "text-[#D89C23]" : "text-gray-300 hover:text-white"}`}
                                    >
                                        <HeartIcon className="w-6 h-6" isFilled={interactions.supported} />
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
                                
                                {/* Login prompt overlay or just disabled if strict */}
                                <div className={currentUser ? "" : "opacity-50 pointer-events-none filter blur-[1px] select-none"}>
                                    <div>
                                        {imageToUpload && (
                                            <div className="relative mb-2 w-fit">
                                                <img src={imageToUpload} alt="Preview" className="h-24 w-auto rounded-lg border border-white/20" />
                                                <button onClick={() => setImageToUpload(null)} className="absolute -top-2 -right-2 bg-black/70 rounded-full p-0.5 text-white">
                                                    <CloseIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                        <div className="flex space-x-2">
                                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                            <button onClick={handleImageUploadClick} className="flex-shrink-0 flex items-center justify-center w-10 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg text-gray-300 hover:text-white hover:border-[#D89C23] transition" aria-label="上傳圖片">
                                                <PhotoIcon className="w-5 h-5" />
                                            </button>
                                            <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="添加您的建議或問題..." className="flex-1 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-400 focus:ring-[#D89C23] focus:border-[#D89C23] transition" />
                                            <button onClick={handleAddComment} className="bg-[#D89C23] hover:bg-[#b8811f] text-white font-semibold px-6 py-2 rounded-lg text-sm transition">送出</button>
                                        </div>
                                    </div>
                                </div>
                                {!currentUser && (
                                    <div className="text-center mt-2">
                                        <button onClick={onLoginRequest} className="text-[#D89C23] hover:underline text-sm">
                                            登入後即可留言與互動
                                        </button>
                                    </div>
                                )}

                            </div>
                            
                            {(data.uploads.length > 0 || isCurrentUserInitiator) && (
                                <div>
                                    <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
                                        <h3 className="text-lg font-semibold text-gray-100">成果展示</h3>
                                        {isCurrentUserInitiator && (
                                            <button 
                                                onClick={() => setShowOutcomeUpload(!showOutcomeUpload)} 
                                                className="flex items-center space-x-1 text-xs bg-[#D89C23]/20 text-[#D89C23] hover:bg-[#D89C23]/30 px-3 py-1.5 rounded-full transition"
                                            >
                                                <PlusIcon className="w-4 h-4" />
                                                <span>新增照片</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Initiator Upload UI */}
                                    {showOutcomeUpload && isCurrentUserInitiator && (
                                        <div className="mb-4 bg-white/5 border border-white/10 rounded-xl p-4 animate-fadeIn">
                                            <div className="flex flex-col space-y-3">
                                                <div className="flex items-center space-x-3">
                                                     <div className="relative w-24 h-24 bg-black/40 rounded-lg flex items-center justify-center border border-white/10 overflow-hidden flex-shrink-0">
                                                        {outcomeImageDraft ? (
                                                            <img src={outcomeImageDraft} alt="Draft" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <PhotoIcon className="w-8 h-8 text-gray-500" />
                                                        )}
                                                        <input 
                                                            type="file" 
                                                            accept="image/*" 
                                                            ref={outcomeFileInputRef}
                                                            onChange={handleOutcomeFileSelect}
                                                            className="absolute inset-0 opacity-0 cursor-pointer" 
                                                        />
                                                     </div>
                                                     <div className="flex-1">
                                                         <input 
                                                            type="text" 
                                                            value={outcomeCaptionDraft}
                                                            onChange={(e) => setOutcomeCaptionDraft(e.target.value)}
                                                            placeholder="輸入照片說明..." 
                                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-[#D89C23] outline-none"
                                                         />
                                                         <p className="text-xs text-gray-400 mt-1">點擊左側圖示選擇照片</p>
                                                     </div>
                                                </div>
                                                <div className="flex justify-end space-x-2">
                                                    <button 
                                                        onClick={() => {
                                                            setShowOutcomeUpload(false);
                                                            setOutcomeImageDraft(null);
                                                            setOutcomeCaptionDraft("");
                                                        }}
                                                        className="px-3 py-1 text-xs text-gray-400 hover:text-white"
                                                    >
                                                        取消
                                                    </button>
                                                    <button 
                                                        onClick={handleAddOutcome}
                                                        disabled={!outcomeImageDraft}
                                                        className="px-4 py-1.5 text-xs bg-[#D89C23] text-black font-bold rounded-lg hover:bg-[#b8811f] disabled:opacity-50"
                                                    >
                                                        確認上傳
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Gallery Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {data.uploads.map((upload) => (
                                            <div key={upload.id} className="relative group">
                                                <img 
                                                    src={upload.url || "https://loremflickr.com/200/200/abstract"} 
                                                    alt={upload.caption} 
                                                    className="w-full h-32 object-cover rounded-lg border border-white/10 transition-transform hover:scale-[1.02]" 
                                                />
                                                
                                                {/* Caption Display / Edit Input */}
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2 rounded-b-lg">
                                                    {editingOutcomeId === upload.id ? (
                                                        <div className="flex items-center space-x-1">
                                                            <input 
                                                                type="text" 
                                                                value={editingOutcomeCaption}
                                                                onChange={(e) => setEditingOutcomeCaption(e.target.value)}
                                                                className="w-full bg-black/50 text-white text-xs px-1 py-0.5 rounded border border-white/20 focus:border-[#D89C23] outline-none"
                                                                autoFocus
                                                            />
                                                            <button onClick={handleSaveEditOutcome} className="text-green-400 hover:text-green-300">
                                                                <CheckIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-white truncate" title={upload.caption}>{upload.caption}</p>
                                                    )}
                                                </div>

                                                {/* Owner Actions */}
                                                {isCurrentUserInitiator && editingOutcomeId !== upload.id && (
                                                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={() => handleStartEditOutcome(upload)}
                                                            className="p-1.5 bg-black/70 text-white rounded-full hover:bg-[#D89C23] hover:text-black transition"
                                                            title="編輯說明"
                                                        >
                                                            <PencilIcon className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteOutcome(upload.id)}
                                                            className="p-1.5 bg-black/70 text-white rounded-full hover:bg-red-500 transition"
                                                            title="刪除照片"
                                                        >
                                                            <TrashIcon className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {data.uploads.length === 0 && !showOutcomeUpload && (
                                            <div className="col-span-full py-6 text-center text-gray-400 bg-white/5 rounded-lg border border-dashed border-white/10">
                                                尚無成果照片
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        )}
                    </div>

                    <div className="mt-6 flex-shrink-0 flex space-x-4">
                        <button
                            onClick={() => onToggleInterested(data.id)}
                            className={`w-16 flex-shrink-0 flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/15 transition-all duration-300 ${isInterested ? 'text-[#D89C23]' : 'text-gray-300'}`}
                            aria-label={isInterested ? '取消收藏' : '加入收藏'}
                        >
                            <BookmarkIcon className="w-6 h-6" isFilled={isInterested} />
                        </button>
                        <button 
                            onClick={handleJoinClick}
                            className="flex-1 bg-gradient-to-r from-[#D89C23] to-[#b8811f] hover:from-[#b8811f] hover:to-[#9e6f1a] text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#D89C23]/30" 
                            disabled={isCompleted || isUserParticipant || isFull}
                        >
                            {isCompleted ? "行動已完成" : isUserParticipant ? "您已加入" : isFull ? "人數已滿" : currentUser ? "加入行動" : "登入以加入行動"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Join Modal Overlay */}
            {showJoinModal && currentUser && (
                <JoinActionModal 
                    action={data}
                    user={currentUser}
                    onClose={() => setShowJoinModal(false)}
                    onConfirm={handleConfirmJoin}
                />
            )}
        </>
    );
};

export default ActionDetailCard;
