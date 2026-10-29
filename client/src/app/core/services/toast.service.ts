import { Injectable, signal } from '@angular/core';
import { Toast } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly toastsSignal = signal<Toast[]>([]);
  readonly toasts = this.toastsSignal.asReadonly();

  success(title: string, message: string, duration = 4000): void {
    this.addToast('success', title, message, duration);
  }

  error(title: string, message: string, duration = 6000): void {
    this.addToast('error', title, message, duration);
  }

  warning(title: string, message: string, duration = 5000): void {
    this.addToast('warning', title, message, duration);
  }

  info(title: string, message: string, duration = 4000): void {
    this.addToast('info', title, message, duration);
  }

  private addToast(type: Toast['type'], title: string, message: string, duration: number): void {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: Toast = { id, type, title, message, duration };
    this.toastsSignal.update(toasts => [...toasts, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
  }

  dismiss(id: string): void {
    this.toastsSignal.update(toasts => toasts.filter(t => t.id !== id));
  }
}

