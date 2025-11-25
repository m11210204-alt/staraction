
import React from 'react';
import { HandRaisedIcon, LightBulbIcon, HeartIcon, LogoutIcon, UsersIcon } from './icons';
import { type User } from '../types';

interface ProfileMenuProps {
    user: User | null;
    onClose: () => void;
    onNavigate: (page: 'home' | 'action' | 'participated' | 'interested', filter?: 'all' | 'mine') => void;
    onLogout: () => void;
    onLogin: () => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ user, onClose, onNavigate, onLogout, onLogin }) => {
    
    const handleItemClick = (action: () => void) => {
        if (!user) {
            onLogin(); // Trigger login modal if user is guest
        } else {
            action();
        }
        onClose();
    };

    const menuItems = [
        { icon: HandRaisedIcon, text: '我參與的行動', action: () => onNavigate('participated') },
        { icon: LightBulbIcon, text: '我發起的行動', action: () => onNavigate('action', 'mine') },
        { icon: HeartIcon, text: '我有興趣的行動', action: () => onNavigate('interested') },
    ];

    return (
        <div 
            className="absolute top-16 right-0 z-50 w-72 origin-top-right rounded-2xl bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 ring-1 ring-white/5 focus:outline-none animate-fadeIn overflow-hidden"
            role="menu" 
            aria-orientation="vertical" 
            aria-labelledby="user-menu-button" 
            tabIndex={-1}
        >
            <div className="px-6 py-4 border-b border-white/10 bg-white/5">
                {user ? (
                    <div className="flex items-center space-x-3">
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border border-white/10" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/5 text-gray-400">
                             <UsersIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-200">訪客</p>
                            <p className="text-xs text-gray-500">點擊下方項目以登入</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="py-2" role="none">
                {menuItems.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => handleItemClick(item.action)}
                        className="flex items-center w-full px-6 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-[#D89C23] transition-colors group"
                        role="menuitem"
                        tabIndex={-1}
                    >
                        <item.icon className="w-5 h-5 mr-3 text-gray-500 group-hover:text-[#D89C23] transition-colors" />
                        <span>{item.text}</span>
                    </button>
                ))}
            </div>

            <div className="border-t border-white/10 py-2">
                {user ? (
                    <button
                        onClick={() => {
                            onLogout();
                            onClose();
                        }}
                        className="flex items-center w-full px-6 py-3 text-sm text-gray-400 hover:bg-white/5 hover:text-red-400 transition-colors group"
                    >
                        <LogoutIcon className="w-5 h-5 mr-3 text-gray-500 group-hover:text-red-400 transition-colors" />
                        <span>登出</span>
                    </button>
                ) : (
                    <button
                        onClick={() => {
                            onLogin();
                            onClose();
                        }}
                        className="flex items-center w-full px-6 py-3 text-sm text-[#D89C23] font-bold hover:bg-white/5 hover:text-[#e6af3a] transition-colors group"
                    >
                        <LogoutIcon className="w-5 h-5 mr-3 text-[#D89C23] group-hover:text-[#e6af3a] transition-colors" />
                        <span>登入 / 註冊</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProfileMenu;
