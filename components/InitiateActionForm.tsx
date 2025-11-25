
import React, { useState, useEffect } from 'react';
import { type ConstellationData, ActionStatus, Update, type ParticipationTag, type SROIReport, type SROIItem, type SROIOutcome } from '../types';
import { CloseIcon, DocumentCheckIcon, InfoIcon, TargetIcon } from './icons';

interface InitiateActionFormProps {
    onClose: () => void;
    onCreateAction: (newAction: ConstellationData) => void;
    onUpdateAction: (updatedAction: ConstellationData) => void;
    actionToEdit?: ConstellationData | null;
}

const InputField = ({ label, children, required = true }: {label: string, children?: React.ReactNode, required?: boolean}) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
            {label} {required && <span className="text-red-400">*</span>}
        </label>
        {children}
    </div>
);

const TextInput: React.FC<React.ComponentProps<'input'>> = (props) => (
     <input 
        type="text"
        {...props}
        className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-400 focus:ring-[#D89C23] focus:border-[#D89C23] transition"
    />
);

const TextArea: React.FC<React.ComponentProps<'textarea'>> = (props) => (
     <textarea
        rows={3}
        {...props}
        className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-400 focus:ring-[#D89C23] focus:border-[#D89C23] transition"
    />
);


const InitiateActionForm: React.FC<InitiateActionFormProps> = ({ onClose, onCreateAction, onUpdateAction, actionToEdit }) => {
    // Form Tabs
    const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'sroi'>('basic');

    // Basic & Details State
    const [name, setName] = useState('');
    const [category, setCategory] = useState('社會福利');
    const [summary, setSummary] = useState('');
    const [background, setBackground] = useState('');
    const [goals, setGoals] = useState<string[]>(['']);
    const [howToParticipate, setHowToParticipate] = useState('');
    const [participationTags, setParticipationTags] = useState<ParticipationTag[]>([]);
    
    // Tag Temp State
    const [tempTagLabel, setTempTagLabel] = useState('');
    const [tempTagTarget, setTempTagTarget] = useState('');
    const [tempTagDesc, setTempTagDesc] = useState('');

    const [maxParticipants, setMaxParticipants] = useState(30);
    const [updates, setUpdates] = useState<Update[]>([{ date: '', text: '' }]);
    
    // SROI State
    const [enableSROI, setEnableSROI] = useState(false);
    const [sroiData, setSroiData] = useState<SROIReport>({
        lastUpdated: new Date().toISOString().split('T')[0],
        currencyUnit: 'TWD',
        sroiRatio: 0,
        totalImpactValue: 0,
        inputs: [],
        outputs: [],
        outcomes: []
    });

    const isEditMode = !!actionToEdit;

    const availableTags = [
        "經費支持",
        "物資捐贈",
        "提供人力與技能資源",
        "線上社群參與",
        "組織層級合作",
    ];

    useEffect(() => {
        if (isEditMode) {
            setName(actionToEdit.name);
            setCategory(actionToEdit.category);
            setSummary(actionToEdit.summary);
            setBackground(actionToEdit.background);
            setGoals(actionToEdit.goals.length > 0 ? actionToEdit.goals : ['']);
            setHowToParticipate(actionToEdit.howToParticipate);
            setParticipationTags(actionToEdit.participationTags || []);
            setMaxParticipants(actionToEdit.maxParticipants);
            setUpdates(actionToEdit.updates.length > 0 ? actionToEdit.updates : [{ date: '', text: '' }]);
            
            if (actionToEdit.sroiReport) {
                setEnableSROI(true);
                setSroiData(actionToEdit.sroiReport);
            }
        }
    }, [actionToEdit, isEditMode]);

    // Auto-calculate SROI
    useEffect(() => {
        if (!enableSROI) return;

        const totalInputsCost = sroiData.inputs.reduce((sum, item) => sum + (item.amount || 0), 0);
        const totalOutcomesValue = sroiData.outcomes.reduce((sum, item) => sum + (item.monetizedValue || 0), 0);
        
        let ratio = 0;
        if (totalInputsCost > 0) {
            ratio = Number((totalOutcomesValue / totalInputsCost).toFixed(2));
        }

        setSroiData(prev => {
            if (prev.totalImpactValue === totalOutcomesValue && prev.sroiRatio === ratio) return prev;
            return {
                ...prev,
                totalImpactValue: totalOutcomesValue,
                sroiRatio: ratio
            };
        });
    }, [sroiData.inputs, sroiData.outcomes, enableSROI]);

    // --- Logic Helpers ---

    const handleGoalChange = (index: number, value: string) => {
        const newGoals = [...goals];
        newGoals[index] = value;
        setGoals(newGoals);
    };

    const addGoal = () => setGoals([...goals, '']);
    const removeGoal = (index: number) => {
        if (goals.length > 1) setGoals(goals.filter((_, i) => i !== index));
    };
    
    const removeTag = (labelToRemove: string) => setParticipationTags(participationTags.filter(t => t.label !== labelToRemove));

    const handleAddCustomTag = () => {
        const label = tempTagLabel.trim();
        if (!label) return;
        if (participationTags.some(t => t.label === label)) return;

        const newTag: ParticipationTag = {
            label,
            target: tempTagTarget ? parseInt(tempTagTarget) : undefined,
            description: tempTagDesc.trim() || undefined
        };

        setParticipationTags([...participationTags, newTag]);
        setTempTagLabel('');
        setTempTagTarget('');
        setTempTagDesc('');
    };

    const handleSuggestionClick = (tagLabel: string) => setTempTagLabel(tagLabel);
    
    const handleUpdateChange = (index: number, field: keyof Update, value: string) => {
        const newUpdates = [...updates];
        newUpdates[index] = { ...newUpdates[index], [field]: value };
        setUpdates(newUpdates);
    };

    const addUpdate = () => setUpdates([...updates, { date: '', text: '' }]);
    const removeUpdate = (index: number) => {
        if (updates.length > 1) setUpdates(updates.filter((_, i) => i !== index));
        else setUpdates([{ date: '', text: '' }]);
    };

    // --- SROI Logic Helpers ---

    const addSroiItem = (type: 'inputs' | 'outputs' | 'outcomes') => {
        const newItem: any = { name: '', value: '', description: '' };
        if (type === 'inputs') newItem.amount = 0;
        if (type === 'outcomes') newItem.monetizedValue = 0;
        
        setSroiData(prev => ({
            ...prev,
            [type]: [...prev[type], newItem]
        }));
    };

    const updateSroiItem = (type: 'inputs' | 'outputs' | 'outcomes', index: number, field: string, value: any) => {
        setSroiData(prev => {
            const list = [...prev[type]];
            list[index] = { ...list[index], [field]: value };
            return { ...prev, [type]: list };
        });
    };

    const removeSroiItem = (type: 'inputs' | 'outputs' | 'outcomes', index: number) => {
        setSroiData(prev => ({
            ...prev,
            [type]: prev[type].filter((_, i) => i !== index)
        }));
    };

    // --- Submit ---

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const finalUpdates = updates.filter(u => u.date.trim() !== '' && u.text.trim() !== '');

        const baseActionData = {
            name,
            category,
            summary,
            background,
            goals: goals.filter(g => g.trim() !== ''),
            howToParticipate,
            participationTags,
            maxParticipants: Number(maxParticipants),
            updates: finalUpdates,
            sroiReport: enableSROI ? sroiData : undefined,
        };

        if (isEditMode) {
            const updatedAction: ConstellationData = {
                ...actionToEdit,
                ...baseActionData,
            };
            onUpdateAction(updatedAction);
        } else {
            const newAction: ConstellationData = {
                id: `const-${Date.now()}`,
                ...baseActionData,
                initiator: "當前使用者", 
                status: ActionStatus.PENDING,
                participants: [],
                comments: [],
                uploads: [],
                resources: [],
                shapePoints: [ 
                    { x: 50, y: 10 }, { x: 65, y: 35 }, { x: 95, y: 40 }, { x: 75, y: 60 },
                    { x: 80, y: 90 }, { x: 50, y: 75 }, { x: 20, y: 90 }, { x: 25, y: 60 },
                    { x: 5, y: 40 }, { x: 35, y: 35 }, { x: 50, y: 10 }
                ],
            };
            onCreateAction(newAction);
        }
        
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fadeIn">
            <div className="relative w-11/12 max-w-4xl h-[90vh] p-0 bg-[#1a1a1a] backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl shadow-black/50 text-white flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h2 className="text-2xl font-bold">{isEditMode ? '編輯行動' : '發起新行動'}</h2>
                    <button onClick={onClose} className="text-gray-300 hover:text-white transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10">
                    <button
                        onClick={() => setActiveTab('basic')}
                        className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'basic' ? 'bg-[#D89C23]/10 text-[#D89C23] border-b-2 border-[#D89C23]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <span className="flex items-center justify-center space-x-2">
                            <InfoIcon className="w-4 h-4" />
                            <span>基本資訊</span>
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'details' ? 'bg-[#D89C23]/10 text-[#D89C23] border-b-2 border-[#D89C23]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                         <span className="flex items-center justify-center space-x-2">
                            <TargetIcon className="w-4 h-4" />
                            <span>詳細內容與更新</span>
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('sroi')}
                        className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'sroi' ? 'bg-[#D89C23]/10 text-[#D89C23] border-b-2 border-[#D89C23]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <span className="flex items-center justify-center space-x-2">
                            <DocumentCheckIcon className="w-4 h-4" />
                            <span>成果報告 (SROI)</span>
                        </span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                    <div className="flex-grow overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                        
                        {/* BASIC INFO TAB */}
                        {activeTab === 'basic' && (
                            <div className="space-y-6 max-w-2xl mx-auto">
                                <InputField label="行動名稱">
                                    <TextInput value={name} onChange={(e) => setName(e.target.value)} required />
                                </InputField>

                                <InputField label="類別">
                                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-sm text-white focus:ring-[#D89C23] focus:border-[#D89C23] transition">
                                        <option>社會福利</option>
                                        <option>動物保護</option>
                                        <option>教育支持</option>
                                        <option>環境永續</option>
                                        <option>其他</option>
                                    </select>
                                </InputField>

                                <InputField label="行動摘要">
                                    <TextArea value={summary} onChange={(e) => setSummary(e.target.value)} required />
                                </InputField>

                                <InputField label="相關背景">
                                    <TextArea value={background} onChange={(e) => setBackground(e.target.value)} rows={6} required />
                                </InputField>

                                <InputField label="預計招募總人數">
                                    <input type="number" value={maxParticipants} onChange={(e) => setMaxParticipants(parseInt(e.target.value, 10))} min="1" className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-400 focus:ring-[#D89C23] focus:border-[#D89C23] transition" required />
                                </InputField>
                            </div>
                        )}

                        {/* DETAILS TAB */}
                        {activeTab === 'details' && (
                            <div className="space-y-6 max-w-2xl mx-auto">
                                <InputField label="行動目標">
                                    <>
                                    {goals.map((goal, index) => (
                                        <div key={index} className="flex items-center space-x-2 mb-2">
                                            <TextInput
                                                value={goal}
                                                onChange={(e) => handleGoalChange(index, e.target.value)}
                                                placeholder={`目標 ${index + 1}`}
                                            />
                                            <button type="button" onClick={() => removeGoal(index)} className="text-red-400 hover:text-red-300 p-1 rounded-full bg-white/5 disabled:opacity-50" disabled={goals.length <= 1}>
                                                -
                                            </button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={addGoal} className="text-sm text-[#D89C23] hover:text-yellow-300">+ 新增目標</button>
                                    </>
                                </InputField>

                                <InputField label="參與方式詳細說明">
                                    <TextArea value={howToParticipate} onChange={(e) => setHowToParticipate(e.target.value)} rows={4} required />
                                </InputField>
                                
                                <InputField label="參與方式標籤 (包含需求人數與說明)" required={false}>
                                    <div className="space-y-3">
                                        <div className="p-3 bg-white/5 rounded-lg border border-white/10 space-y-2">
                                            <div className="grid grid-cols-[2fr_1fr] gap-2">
                                                <input 
                                                    type="text"
                                                    value={tempTagLabel}
                                                    onChange={(e) => setTempTagLabel(e.target.value)}
                                                    placeholder="標籤名稱"
                                                    className="bg-black/20 border border-white/10 rounded-md px-3 py-1.5 text-sm text-white focus:ring-[#D89C23] focus:border-[#D89C23]"
                                                />
                                                <input 
                                                    type="number"
                                                    value={tempTagTarget}
                                                    onChange={(e) => setTempTagTarget(e.target.value)}
                                                    placeholder="需求數量"
                                                    min="0"
                                                    className="bg-black/20 border border-white/10 rounded-md px-3 py-1.5 text-sm text-white focus:ring-[#D89C23] focus:border-[#D89C23]"
                                                />
                                            </div>
                                            <input 
                                                type="text"
                                                value={tempTagDesc}
                                                onChange={(e) => setTempTagDesc(e.target.value)}
                                                placeholder="一句話說明"
                                                className="w-full bg-black/20 border border-white/10 rounded-md px-3 py-1.5 text-sm text-white focus:ring-[#D89C23] focus:border-[#D89C23]"
                                            />
                                            <button 
                                                type="button" 
                                                onClick={handleAddCustomTag}
                                                disabled={!tempTagLabel.trim()}
                                                className="w-full bg-white/10 hover:bg-white/20 text-white py-1.5 rounded-md text-sm transition disabled:opacity-50"
                                            >
                                                新增標籤
                                            </button>
                                        </div>

                                        {participationTags.length > 0 && (
                                            <div className="space-y-2">
                                                {participationTags.map((tag, idx) => (
                                                    <div key={idx} className="flex items-center justify-between bg-[#D89C23]/10 border border-[#D89C23]/30 rounded-lg px-3 py-2">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="font-bold text-[#D89C23] text-sm">#{tag.label}</span>
                                                                {tag.target && <span className="text-xs text-gray-400 bg-black/20 px-1.5 rounded">Qty: {tag.target}</span>}
                                                            </div>
                                                            {tag.description && <p className="text-xs text-gray-300 truncate mt-0.5">{tag.description}</p>}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTag(tag.label)}
                                                            className="ml-2 text-gray-400 hover:text-white"
                                                        >
                                                            <CloseIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        
                                         <div className="flex flex-wrap gap-2 pt-2">
                                            {availableTags.map(tag => (
                                                <button key={tag} type="button" onClick={() => handleSuggestionClick(tag)} className="px-3 py-1 rounded-full text-xs font-medium border bg-white/5 text-gray-300 border-white/10 hover:border-white/40 hover:text-white hover:bg-white/10 transition-all">
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </InputField>

                                <InputField label="近況更新" required={false}>
                                     <>
                                        {updates.map((update, index) => (
                                            <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-2 mb-2 items-center">
                                                <input
                                                    type="date"
                                                    value={update.date}
                                                    onChange={(e) => handleUpdateChange(index, 'date', e.target.value)}
                                                    className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-400 focus:ring-[#D89C23] focus:border-[#D89C23] transition"
                                                />
                                                <TextInput
                                                    value={update.text}
                                                    onChange={(e) => handleUpdateChange(index, 'text', e.target.value)}
                                                    placeholder={`更新說明 ${index + 1}`}
                                                />
                                                <button type="button" onClick={() => removeUpdate(index)} className="text-red-400 hover:text-red-300 p-1 rounded-full bg-white/5 disabled:opacity-50">
                                                    -
                                                </button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={addUpdate} className="text-sm text-[#D89C23] hover:text-yellow-300">+ 新增更新</button>
                                     </>
                                </InputField>
                            </div>
                        )}

                        {/* SROI TAB */}
                        {activeTab === 'sroi' && (
                            <div className="space-y-8">
                                <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
                                    <div>
                                        <h3 className="font-bold text-lg">啟用 SROI 成果報告</h3>
                                        <p className="text-sm text-gray-400">開啟後將在行動詳情頁面顯示社會投資報酬率分析</p>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setEnableSROI(!enableSROI)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enableSROI ? 'bg-[#D89C23]' : 'bg-gray-600'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enableSROI ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>

                                {enableSROI && (
                                    <div className="space-y-8 animate-fadeIn">
                                        {/* Dashboard Preview */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-black/20 p-4 rounded-xl border border-white/10">
                                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">計算總投入 (Total Inputs)</p>
                                                <p className="text-2xl font-bold text-white">
                                                    ${sroiData.inputs.reduce((sum, i) => sum + (i.amount || 0), 0).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="bg-black/20 p-4 rounded-xl border border-white/10">
                                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">計算總成果價值 (Total Impact)</p>
                                                <p className="text-2xl font-bold text-white">
                                                    ${sroiData.totalImpactValue.toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="md:col-span-2 bg-gradient-to-r from-[#D89C23]/20 to-transparent p-4 rounded-xl border border-[#D89C23]/30 flex justify-between items-center">
                                                <span className="text-sm font-semibold text-[#D89C23] uppercase">SROI Ratio (自動計算)</span>
                                                <span className="text-3xl font-serif font-bold text-white">1 : {sroiData.sroiRatio}</span>
                                            </div>
                                        </div>

                                        {/* Inputs Section */}
                                        <div className="border border-white/10 rounded-xl p-4 bg-white/5">
                                            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                                                <h4 className="text-[#60a5fa] font-bold">1. 投入 Inputs (成本)</h4>
                                                <button type="button" onClick={() => addSroiItem('inputs')} className="text-xs bg-[#60a5fa]/20 text-[#60a5fa] px-2 py-1 rounded hover:bg-[#60a5fa]/30">+ 新增投入</button>
                                            </div>
                                            <div className="space-y-3">
                                                {sroiData.inputs.map((item, idx) => (
                                                    <div key={idx} className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_2fr_auto] gap-2 items-start bg-black/20 p-3 rounded-lg">
                                                        <input type="text" value={item.name} onChange={(e) => updateSroiItem('inputs', idx, 'name', e.target.value)} placeholder="項目名稱 (如: 人力)" className="bg-transparent border-b border-white/20 px-1 py-1 text-sm focus:border-[#D89C23] outline-none" />
                                                        <input type="text" value={item.value} onChange={(e) => updateSroiItem('inputs', idx, 'value', e.target.value)} placeholder="顯示文字 (如: 50小時)" className="bg-transparent border-b border-white/20 px-1 py-1 text-sm focus:border-[#D89C23] outline-none" />
                                                        <input type="number" value={item.amount || ''} onChange={(e) => updateSroiItem('inputs', idx, 'amount', Number(e.target.value))} placeholder="計算金額 ($)" className="bg-transparent border-b border-white/20 px-1 py-1 text-sm focus:border-[#D89C23] outline-none text-[#60a5fa]" />
                                                        <input type="text" value={item.description || ''} onChange={(e) => updateSroiItem('inputs', idx, 'description', e.target.value)} placeholder="說明備註" className="bg-transparent border-b border-white/20 px-1 py-1 text-sm focus:border-[#D89C23] outline-none text-gray-400" />
                                                        <button type="button" onClick={() => removeSroiItem('inputs', idx)} className="text-red-400 hover:text-red-300">
                                                             <CloseIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Outputs Section */}
                                        <div className="border border-white/10 rounded-xl p-4 bg-white/5">
                                            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                                                <h4 className="text-[#4ade80] font-bold">2. 產出 Outputs (量化數據)</h4>
                                                <button type="button" onClick={() => addSroiItem('outputs')} className="text-xs bg-[#4ade80]/20 text-[#4ade80] px-2 py-1 rounded hover:bg-[#4ade80]/30">+ 新增產出</button>
                                            </div>
                                            <div className="space-y-3">
                                                {sroiData.outputs.map((item, idx) => (
                                                    <div key={idx} className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_2fr_auto] gap-2 items-start bg-black/20 p-3 rounded-lg">
                                                        <input type="text" value={item.name} onChange={(e) => updateSroiItem('outputs', idx, 'name', e.target.value)} placeholder="項目名稱 (如: 服務人數)" className="bg-transparent border-b border-white/20 px-1 py-1 text-sm focus:border-[#D89C23] outline-none" />
                                                        <input type="text" value={item.value} onChange={(e) => updateSroiItem('outputs', idx, 'value', e.target.value)} placeholder="顯示文字 (如: 100人)" className="bg-transparent border-b border-white/20 px-1 py-1 text-sm focus:border-[#D89C23] outline-none" />
                                                        <input type="text" value={item.description || ''} onChange={(e) => updateSroiItem('outputs', idx, 'description', e.target.value)} placeholder="說明備註" className="bg-transparent border-b border-white/20 px-1 py-1 text-sm focus:border-[#D89C23] outline-none text-gray-400" />
                                                        <button type="button" onClick={() => removeSroiItem('outputs', idx)} className="text-red-400 hover:text-red-300">
                                                             <CloseIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Outcomes Section */}
                                        <div className="border border-white/10 rounded-xl p-4 bg-white/5">
                                            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                                                <h4 className="text-[#c084fc] font-bold">3. 成果 Outcomes (價值轉化)</h4>
                                                <button type="button" onClick={() => addSroiItem('outcomes')} className="text-xs bg-[#c084fc]/20 text-[#c084fc] px-2 py-1 rounded hover:bg-[#c084fc]/30">+ 新增成果</button>
                                            </div>
                                            <div className="space-y-3">
                                                {sroiData.outcomes.map((item, idx) => (
                                                    <div key={idx} className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_2fr_auto] gap-2 items-start bg-black/20 p-3 rounded-lg">
                                                        <input type="text" value={item.name} onChange={(e) => updateSroiItem('outcomes', idx, 'name', e.target.value)} placeholder="改變項目 (如: 節省成本)" className="bg-transparent border-b border-white/20 px-1 py-1 text-sm focus:border-[#D89C23] outline-none" />
                                                        <input type="text" value={item.value} onChange={(e) => updateSroiItem('outcomes', idx, 'value', e.target.value)} placeholder="顯示文字 (如: $20,000)" className="bg-transparent border-b border-white/20 px-1 py-1 text-sm focus:border-[#D89C23] outline-none" />
                                                        <input type="number" value={item.monetizedValue || ''} onChange={(e) => updateSroiItem('outcomes', idx, 'monetizedValue', Number(e.target.value))} placeholder="貨幣化價值 ($)" className="bg-transparent border-b border-white/20 px-1 py-1 text-sm focus:border-[#D89C23] outline-none text-[#c084fc]" />
                                                        <input type="text" value={item.description || ''} onChange={(e) => updateSroiItem('outcomes', idx, 'description', e.target.value)} placeholder="價值轉換說明" className="bg-transparent border-b border-white/20 px-1 py-1 text-sm focus:border-[#D89C23] outline-none text-gray-400" />
                                                        <button type="button" onClick={() => removeSroiItem('outcomes', idx)} className="text-red-400 hover:text-red-300">
                                                             <CloseIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="text-xs text-gray-500 text-center pt-4">
                                            * SROI 比率由 (總成果貨幣化價值 / 總投入計算金額) 自動計算得出。
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-white/10 bg-white/5 flex-shrink-0">
                         <button type="submit" className="w-full bg-gradient-to-r from-[#D89C23] to-[#b8811f] hover:from-[#b8811f] hover:to-[#9e6f1a] text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-[#D89C23]/30">
                            {isEditMode ? '更新行動' : '建立行動'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InitiateActionForm;
