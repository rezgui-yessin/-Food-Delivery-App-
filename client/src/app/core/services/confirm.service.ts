import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  readonly open = signal(false);
  readonly options = signal<ConfirmOptions | null>(null);
  private resolver: ((value: boolean) => void) | null = null;

  ask(options: ConfirmOptions): Promise<boolean> {
    this.options.set(options);
    this.open.set(true);
    return new Promise(resolve => {
      this.resolver = resolve;
    });
  }

  resolve(value: boolean): void {
    this.open.set(false);
    this.options.set(null);
    this.resolver?.(value);
    this.resolver = null;
  }
}
