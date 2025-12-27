import type { Card as CardType } from "../types/game";

interface CardProps {
    card: CardType;
    isSelected?: boolean;
    onClick?: () => void;
}

export default function Card({ card, isSelected = false, onClick }: CardProps) {
    const patternIdRed = `stripes-c0-${card.id}`;
    const patternIdGreen = `stripes-c1-${card.id}`;
    const patternIdPurple = `stripes-c2-${card.id}`;

    const renderShape = () => {
        const shapeColor = {
            red: '#CC0000',
            green: '#00AA00',
            purple: '#6600CC',
        }[card.color];

        const patternIdMap = {
            red: patternIdRed,
            green: patternIdGreen,
            purple: patternIdPurple,
        };

        const shapeStyle: React.CSSProperties = {
            stroke: shapeColor,
            strokeWidth: 0.5,
            fill: card.shading === 'solid' 
                ? shapeColor 
                : card.shading === 'striped' 
                    ? `url(#${patternIdMap[card.color]})` 
                    : 'transparent',
        };

        const shapes = [];
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
                <svg width="0" height="0" style={{ position: 'absolute' }}>
                    <defs>
                        <pattern id={patternIdRed} x="0" width="12" height="8" patternUnits="userSpaceOnUse" stroke="#CC0000" strokeWidth="0.3">
                            <line x1="1" y1="0" x2="1" y2="8"/>
                            <line x1="2.2" y1="0" x2="2.2" y2="8"/>
                            <line x1="3.5" y1="0" x2="3.5" y2="8"/>
                            <line x1="4.8" y1="0" x2="4.8" y2="8"/>
                            <line x1="6" y1="0" x2="6" y2="8"/>
                            <line x1="11" y1="0" x2="11" y2="8"/>
                            <line x1="8.5" y1="0" x2="8.5" y2="8"/>
                            <line x1="7.2" y1="0" x2="7.2" y2="8"/>
                            <line x1="9.8" y1="0" x2="9.8" y2="8"/>
                        </pattern>
                        <pattern id={patternIdGreen} x="0" width="12" height="8" patternUnits="userSpaceOnUse" stroke="#00AA00" strokeWidth="0.3">
                            <line x1="1" y1="0" x2="1" y2="8"/>
                            <line x1="2.2" y1="0" x2="2.2" y2="8"/>
                            <line x1="3.5" y1="0" x2="3.5" y2="8"/>
                            <line x1="4.8" y1="0" x2="4.8" y2="8"/>
                            <line x1="6" y1="0" x2="6" y2="8"/>
                            <line x1="11" y1="0" x2="11" y2="8"/>
                            <line x1="8.5" y1="0" x2="8.5" y2="8"/>
                            <line x1="7.2" y1="0" x2="7.2" y2="8"/>
                            <line x1="9.8" y1="0" x2="9.8" y2="8"/>
                        </pattern>
                        <pattern id={patternIdPurple} x="0" width="12" height="8" patternUnits="userSpaceOnUse" stroke="#6600CC" strokeWidth="0.3">
                            <line x1="1" y1="0" x2="1" y2="8"/>
                            <line x1="2.2" y1="0" x2="2.2" y2="8"/>
                            <line x1="3.5" y1="0" x2="3.5" y2="8"/>
                            <line x1="4.8" y1="0" x2="4.8" y2="8"/>
                            <line x1="6" y1="0" x2="6" y2="8"/>
                            <line x1="11" y1="0" x2="11" y2="8"/>
                            <line x1="8.5" y1="0" x2="8.5" y2="8"/>
                            <line x1="7.2" y1="0" x2="7.2" y2="8"/>
                            <line x1="9.8" y1="0" x2="9.8" y2="8"/>
                        </pattern>
                    </defs>
                </svg>

                {renderShape()}
            </div>
        </div>
    );
}
