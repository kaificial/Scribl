import React from 'react';

export const HeartDoodle = ({ color = "currentColor", size = 24, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            d="M12 21.5C12 21.5 5.5 16.5 3.5 13C1.5 9.5 3 6 5.5 5C8 4 10.5 6 12 8C13.5 6 16 4 18.5 5C21 6 22.5 9.5 20.5 13C18.5 16.5 12 21.5 12 21.5Z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ vectorEffect: 'non-scaling-stroke' }} // Keeps stroke consistent
        />
        <path
            d="M19 6C20.5 7.5 21 10.5 19.5 13" // Extra sketch line
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.5"
        />
    </svg>
);

export const StarDoodle = ({ color = "#FFC107", size = 24, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        {/* Sketchy overlap lines */}
        <path d="M12 3L12 21 M3 12L21 12" stroke={color} strokeWidth="1" opacity="0.3" strokeLinecap="round" />
    </svg>
);

export const CakeDoodle = ({ size = 32, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        {/* Base of cake */}
        <path
            d="M4 14C4 14 4.5 20 5 21H19C19.5 20 20 14 20 14H4Z"
            stroke="#5D4037"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="#FAD1C0" fillOpacity="0.3"
        />
        {/* Frosting line */}
        <path
            d="M4 14C5 15.5 6 14 7 14C8 14 9 15.5 10 14C11 14 12 15.5 13 14C14 14 15 15.5 16 14C17 14 18 15.5 20 14"
            stroke="#5D4037"
            strokeWidth="2"
            strokeLinecap="round"
        />
        {/* Candles */}
        <path d="M8 14V11 M12 14V10 M16 14V11" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" />
        {/* Flames */}
        <path d="M8 9C7.5 10 8.5 11 8 11C7.5 11 8.5 10 8 9Z" fill="#FFA000" stroke="#FFA000" strokeWidth="1" />
        <path d="M12 8C11.5 9 12.5 10 12 10C11.5 10 12.5 9 12 8Z" fill="#FFA000" stroke="#FFA000" strokeWidth="1" />
        <path d="M16 9C15.5 10 16.5 11 16 11C15.5 11 16.5 10 16 9Z" fill="#FFA000" stroke="#FFA000" strokeWidth="1" />
    </svg>
);

export const ScribbleLine = ({ color = "currentColor", width = 100, ...props }) => (
    <svg width={width} height="10" viewBox={`0 0 ${width} 10`} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            d={`M2 5 Q${width / 4} 2 ${width / 2} 5 T${width - 2} 5`}
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.6"
        />
    </svg>
);
