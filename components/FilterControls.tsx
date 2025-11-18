import React from 'react';

interface FilterControlsProps {
    categories: string[];
    activeFilter: string;
    onFilterChange: (category: string) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({ categories, activeFilter, onFilterChange }) => (
    <div className="flex items-center space-x-3 p-3 bg-black/40 backdrop-blur-lg border border-white/20 rounded-full shadow-lg">
        {categories.map((category) => (
            <button
                key={category}
                onClick={() => onFilterChange(category)}
                className={`px-5 py-2 text-base font-medium transition-all duration-300 whitespace-nowrap rounded-full
                    ${activeFilter === category 
                        ? "bg-[#D89C23] text-black shadow-md" 
                        : "text-gray-300 hover:text-white hover:bg-white/5"}`}
            >
                {category}
            </button>
        ))}
    </div>
);

export default FilterControls;