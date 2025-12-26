export interface RoomSettings {
    maxPlayers: number;
    timerDuration: number; // in seconds, 0 means no timer
    isPrivate: boolean;
    roomName?: string;
}

export interface CreateRoomRequest {
    settings: RoomSettings;
}

export interface Room {
    roomId: string;
    roomCode?: string;
    settings: RoomSettings;
    createdAt: Date;
    currentMatchId?: string;
}

