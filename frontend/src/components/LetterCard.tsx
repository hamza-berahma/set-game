interface LetterCardProps {
    letter: string;
    color: 'red' | 'green' | 'purple';
    className?: string;
}

const COLOR_MAP = {
    red: '#CC0000',
    green: '#00AA00',
    purple: '#6600CC',
} as const;

export default function LetterCard({ letter, color, className = '' }: LetterCardProps) {
    const bgColor = COLOR_MAP[color];

    return (
        <div
            className={`inline-block relative ${className}`}
            style={{
                width: '120px',
                height: '160px',
            }}
        >
            <div
                className="relative w-full h-full flex items-center justify-center"
                style={{
                    backgroundColor: '#FFFFFF',
                    border: '6px solid #000000',
                    boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
                }}
            >
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundColor: bgColor,
                    }}
                />

                <div
                    className="relative z-10 font-bold uppercase tracking-wider"
                    style={{
                        fontSize: '72px',
                        color: bgColor,
                        textShadow: '2px 2px 0px rgba(0,0,0,0.2)',
                    }}
                >
                    {letter}
                </div>

                <div
                    className="absolute top-2 left-2 w-3 h-3"
                    style={{
                        backgroundColor: bgColor,
                        border: '2px solid #000000',
                    }}
                />
                <div
                    className="absolute bottom-2 right-2 w-3 h-3"
                    style={{
                        backgroundColor: bgColor,
                        border: '2px solid #000000',
                    }}
                />
            </div>
        </div>
    );
}

