import { useState } from 'react';
import Modal from './Modal';

export interface RoomSettings {
    maxPlayers: number;
    timerDuration: number; // in seconds, 0 means no timer
    isPrivate: boolean;
    roomName: string;
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
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(settings);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Room Settings" type="info">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Room Name */}
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

                {/* Max Players */}
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

                {/* Timer Duration */}
                <div>
                    <label className="block text-sm font-semibold uppercase tracking-wider mb-2 text-black">
                        Timer Duration (seconds)
                    </label>
                    <input
                        type="number"
                        value={settings.timerDuration}
                        onChange={(e) => setSettings({ ...settings, timerDuration: parseInt(e.target.value) || 0 })}
                        min={0}
                        max={3600}
                        step={30}
                        className="w-full px-4 py-3 border-4 border-black bg-white text-black focus:outline-none focus:ring-4 focus:ring-gold uppercase tracking-wider"
                        placeholder="0 = No timer"
                    />
                    <p className="mt-1 text-xs uppercase tracking-wider text-black opacity-70">
                        {settings.timerDuration === 0
                            ? 'No timer - game continues until completion'
                            : `${Math.floor(settings.timerDuration / 60)}:${String(settings.timerDuration % 60).padStart(2, '0')}`}
                    </p>
                </div>

                {/* Private Room */}
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

                {/* Buttons */}
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

