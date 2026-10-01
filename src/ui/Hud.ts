export class Hud {
  private healthA: HTMLDivElement;
  private healthB: HTMLDivElement;
  private timerLabel: HTMLDivElement;
  private roundLabel: HTMLDivElement;
  private messageLabel: HTMLDivElement;

  constructor(root: HTMLElement) {
    root.innerHTML = `
      <div class="hud-bar hud-bar-a"><div class="hud-bar-fill"></div></div>
      <div class="hud-bar hud-bar-b"><div class="hud-bar-fill"></div></div>
      <div class="hud-round"></div>
      <div class="hud-timer">99</div>
      <div class="hud-message"></div>
    `;
    this.healthA = root.querySelector(".hud-bar-a .hud-bar-fill")!;
    this.healthB = root.querySelector(".hud-bar-b .hud-bar-fill")!;
    this.timerLabel = root.querySelector(".hud-timer")!;
    this.roundLabel = root.querySelector(".hud-round")!;
    this.messageLabel = root.querySelector(".hud-message")!;
  }

  setHealth(side: "a" | "b", current: number, max: number): void {
    const pct = Math.max(0, (current / max) * 100);
    (side === "a" ? this.healthA : this.healthB).style.width = `${pct}%`;
  }

  setTimer(seconds: number): void {
    this.timerLabel.textContent = String(Math.max(0, seconds));
  }

  setRound(round: number): void {
    this.roundLabel.textContent = `Round ${round}`;
    this.messageLabel.textContent = "";
  }

  setMessage(text: string): void {
    this.messageLabel.textContent = text;
  }
}
