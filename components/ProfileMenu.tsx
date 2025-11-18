
import React from 'react';
import { HandRaisedIcon, LightBulbIcon, HeartIcon } from './icons';

interface ProfileMenuProps {
    onClose: () => void;
    onNavigate: (page: 'home' | 'action' | 'participated' | 'interested', filter?: 'all' | 'mine') => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ onClose, onNavigate }) => {
    const menuItems = [
        { icon: HandRaisedIcon, text: '我參與的行動', action: () => onNavigate('participated') },
        { icon: LightBulbIcon, text: '我發起的行動', action: () => onNavigate('action', 'mine') },
        { icon: HeartIcon, text: '我有興趣的行動', action: () => onNavigate('interested') },
    ];

    return (
        <div 
            className="absolute top-16 right-4 z-50 w-64 origin-top-right rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 ring-1 ring-black ring-opacity-5 focus:outline-none animate-fadeIn"
            role="menu" 
            aria-orientation="vertical" 
            aria-labelledby="user-menu-button" 
            tabIndex={-1}
        >
            <div className="py-2" role="none">
                {menuItems.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            item.action();
                            onClose();
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-200 hover:bg-white/5 transition-colors"
                        role="menuitem"
                        tabIndex={-1}
                    >
                        <item.icon className="w-5 h-5 mr-3 text-gray-400" />
                        <span>{item.text}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ProfileMenu;
