
import React, { useState, useEffect, useRef } from 'react';
import ProfileMenu from './ProfileMenu';

interface HeaderProps {
    onNavigate: (page: 'home' | 'action' | 'participated' | 'interested', filter?: 'all' | 'mine') => void;
}


const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
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
                <h1 className="text-2xl font-bold tracking-wider text-white">STAR ACTION</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
                <button onClick={() => onNavigate('home')} className="text-sm text-gray-300 hover:text-white transition-colors">Home</button>
                <button onClick={() => onNavigate('action', 'all')} className="text-sm text-gray-300 hover:text-white transition-colors">Action</button>
            </nav>
            <div className="flex items-center">
                <div ref={menuRef} className="relative">
                    <button
                        id="user-menu-button"
                        aria-expanded={isProfileMenuOpen}
                        aria-haspopup="true"
                        onClick={toggleProfileMenu}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D89C23] to-[#b8811f] flex items-center justify-center text-xs font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#D89C23]"
                    >
                        JW
                    </button>
                    {isProfileMenuOpen && <ProfileMenu onNavigate={onNavigate} onClose={() => setIsProfileMenuOpen(false)} />}
                </div>
            </div>
        </header>
    );
};

export default Header;
