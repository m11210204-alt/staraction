
import React, { useState, useEffect, useRef } from 'react';
import ProfileMenu from './ProfileMenu';
import { type User } from '../types';
import { UsersIcon } from './icons';

interface HeaderProps {
    user: User | null;
    onNavigate: (page: 'home' | 'action' | 'participated' | 'interested', filter?: 'all' | 'mine') => void;
    onLoginClick: () => void;
    onLogout: () => void;
}


const Header: React.FC<HeaderProps> = ({ user, onNavigate, onLoginClick, onLogout }) => {
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const toggleProfileMenu = () => {
        setIsProfileMenuOpen(prev => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center text-white backdrop-blur-md bg-black/30 border-b border-white/5">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onNavigate('home')}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D89C23] to-[#ffda7f] flex items-center justify-center shadow-[0_0_10px_#D89C23]">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <h1 className="text-xl font-bold tracking-wider text-white font-serif">STAR ACTION</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
                <button onClick={() => onNavigate('home')} className="text-sm font-medium text-gray-300 hover:text-white transition-colors tracking-wide">首頁</button>
                <button onClick={() => onNavigate('action', 'all')} className="text-sm font-medium text-gray-300 hover:text-white transition-colors tracking-wide">探索行動</button>
            </nav>
            <div className="flex items-center">
                <div ref={menuRef} className="relative">
                    <button
                        id="user-menu-button"
                        aria-expanded={isProfileMenuOpen}
                        aria-haspopup="true"
                        onClick={toggleProfileMenu}
                        className={`w-9 h-9 rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black transition-all duration-300
                            ${user 
                                ? "bg-gradient-to-br from-[#D89C23] to-[#b8811f] focus:ring-[#D89C23]" 
                                : "bg-white/10 hover:bg-white/20 focus:ring-gray-500"
                            }`}
                    >
                        {user ? (
                            <img 
                                src={user.avatar} 
                                alt={user.name} 
                                className="w-full h-full rounded-full object-cover border border-black/20" 
                            />
                        ) : (
                            <div className="w-full h-full rounded-full flex items-center justify-center bg-black/40 text-gray-400">
                                <UsersIcon className="w-5 h-5" />
                            </div>
                        )}
                    </button>
                    {isProfileMenuOpen && (
                        <ProfileMenu 
                            user={user}
                            onNavigate={onNavigate} 
                            onClose={() => setIsProfileMenuOpen(false)}
                            onLogout={onLogout}
                            onLogin={onLoginClick}
                        />
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
