import React, { useMemo } from 'react';

const StarfieldBackground: React.FC = () => {
    const stars = useMemo(() => {
        return Array.from({ length: 600 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2.5 + 0.3,
            opacity: Math.random() * 0.8 + 0.2,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${Math.random() * 4 + 2}s`,
        }));
    }, []);

    return (
        <div className="fixed inset-0 z-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-black via-slate-950 to-purple-950/20" />

            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[rgba(216,156,35,0.05)] rounded-full blur-3xl" />

            {stars.map((star) => (
                <div
                    key={star.id}
                    className="absolute rounded-full bg-white animate-twinkle"
                    style={{
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        opacity: star.opacity,
                        animationDelay: star.animationDelay,
                        animationDuration: star.animationDuration,
                        boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, ${star.opacity})`,
                    }}
                />
            ))}
        </div>
    );
};

export default StarfieldBackground;