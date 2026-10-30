import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConnectivityService {
  readonly online = signal(typeof navigator === 'undefined' ? true : navigator.onLine);
  readonly installable = signal(false);
  private deferredPrompt: Event | null = null;

  constructor() {
    window.addEventListener('online', () => this.online.set(true));
    window.addEventListener('offline', () => this.online.set(false));
    window.addEventListener('beforeinstallprompt', event => {
      event.preventDefault();
      this.deferredPrompt = event;
      this.installable.set(true);
    });
  }

  async install(): Promise<void> {
    const prompt = this.deferredPrompt as (Event & { prompt?: () => Promise<void> }) | null;
    if (!prompt?.prompt) return;
    await prompt.prompt();
    this.deferredPrompt = null;
    this.installable.set(false);
  }
}
