import { GameState, Card, CardSelectionResult } from "../types/game";
import { generateDeck, shuffleDeck, isValidSet, findValidSets } from "../utils/game";

const gameStates = new Map<string, GameState>();

export class GameService {
    createGame(roomId: string, playerIds: string[]): GameState {
        const deck = shuffleDeck(generateDeck());
        const board = deck.splice(0, 12);

        const gameState: GameState = {
            roomId,
            status: "active",
            deck,
            board,
            scores: {},
            players: playerIds,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        playerIds.forEach((playerId) => {
            gameState.scores[playerId] = 0;
        });

        gameStates.set(roomId, gameState);
        return gameState;
    }

    getGame(roomId: string): GameState | null {
        return gameStates.get(roomId) || null;
    }

    processCardSelection(roomId: string, playerId: string, cardIds: string[]): CardSelectionResult {
        const gameState = gameStates.get(roomId);
        if (!gameState) {
            return {
                success: false,
                message: "Game not found",
            };
        }

        if (gameState.status !== "active") {
            return {
                success: false,
                message: "Game not active",
            };
        }

        if (cardIds.length !== 3) {
            return {
                success: false,
                message: "Must select exactly 3 cards",
            };
        }

        const selectedCards: Card[] = [];
        for (const cardId of cardIds) {
            const card = gameState.board.find((c) => c.id === cardId);
            if (!card) {
                return {
                    success: false,
                    message: `Card ${cardId} not on board`,
                };
            }
            selectedCards.push(card);
        }

        if (!isValidSet(selectedCards[0], selectedCards[1], selectedCards[2])) {
            return {
                success: false,
                message: "Selected cards do not form a valid set",
            };
        }

        gameState.board = gameState.board.filter((card: Card) => !cardIds.includes(card.id));

        while (gameState.board.length < 12 && gameState.deck.length > 0) {
            const newCard = gameState.deck.pop();
            if (newCard) {
                gameState.board.push(newCard);
            }
        }

        gameState.scores[playerId] = (gameState.scores[playerId] || 0) + 1;

        gameState.updatedAt = new Date();

        const gameEndResult = this.checkGameEnd(gameState);
        if (gameEndResult.isFinished) {
            gameState.status = "finished";
        }

        gameStates.set(roomId, gameState);

        return {
            success: true,
            message: "Valid SET! Card removed and replaced.",
            newBoard: gameState.board,
            newDeck: gameState.deck,
            score: gameState.scores[playerId],
        };
    }

    checkGameEnd(gameState: GameState): { isFinished: boolean; reason?: string } {
        if (gameState.deck.length === 0) {
            const validSets = findValidSets(gameState.board);
            if (validSets.length === 0) {
                return {
                    isFinished: true,
                    reason: "No valid SETs remaining and deck is empty",
                };
            }
        }

        if (gameState.board.length === 0) {
            return {
                isFinished: true,
                reason: "All cards have been removed from the board",
            };
        }

        return { isFinished: false };
    }

    getValidSetsOnBoard(roomId: string): Card[][] {
        const gameState = gameStates.get(roomId);
        if (!gameState) {
            return [];
        }
        return findValidSets(gameState.board);
    }
}
