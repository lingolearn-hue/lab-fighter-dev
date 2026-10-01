import type { Character } from "../../core/character/Character";

export interface MatchEvents {
  onRoundStarted?: (roundNumber: number) => void;
  onRoundEnded?: (winner: Character | null) => void;
  onMatchEnded?: (winner: Character | null) => void;
  onTimerUpdated?: (secondsLeft: number) => void;
}

export class MatchManager {
  roundsToWin = 2;
  roundTimeSeconds = 99;

  playerA: Character;
  playerB: Character;
  winsA = 0;
  winsB = 0;
  roundNumber = 0;
  timeLeft = 0;
  roundActive = false;
  matchOver = false;

  private events: MatchEvents;

  constructor(playerA: Character, playerB: Character, events: MatchEvents = {}) {
    this.events = events;
    this.playerA = playerA;
    this.playerB = playerB;
    playerA.opponent = playerB;
    playerB.opponent = playerA;
    playerA.events.onDefeated = () => this.onDefeated(playerA);
    playerB.events.onDefeated = () => this.onDefeated(playerB);
  }

  startRound(spawnA: { x: number; y: number }, spawnB: { x: number; y: number }): void {
    this.roundNumber += 1;
    this.timeLeft = this.roundTimeSeconds;
    this.roundActive = true;
    this.playerA.reset(spawnA.x, spawnA.y, true);
    this.playerB.reset(spawnB.x, spawnB.y, false);
    this.events.onRoundStarted?.(this.roundNumber);
  }

  update(dt: number): void {
    if (!this.roundActive) return;
    this.timeLeft -= dt;
    this.events.onTimerUpdated?.(Math.ceil(this.timeLeft));
    if (this.timeLeft <= 0) this.endRoundByTimeout();
  }

  private endRoundByTimeout(): void {
    let winner: Character | null = null;
    if (this.playerA.health > this.playerB.health) winner = this.playerA;
    else if (this.playerB.health > this.playerA.health) winner = this.playerB;
    this.finishRound(winner);
  }

  private onDefeated(loser: Character): void {
    if (!this.roundActive) return;
    const winner = loser === this.playerA ? this.playerB : this.playerA;
    this.finishRound(winner);
  }

  private finishRound(winner: Character | null): void {
    this.roundActive = false;
    if (winner === this.playerA) this.winsA += 1;
    else if (winner === this.playerB) this.winsB += 1;
    this.events.onRoundEnded?.(winner);

    if (this.winsA >= this.roundsToWin || this.winsB >= this.roundsToWin) {
      this.matchOver = true;
      this.events.onMatchEnded?.(winner);
    }
  }
}
