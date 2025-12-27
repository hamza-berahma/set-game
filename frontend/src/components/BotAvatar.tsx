interface BotAvatarProps {
    botId: string;
    botName: string;
    size?: 'small' | 'medium' | 'large';
    className?: string;
}

const sizeMap = {
    small: 32,
    medium: 48,
    large: 64,
};

const botColors = ['#AA0000', '#008800', '#5500AA', '#FF8800', '#0088AA', '#8800AA'];

export default function BotAvatar({ botId, botName, size = 'medium', className = '' }: BotAvatarProps) {
    const pixelSize = sizeMap[size];
    const gridSize = 8;
    
    const hash = botId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const primaryColor = botColors[hash % botColors.length];
    const secondaryColor = botColors[(hash + 1) % botColors.length];
    const accentColor = botColors[(hash + 2) % botColors.length];
    
    const pixels: boolean[][] = [];
    for (let y = 0; y < gridSize; y++) {
        pixels[y] = [];
        for (let x = 0; x < gridSize; x++) {
            const pixelHash = (hash + Math.abs(x - gridSize/2) * 7 + Math.abs(y - gridSize/2) * 11) % 100;
            pixels[y][x] = pixelHash > 35;
        }
    }
    
    const cellSize = pixelSize / gridSize;
    
    return (
        <div 
            className={`inline-block ${className}`}
            style={{ width: pixelSize, height: pixelSize }}
            title={`Bot: ${botName}`}
        >
            <svg 
                width={pixelSize} 
                height={pixelSize} 
                viewBox={`0 0 ${pixelSize} ${pixelSize}`}
                style={{ imageRendering: 'pixelated' }}
            >
                <rect width={pixelSize} height={pixelSize} fill={primaryColor} />
                
                {pixels.map((row, y) =>
                    row.map((filled, x) => {
                        if (!filled) return null;
                        const isCenter = Math.abs(x - gridSize/2) < 2 && Math.abs(y - gridSize/2) < 2;
                        const color = isCenter ? accentColor : secondaryColor;
                        return (
                            <rect
                                key={`${x}-${y}`}
                                x={x * cellSize}
                                y={y * cellSize}
                                width={cellSize}
                                height={cellSize}
                                fill={color}
                            />
                        );
                    })
                )}
                
                <text
                    x={pixelSize - cellSize * 2}
                    y={cellSize * 2}
                    fontSize={cellSize * 1.5}
                    fill="#000000"
                    fontFamily="Arial, sans-serif"
                    fontWeight="bold"
                    textAnchor="middle"
                >
                    B
                </text>
                
                <rect 
                    width={pixelSize} 
                    height={pixelSize} 
                    fill="none" 
                    stroke="#000000" 
                    strokeWidth={2}
                />
            </svg>
        </div>
    );
}

