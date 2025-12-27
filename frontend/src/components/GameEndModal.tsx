import Modal from './Modal';
import ProfileAvatar from './ProfileAvatar';
import BotAvatar from './BotAvatar';

interface GameEndModalProps {
    isOpen: boolean;
    onClose: () => void;
    scores: Record<string, number>;
    players: string[];
    currentUserId?: string;
    playerNames: Record<string, string>;
}

export default function GameEndModal({
    isOpen,
    onClose,
    scores,
    players,
    currentUserId,
    playerNames,
}: GameEndModalProps) {
    const rankedPlayers = players
        .map(playerId => ({
            playerId,
            score: scores[playerId] || 0,
            name: playerNames[playerId] || (playerId.startsWith('bot-') ? 'Bot' : `Player ${playerId.slice(0, 8)}`),
            isBot: playerId.startsWith('bot-'),
        }))
        .sort((a, b) => b.score - a.score);

    const getRankEmoji = (index: number) => {
        if (index === 0) return '🥇';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return '';
    };

    const getRankColor = (index: number) => {
        if (index === 0) return 'bg-gold';
        if (index === 1) return 'bg-beige';
        if (index === 2) return 'bg-white';
        return 'bg-white';
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Game Finished!"
            type="white"
            closeOnBackdrop={false}
        >
            <div className="space-y-4">
                <p className="text-lg uppercase tracking-wider text-black mb-6 text-center">
                    Final Rankings
                </p>

                <div className="space-y-3">
                    {rankedPlayers.map((player, index) => {
                        const isCurrentUser = player.playerId === currentUserId;
                        const rankEmoji = getRankEmoji(index);
                        const rankColor = getRankColor(index);

                        return (
                            <div
                                key={player.playerId}
                                className={`border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${rankColor} ${
                                    isCurrentUser ? 'ring-4 ring-set-purple' : ''
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl font-bold text-black min-w-[40px]">
                                            {rankEmoji} #{index + 1}
                                        </span>
                                        {player.isBot ? (
                                            <BotAvatar
                                                botId={player.playerId}
                                                botName={player.name}
                                                size="medium"
                                            />
                                        ) : (
                                            <ProfileAvatar
                                                userId={player.playerId}
                                                size="medium"
                                            />
                                        )}
                                        <div>
                                            <span className="text-lg font-bold uppercase tracking-wider text-black">
                                                {isCurrentUser ? 'You' : player.name}
                                            </span>
                                            {isCurrentUser && (
                                                <span className="ml-2 text-sm text-set-purple font-semibold">(You)</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-black">
                                            {player.score}
                                        </div>
                                        <div className="text-xs uppercase tracking-wider text-black">
                                            {player.score === 1 ? 'point' : 'points'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="pt-4 border-t-4 border-black">
                    <button
                        onClick={onClose}
                        className="w-full px-6 py-3 bg-set-green hover:bg-[#008800] border-4 border-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:scale-105 font-semibold text-white"
                        style={{ color: '#ffffff', backgroundColor: '#00AA00' }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
}

