import { Server as SocketIOServer } from "socket.io";
import { MatchRepository } from "../repositories/MatchRepository";
import { EventLogService } from "./EventLogService";

interface TimerInfo {
    matchId: string;
    roomId: string;
    duration: number;
    startedAt: Date;
    intervalId: NodeJS.Timeout | null;
}

type TimerEndCallback = (roomId: string, matchId: string) => Promise<void>;

export class TimerService {
    private timers: Map<string, TimerInfo> = new Map();
    private io: SocketIOServer | null = null;
    private matchRepo: MatchRepository;
    private eventLogService: EventLogService;
    private onTimerEndCallback: TimerEndCallback | null = null;

    constructor() {
        this.matchRepo = new MatchRepository();
        this.eventLogService = new EventLogService();
    }

    setOnTimerEnd(callback: TimerEndCallback) {
        this.onTimerEndCallback = callback;
    }

    setIO(io: SocketIOServer) {
        this.io = io;
    }

    async startTimer(roomId: string, matchId: string, durationSeconds: number): Promise<void> {
        this.stopTimer(roomId);

        const startedAt = new Date();
        const timerInfo: TimerInfo = {
            matchId,
            roomId,
            duration: durationSeconds,
            startedAt,
            intervalId: null,
        };

        try {
            await this.matchRepo.updateStatus(matchId, "in_progress", undefined);
        } catch (err) {
            console.error("Error updating match timer:", err);
        }

        if (this.io) {
            this.io.to(roomId).emit("timer:start", {
                roomId,
                matchId,
                duration: durationSeconds,
                startedAt: startedAt.toISOString(),
            });
        }
        
        // Log timer start event
        this.eventLogService.logTimerEvent(roomId, matchId, "timer_started", durationSeconds).catch(err => {
            console.error("Error logging timer start:", err);
        });

        timerInfo.intervalId = setInterval(() => {
            this.broadcastTimerUpdate(roomId, timerInfo);
        }, 1000);

        this.timers.set(roomId, timerInfo);

        this.broadcastTimerUpdate(roomId, timerInfo);
    }

    stopTimer(roomId: string): void {
        const timerInfo = this.timers.get(roomId);
        if (timerInfo && timerInfo.intervalId) {
            clearInterval(timerInfo.intervalId);
            timerInfo.intervalId = null;
        }
        this.timers.delete(roomId);
    }

    getRemainingTime(roomId: string): number | null {
        const timerInfo = this.timers.get(roomId);
        if (!timerInfo) {
            return null;
        }

        const elapsed = Math.floor((Date.now() - timerInfo.startedAt.getTime()) / 1000);
        const remaining = Math.max(0, timerInfo.duration - elapsed);
        return remaining;
    }

    calculateRemainingTime(matchId: string, durationSeconds: number, startedAt: Date): number {
        const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);
        const remaining = Math.max(0, durationSeconds - elapsed);
        return remaining;
    }

    private broadcastTimerUpdate(roomId: string, timerInfo: TimerInfo): void {
        if (!this.io) return;

        const remaining = this.getRemainingTime(roomId);
        
        if (remaining === null) {
            return;
        }

        if (remaining <= 0) {
            this.io.to(roomId).emit("timer:end", {
                roomId,
                matchId: timerInfo.matchId,
            });
            
            // Log timer end event
            this.eventLogService.logTimerEvent(roomId, timerInfo.matchId, "timer_ended", timerInfo.duration).catch(err => {
                console.error("Error logging timer end:", err);
            });
            
            if (this.onTimerEndCallback) {
                this.onTimerEndCallback(roomId, timerInfo.matchId).catch(err => {
                    console.error("Error in timer end callback:", err);
                });
            }
            
            this.stopTimer(roomId);
        } else {
            this.io.to(roomId).emit("timer:update", {
                roomId,
                matchId: timerInfo.matchId,
                remaining,
                total: timerInfo.duration,
            });
        }
    }

    async resumeTimer(roomId: string, matchId: string, durationSeconds: number, startedAt: Date): Promise<void> {
        const remaining = this.calculateRemainingTime(matchId, durationSeconds, startedAt);
        
        if (remaining <= 0) {
            if (this.io) {
                this.io.to(roomId).emit("timer:end", {
                    roomId,
                    matchId,
                });
            }
            return;
        }

        const timerInfo: TimerInfo = {
            matchId,
            roomId,
            duration: remaining,
            startedAt: new Date(),
            intervalId: null,
        };

        if (this.io) {
            this.io.to(roomId).emit("timer:start", {
                roomId,
                matchId,
                duration: remaining,
                startedAt: timerInfo.startedAt.toISOString(),
            });
        }

        timerInfo.intervalId = setInterval(() => {
            this.broadcastTimerUpdate(roomId, timerInfo);
        }, 1000);

        this.timers.set(roomId, timerInfo);

        this.broadcastTimerUpdate(roomId, timerInfo);
    }

    getTimerInfo(roomId: string): TimerInfo | null {
        return this.timers.get(roomId) || null;
    }
}

