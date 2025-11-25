
import React, { useState } from 'react';
import { CloseIcon } from './icons';
import { type User } from '../types';

interface LoginModalProps {
    onClose: () => void;
    onLogin: (user: User) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // Simulate API network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (isRegistering) {
            // Register Validation
            if (!name || !email || !password || !confirmPassword) {
                setError("請填寫所有欄位");
                setIsLoading(false);
                return;
            }
            if (password !== confirmPassword) {
                setError("確認密碼不相符");
                setIsLoading(false);
                return;
            }
            
            // Success Register (Mock)
            const newUser: User = {
                id: `user-${Date.now()}`,
                name,
                email,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&background=D89C23`
            };
            onLogin(newUser);
        } else {
            // Login Validation
            if (!email || !password) {
                setError("請輸入電子郵件和密碼");
                setIsLoading(false);
                return;
            }

            // Specific Check for grace836152@gmail.com
            if (email === "grace836152@gmail.com") {
                if (password !== "admin0000") {
                    setError("密碼錯誤");
                    setIsLoading(false);
                    return;
                }
                // Success Login for Grace
                const graceUser: User = {
                    id: "user-grace836152gmailcom",
                    name: "Grace Admin",
                    email: "grace836152@gmail.com",
                    avatar: `https://ui-avatars.com/api/?name=Grace+Admin&background=random&color=fff&background=D89C23`
                };
                onLogin(graceUser);
                setIsLoading(false);
                onClose();
                return;
            }

            // Success Login (Mock) for other users
            // In a real app, this would validate against a backend.
            const derivedName = email.split('@')[0];
            const mockUser: User = {
                id: `user-${email.replace(/[^a-zA-Z0-9]/g, '')}`,
                name: derivedName,
                email,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(derivedName)}&background=random&color=fff&background=D89C23`
            };
            onLogin(mockUser);
        }
        setIsLoading(false);
        onClose();
    };

    const toggleMode = () => {
        setIsRegistering(!isRegistering);
        setError(null);
        // Reset sensitive fields
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="relative w-11/12 max-w-md p-8 bg-[#1a1a1a] backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 text-white flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                    <CloseIcon className="w-6 h-6" />
                </button>
                
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2 text-white">
                        {isRegistering ? '建立帳戶' : '歡迎回來'}
                    </h2>
                    <p className="text-gray-400 text-sm">
                        {isRegistering ? '加入 Star Action，開始您的行動旅程' : '登入以繼續您的探索'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegistering && (
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">名稱</label>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#D89C23]/50 focus:border-transparent transition-all"
                                placeholder="您的暱稱"
                            />
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">電子郵件</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#D89C23]/50 focus:border-transparent transition-all"
                            placeholder="name@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">密碼</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#D89C23]/50 focus:border-transparent transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    {isRegistering && (
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">確認密碼</label>
                            <input 
                                type="password" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#D89C23]/50 focus:border-transparent transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-900/30 border border-red-800/50 rounded-lg text-red-200 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full mt-6 bg-gradient-to-r from-[#D89C23] to-[#b8811f] hover:from-[#e6af3a] hover:to-[#c99026] text-black font-bold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-[#D89C23]/20 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            isRegistering ? '註冊帳號' : '登入'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-400 text-sm">
                        {isRegistering ? '已經有帳號了嗎？' : '還沒有帳號？'}
                        <button 
                            onClick={toggleMode}
                            className="ml-2 text-[#D89C23] hover:text-[#e6af3a] font-semibold hover:underline focus:outline-none"
                        >
                            {isRegistering ? '立即登入' : '註冊新帳號'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
