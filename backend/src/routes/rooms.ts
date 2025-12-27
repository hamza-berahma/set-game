import { Router } from 'express';
import { GameRoomRepository } from '../repositories/GameRoomRepository';

const router = Router();
const gameRoomRepository = new GameRoomRepository();

router.get('/public', async (req, res) => {
    try {
        const publicRooms = await gameRoomRepository.findPublicRooms();
        res.json({ rooms: publicRooms });
    } catch (error) {
        console.error('Error fetching public rooms:', error);
        res.status(500).json({ error: 'Failed to fetch public rooms' });
    }
});

export default router;

