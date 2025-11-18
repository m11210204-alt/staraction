
import React, { useState, useRef } from 'react';
import { type ConstellationData, ActionStatus, type Comment } from '../types';
import { CloseIcon, InfoIcon, TargetIcon, UsersIcon, ChartBarIcon, HeartIcon, BookmarkIcon, PhotoIcon } from './icons';

interface ActionDetailCardProps {
    data: ConstellationData | null;
    onClose: () => void;
    onUpdateConstellation: (updatedData: ConstellationData) => void;
    interestedActionIds: string[];
    onToggleInterested: (actionId: string) => void;
    currentUserId: string;
}

const ActionDetailCard: React.FC<ActionDetailCardProps> = ({ data, onClose, onUpdateConstellation, interestedActionIds, onToggleInterested, currentUserId }) => {
    const [activeTab, setActiveTab] = useState("background");
    const [newComment, setNewComment] = useState("");
    const [imageToUpload, setImageToUpload] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [interactions, setInteractions] = useState({ supported: false, meaningful: false, interested: false });
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');

    if (!data) return null;

    const isUserParticipant = data.participants.some(p => p.id === currentUserId);
    const progress = (data.participants.length / data.maxParticipants) * 100;
    const isCompleted = data.status === ActionStatus.COMPLETED;
    const isInterested = interestedActionIds.includes(data.id);
    const isFull = data.participants.length >= data.maxParticipants;
    const isCurrentUserInitiator = ["當前使用者", "IxDA Taiwan", "好事道", "國泰人壽", "配客嘉"].includes(data.initiator);

    const handleJoinAction = () => {
        if (!data || isUserParticipant || isFull || isCompleted) return;

        const participantIndices = new Set(data.participants.map(p => p.pointIndex));
        let nextPointIndex = -1;
        
        for (let i = 0; i < data.shapePoints.length; i++) {
            if (!participantIndices.has(i)) {
                nextPointIndex = i;
                break;
            }
        }

        if (nextPointIndex === -1) {
             nextPointIndex = data.participants.length % data.shapePoints.length;
        }

        const newUserStar = {
            id: currentUserId,
            key: `${currentUserId}-${data.id}`,
            pointIndex: nextPointIndex,
        };
        
        const updatedData = {
            ...data,
            participants: [...data.participants, newUserStar],
        };

        onUpdateConstellation(updatedData);
    };

    const handleInteract = (type: "supported" | "meaningful" | "interested") => {
        setInteractions((prev) => ({ ...prev, [type]: !prev[type] }));
    };

    const handleAddComment = () => {
        if (newComment.trim() === "" && !imageToUpload) return;
        const newCommentObject: Comment = {
            id: `c${Date.now()}`,
            author: "當前使用者",
            avatar: `https://loremflickr.com/40/40/portrait?random=${Date.now()}`,
            text: newComment,
            imageUrl: imageToUpload || undefined,
        };
        const updatedData = { ...data, comments: [...data.comments, newCommentObject] };
        onUpdateConstellation(updatedData);
        setNewComment("");
        setImageToUpload(null);
    };
    
    const handleAddReply = (parentCommentId: string) => {
        if (replyText.trim() === "") return;

        const newReply: Comment = {
            id: `reply-${Date.now()}`,
            author: data.initiator,
            avatar: `https://loremflickr.com/40/40/logo?random=${Date.now()}`,
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

    const tabs = [
        { id: "background", label: "相關背景", icon: InfoIcon },
        { id: "goals", label: "行動目標", icon: TargetIcon },
        { id: "howToParticipate", label: "參與方式", icon: UsersIcon },
        { id: "updates", label: "近況更新", icon: ChartBarIcon },
    ];

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
                return <p className="text-gray-200 text-base leading-relaxed whitespace-pre-line">{data.howToParticipate}</p>;
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
            default:
                return null;
        }
    };

    return (
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
                                                    {isCurrentUserInitiator && !isCommentFromInitiator && (
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
                        {data.uploads.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-100 mb-3 border-b border-white/10 pb-2">成果展示</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {data.uploads.map((upload) => (<img key={upload.id} src={upload.url || "https://loremflickr.com/200/200/abstract"} alt={upload.caption} className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition border border-white/10" title={upload.caption} />))}
                                </div>
                            </div>
                        )}
                    </div>
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
                        onClick={handleJoinAction}
                        className="flex-1 bg-gradient-to-r from-[#D89C23] to-[#b8811f] hover:from-[#b8811f] hover:to-[#9e6f1a] text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#D89C23]/30" 
                        disabled={isCompleted || isUserParticipant || isFull}
                    >
                        {isCompleted ? "行動已完成" : isUserParticipant ? "您已加入" : isFull ? "人數已滿" : "加入行動"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActionDetailCard;