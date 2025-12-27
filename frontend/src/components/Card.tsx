import type { Card as CardType } from "../types/game";

interface CardProps {
    card: CardType;
    isSelected?: boolean;
    onClick?: () => void;
}

// Color to hex mapping
const COLOR_MAP: Record<CardType['color'], string> = {
    red: '#CC0000',
    green: '#00AA00',
    purple: '#6600CC',
} as const;

// Color to pattern ID mapping (patterns defined globally in StripePatterns component)
const PATTERN_ID_MAP: Record<CardType['color'], string> = {
    red: 'stripes-c0',
    green: 'stripes-c1',
    purple: 'stripes-c2',
} as const;

export default function Card({ card, isSelected = false, onClick }: CardProps) {
    const renderShape = () => {
        const shapeColor = COLOR_MAP[card.color];

        const shapeStyle: React.CSSProperties = {
            stroke: shapeColor,
            strokeWidth: 0.5,
            fill: card.shading === 'solid' 
                ? shapeColor 
                : card.shading === 'striped' 
                    ? `url(#${PATTERN_ID_MAP[card.color]})` 
                    : 'transparent',
        };

        const shapes = [];
        // Render each shape with proper spacing - shapes are spaced vertically
        for (let i = 0; i < card.number; i++) {
            if (card.shape === 'diamond') {
                shapes.push(
                    <svg key={i} viewBox="0 0 12 8" style={{ ...shapeStyle, display: 'block' }}>
                        <polygon points="1,4 6,7 11,4 6,1" />
                    </svg>
                );
            } else if (card.shape === 'oval') {
                shapes.push(
                    <svg key={i} viewBox="0 0 12 8" style={{ ...shapeStyle, display: 'block' }}>
                        <path d="M3,2h6c1.1,0,2,0.9,2,2v0c0,1.1-0.9,2-2,2H3C1.9,6,1,5.1,1,4v0C1,2.9,1.9,2,3,2z" />
                    </svg>
                );
            } else if (card.shape === 'squiggle') {
                shapes.push(
                    <svg key={i} viewBox="0 0 12 8" style={{ ...shapeStyle, display: 'block' }}>
                        <path d="M2,6.3C1.4,6.3,0.9,6,0.5,5.5C0,4.7,0.2,3.6,1,3c1.9-1.3,4-1.7,6-0.6c0.7,0.4,1.3,0.2,1.9-0.3c0.7-0.6,1.8-0.5,2.5,0.2c0.6,0.7,0.5,1.8-0.2,2.5C9.4,6.3,7.3,6.6,5.3,5.5C4.5,5.1,3.7,5.4,3,6C2.7,6.2,2.3,6.3,2,6.3z" />
                    </svg>
                );
            }
        }

        return shapes;
    };

    return (
        <div
            onClick={onClick}
            className="card cursor-pointer"
        >
            <div 
                className={`card-inner ${isSelected ? 'selected' : ''}`}
            >
                {/* Render shapes based on number (1, 2, or 3) */}
                {/* Patterns are defined globally in StripePatterns component */}
                {renderShape()}
            </div>
        </div>
    );
}
