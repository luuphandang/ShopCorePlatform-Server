import { Injectable, OnApplicationShutdown } from '@nestjs/common';

@Injectable()
export class ShutdownState implements OnApplicationShutdown {
  private shuttingDown = false;
  private signal: string | undefined;

  isShuttingDown(): boolean {
    return this.shuttingDown;
  }

  getSignal(): string | undefined {
    return this.signal;
  }

  onApplicationShutdown(signal?: string): void {
    this.shuttingDown = true;
    this.signal = signal;
  }
}
