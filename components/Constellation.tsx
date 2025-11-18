import React, { useMemo } from 'react';
import { type ConstellationData, type Star } from '../types';

interface TwinklingStarProps {
    cx: number;
    cy: number;
    animationDelay: string;
}

const TwinklingStar: React.FC<TwinklingStarProps> = ({ cx, cy, animationDelay }) => {
    return (
        <g>
            <circle
                cx={cx}
                cy={cy}
                r={4}
                fill="url(#starGradient)"
                className="animate-slow-pulse"
                style={{
                    filter: "url(#starGlowFilter)",
                    transition: "r 0.5s ease-in-out",
                    animationDelay: animationDelay,
                }}
            />
            <circle cx={cx} cy={cy} r={2} fill="white" opacity={0.9} />
        </g>
    );
};

const InitialStar: React.FC<{ cx: number; cy: number }> = ({ cx, cy }) => {
    return (
        <circle
            cx={cx}
            cy={cy}
            r={3}
            fill="white"
            opacity={0.5}
            filter="url(#initialStarGlowFilter)"
        />
    );
};


interface ConstellationProps {
    data: ConstellationData;
    onSelect: () => void;
}

const Constellation: React.FC<ConstellationProps> = ({ data, onSelect }) => {
    const { shapePoints, participants, maxParticipants } = data;

    const participantsMap = useMemo(() => {
        const map = new Map<number, { star: Star; index: number }>();
        participants.forEach((p, i) => {
            map.set(p.pointIndex, { star: p, index: i });
        });
        return map;
    }, [participants]);

    const pathData = useMemo(
        () => shapePoints.map((p, i) => (i === 0 ? "M" : "L") + `${p.x},${p.y}`).join(" "),
        [shapePoints],
    );
    const viewBox = "0 0 100 100";

    const strokeColor = "url(#inProgressGradient)";
    const strokeWidth = 0.8;

    return (
        <div
            className="absolute transition-transform duration-500 hover:scale-110 animate-slow-float cursor-pointer group"
            style={{ width: "180px", height: "180px" }}
            onClick={onSelect}
        >
            <svg viewBox={viewBox} className="w-full h-full overflow-visible">
                <defs>
                     <linearGradient id="inProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#e6af3a" }} />
                        <stop offset="100%" style={{ stopColor: "#D89C23" }} />
                    </linearGradient>

                    <radialGradient id="starGradient">
                        <stop offset="0%" stopColor="rgba(240, 200, 100, 1)" />
                        <stop offset="40%" stopColor="rgba(216, 156, 35, 0.9)" />
                        <stop offset="100%" stopColor="rgba(216, 156, 35, 0)" />
                    </radialGradient>

                    <radialGradient id="newStarGlow">
                        <stop offset="0%" stopColor="rgba(216, 156, 35, 0.8)" />
                        <stop offset="50%" stopColor="rgba(216, 156, 35, 0.4)" />
                        <stop offset="100%" stopColor="rgba(216, 156, 35, 0)" />
                    </radialGradient>

                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    <filter id="starGlowFilter" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
                    </filter>

                    <filter id="initialStarGlowFilter" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
                    </filter>
                </defs>

                <path
                    d={pathData}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeDasharray={"none"}
                    className="transition-all duration-1000"
                    style={{
                        filter: "url(#glow)",
                        opacity: 1,
                    }}
                />

                {shapePoints.map((point, index) => {
                    const participantData = participantsMap.get(index);
                    if (participantData) {
                        const { star, index: participantIndex } = participantData;
                        const delay = `${(participantIndex * 0.3) % 1.5}s`;
                        return (
                            <TwinklingStar 
                                key={star.key} 
                                cx={point.x} 
                                cy={point.y} 
                                animationDelay={delay}
                            />
                        );
                    }
                    if (index < maxParticipants) {
                        return <InitialStar key={`initial-${index}`} cx={point.x} cy={point.y} />;
                    }
                    return null;
                })}
            </svg>

            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-center w-full">
                <p className="text-sm font-semibold transition-all duration-500 text-gray-300 opacity-0 group-hover:opacity-100 group-hover:text-white">
                    {data.name}
                </p>
                <p className="text-xs transition-all duration-500 text-gray-400 opacity-0 group-hover:opacity-100">
                    {data.category}
                </p>
            </div>
        </div>
    );
};

export default Constellation;