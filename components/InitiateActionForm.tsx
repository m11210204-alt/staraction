import React, { useState, useEffect } from 'react';
import { type ConstellationData, ActionStatus, Update } from '../types';
import { CloseIcon } from './icons';

interface InitiateActionFormProps {
    onClose: () => void;
    onCreateAction: (newAction: ConstellationData) => void;
    onUpdateAction: (updatedAction: ConstellationData) => void;
    actionToEdit?: ConstellationData | null;
}

const InputField = ({ label, children, required = true }: {label: string, children: React.ReactNode, required?: boolean}) => (
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
    const [name, setName] = useState('');
    const [category, setCategory] = useState('社會福利');
    const [summary, setSummary] = useState('');
    const [background, setBackground] = useState('');
    const [goals, setGoals] = useState<string[]>(['']);
    const [howToParticipate, setHowToParticipate] = useState('');
    const [maxParticipants, setMaxParticipants] = useState(30);
    const [updates, setUpdates] = useState<Update[]>([{ date: '', text: '' }]);
    
    const isEditMode = !!actionToEdit;

    useEffect(() => {
        if (isEditMode) {
            setName(actionToEdit.name);
            setCategory(actionToEdit.category);
            setSummary(actionToEdit.summary);
            setBackground(actionToEdit.background);
            setGoals(actionToEdit.goals.length > 0 ? actionToEdit.goals : ['']);
            setHowToParticipate(actionToEdit.howToParticipate);
            setMaxParticipants(actionToEdit.maxParticipants);
            setUpdates(actionToEdit.updates.length > 0 ? actionToEdit.updates : [{ date: '', text: '' }])
        }
    }, [actionToEdit, isEditMode]);


    const handleGoalChange = (index: number, value: string) => {
        const newGoals = [...goals];
        newGoals[index] = value;
        setGoals(newGoals);
    };

    const addGoal = () => {
        setGoals([...goals, '']);
    };

    const removeGoal = (index: number) => {
        if (goals.length > 1) {
            setGoals(goals.filter((_, i) => i !== index));
        }
    };
    
    const handleUpdateChange = (index: number, field: keyof Update, value: string) => {
        const newUpdates = [...updates];
        newUpdates[index] = { ...newUpdates[index], [field]: value };
        setUpdates(newUpdates);
    };

    const addUpdate = () => {
        setUpdates([...updates, { date: '', text: '' }]);
    };

    const removeUpdate = (index: number) => {
        if (updates.length > 1) {
            setUpdates(updates.filter((_, i) => i !== index));
        } else {
            setUpdates([{ date: '', text: '' }]);
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const finalUpdates = updates.filter(u => u.date.trim() !== '' && u.text.trim() !== '');

        if (isEditMode) {
            const updatedAction: ConstellationData = {
                ...actionToEdit,
                name,
                category,
                summary,
                background,
                goals: goals.filter(g => g.trim() !== ''),
                howToParticipate,
                maxParticipants: Number(maxParticipants),
                updates: finalUpdates,
            };
            onUpdateAction(updatedAction);
        } else {
            const newAction: ConstellationData = {
                id: `const-${Date.now()}`,
                name,
                category,
                summary,
                background,
                goals: goals.filter(g => g.trim() !== ''),
                howToParticipate,
                maxParticipants: Number(maxParticipants),
                initiator: "當前使用者", 
                status: ActionStatus.PENDING,
                participants: [],
                comments: [],
                updates: finalUpdates,
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
            <div className="relative w-11/12 max-w-2xl h-[90vh] p-8 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl shadow-black/50 text-white flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors z-10">
                    <CloseIcon className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold mb-6 text-center">{isEditMode ? '編輯行動' : '發起新行動'}</h2>
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                    <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-4">
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
                            <TextArea value={background} onChange={(e) => setBackground(e.target.value)} rows={4} required />
                        </InputField>

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

                        <InputField label="參與方式">
                            <TextArea value={howToParticipate} onChange={(e) => setHowToParticipate(e.target.value)} rows={4} required />
                        </InputField>

                        <InputField label="預計招募人數">
                            <input type="number" value={maxParticipants} onChange={(e) => setMaxParticipants(parseInt(e.target.value, 10))} min="1" className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-400 focus:ring-[#D89C23] focus:border-[#D89C23] transition" required />
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
                    <div className="mt-6 flex-shrink-0">
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