import type { Card as CardType, Shape } from "../types/game";
import type { JSX } from "react";

interface CardProps {
    card: CardType;
    isSelected?: boolean;
    onClick?: () => void;
}

// Shape components
const DiamondShape = () => <polygon points="1,4 6,7 11,4 6,1" />;

const SquiggleShape = () => (
    <path
        d="M2,6.3C1.4,6.3,0.9,6,0.5,5.5C0,4.7,0.2,3.6,1,3c1.9-1.3,4-1.7,6-0.6c0.7,0.4,1.3,0.2,1.9-0.3c0.7-0.6,1.8-0.5,2.5,0.2
    c0.6,0.7,0.5,1.8-0.2,2.5C9.4,6.3,7.3,6.6,5.3,5.5C4.5,5.1,3.7,5.4,3,6C2.7,6.2,2.3,6.3,2,6.3z"
    />
);

const OvalShape = () => (
    <path d="M3,2h6c1.1,0,2,0.9,2,2v0c0,1.1-0.9,2-2,2H3C1.9,6,1,5.1,1,4v0C1,2.9,1.9,2,3,2z" />
);

// Type-safe shape component mapping
const shapes: Record<Shape, () => JSX.Element> = {
    diamond: DiamondShape,
    squiggle: SquiggleShape,
    oval: OvalShape,
};

export default function Card({ card, isSelected = false, onClick }: CardProps) {
    // Color mapping with proper types
    const colors: Record<CardType["color"], { fill: string; pattern: string }> = {
        red: { fill: "#CC0000", pattern: "stripes-red" },
        green: { fill: "#00AA00", pattern: "stripes-green" },
        purple: { fill: "#6600CC", pattern: "stripes-purple" },
    };
    const color = colors[card.color];
    const ShapeComponent = shapes[card.shape];

    // Get SVG style based on shading
    const getSvgProps = (): {
        fill: string;
        stroke: string;
        strokeWidth: number;
    } => {
        switch (card.shading) {
            case "solid":
                return {
                    fill: color.fill,
                    stroke: color.fill,
                    strokeWidth: 3,
                };
            case "striped":
                return {
                    fill: `url(#${color.pattern})`,
                    stroke: color.fill,
                    strokeWidth: 3,
                };
            case "open":
                return {
                    fill: "transparent",
                    stroke: color.fill,
                    strokeWidth: 3,
                };
        }
    };

    // Render multiple shapes based on number (1, 2, or 3)
    const renderShapes = () => {
        const shapeArray: JSX.Element[] = [];
        const spacing = 35; // Space between shapes
        const totalWidth = (card.number - 1) * spacing;
        const startX = (120 - totalWidth) / 2; // Center the group

        for (let i = 0; i < card.number; i++) {
            shapeArray.push(
                <g key={i} transform={`translate(${startX + i * spacing}, 40)`}>
                    <ShapeComponent />
                </g>,
            );
        }
        return shapeArray;
    };

    const svgProps = getSvgProps();

    return (
        <div
            onClick={onClick}
            className={`
        w-24 h-32 p-2 cursor-pointer bg-white
        transition-all duration-200 flex items-center justify-center
        ${isSelected 
            ? "border-[6px] border-black shadow-brutal-lg scale-105" 
            : "border-4 border-black shadow-brutal"
        }
        hover:shadow-brutal-lg hover:scale-105
      `}
        >
            <svg width="100%" height="100%" viewBox="0 0 120 80">
                <g {...svgProps}>{renderShapes()}</g>
            </svg>
        </div>
    );
}
