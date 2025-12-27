import { useState } from 'react';
import Modal from './Modal';

export interface RoomSettings {
    maxPlayers: number;
    timerDuration: number; // in seconds, 0 means no timer
    isPrivate: boolean;
    roomName: string;
    playWithBots?: boolean;
}

interface RoomSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: RoomSettings) => void;
    initialSettings?: Partial<RoomSettings>;
}

export default function RoomSettingsModal({
    isOpen,
    onClose,
    onSave,
    initialSettings = {},
}: RoomSettingsModalProps) {
    const [settings, setSettings] = useState<RoomSettings>({
        maxPlayers: initialSettings.maxPlayers || 4,
        timerDuration: initialSettings.timerDuration || 0,
        isPrivate: initialSettings.isPrivate || false,
        roomName: initialSettings.roomName || '',
        playWithBots: initialSettings.playWithBots ?? true, // Default to true
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(settings);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Room Settings" type="white">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold uppercase tracking-wider mb-2 text-black">
                        Room Name (Optional)
                    </label>
                    <input
                        type="text"
                        value={settings.roomName}
                        onChange={(e) => setSettings({ ...settings, roomName: e.target.value })}
                        maxLength={50}
                        className="w-full px-4 py-3 border-4 border-black bg-white text-black focus:outline-none focus:ring-4 focus:ring-gold uppercase tracking-wider"
                        placeholder="Enter room name"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold uppercase tracking-wider mb-2 text-black">
                        Max Players
                    </label>
                    <select
                        value={settings.maxPlayers}
                        onChange={(e) => setSettings({ ...settings, maxPlayers: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border-4 border-black bg-white text-black focus:outline-none focus:ring-4 focus:ring-gold uppercase tracking-wider"
                    >
                        <option value={2}>2 Players</option>
                        <option value={3}>3 Players</option>
                        <option value={4}>4 Players</option>
                        <option value={6}>6 Players</option>
                        <option value={8}>8 Players</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold uppercase tracking-wider mb-2 text-black">
                        Timer Duration
                    </label>
                    <select
                        value={settings.timerDuration}
                        onChange={(e) => setSettings({ ...settings, timerDuration: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border-4 border-black bg-white text-black focus:outline-none focus:ring-4 focus:ring-gold uppercase tracking-wider"
                    >
                        <option value={0}>No Timer</option>
                        <option value={60}>1 Minute</option>
                        <option value={120}>2 Minutes</option>
                        <option value={180}>3 Minutes</option>
                        <option value={300}>5 Minutes</option>
                        <option value={600}>10 Minutes</option>
                        <option value={900}>15 Minutes</option>
                    </select>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="playWithBots"
                        checked={settings.playWithBots}
                        onChange={(e) => setSettings({ ...settings, playWithBots: e.target.checked })}
                        className="w-5 h-5 border-4 border-black accent-set-purple cursor-pointer"
                    />
                    <label htmlFor="playWithBots" className="text-sm font-semibold uppercase tracking-wider text-black cursor-pointer">
                        Play with Bots
                    </label>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="isPrivate"
                        checked={settings.isPrivate}
                        onChange={(e) => setSettings({ ...settings, isPrivate: e.target.checked })}
                        className="w-5 h-5 border-4 border-black accent-set-purple cursor-pointer"
                    />
                    <label htmlFor="isPrivate" className="text-sm font-semibold uppercase tracking-wider text-black cursor-pointer">
                        Private Room (requires room code to join)
                    </label>
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-6 py-3 bg-white hover:bg-gold border-4 border-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:scale-105 font-semibold text-black"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 px-6 py-3 bg-set-green hover:bg-[#008800] border-4 border-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:scale-105 font-semibold text-white"
                        style={{ color: '#ffffff', backgroundColor: '#00AA00' }}
                    >
                        Create Room
                    </button>
                </div>
            </form>
        </Modal>
    );
}

