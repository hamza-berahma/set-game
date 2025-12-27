interface ProfileAvatarProps {
    userId: string;
    username?: string;
    size?: 'small' | 'medium' | 'large';
    className?: string;
}

const sizeMap = {
    small: 32,
    medium: 48,
    large: 64,
};

const colors = ['#CC0000', '#00AA00', '#6600CC']; // set-red, set-green, set-purple

export default function ProfileAvatar({ userId, username, size = 'medium', className = '' }: ProfileAvatarProps) {
    const pixelSize = sizeMap[size];
    const gridSize = 8;
    
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const primaryColor = colors[hash % colors.length];
    const secondaryColor = colors[(hash + 1) % colors.length];
    const accentColor = colors[(hash + 2) % colors.length];
    
    const pixels: boolean[][] = [];
    for (let y = 0; y < gridSize; y++) {
        pixels[y] = [];
        for (let x = 0; x < gridSize; x++) {
            const pixelHash = (hash + x * 7 + y * 11) % 100;
            pixels[y][x] = pixelHash > 40; // 60% fill rate
        }
    }
    
    const cellSize = pixelSize / gridSize;
    
    return (
        <div 
            className={`inline-block ${className}`}
            style={{ width: pixelSize, height: pixelSize }}
            title={username || userId}
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
                        const color = (x + y) % 3 === 0 ? secondaryColor : accentColor;
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

