import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService } from '../../../core/services/confirm.service';
import { backdropFadeAnimation, modalScaleAnimation } from '../../animations/animations';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  animations: [backdropFadeAnimation, modalScaleAnimation],
  template: `
    @if (confirm.open()) {
      <div class="fixed inset-0 z-[80] flex items-center justify-center p-4">
        <div @backdropFadeAnimation class="absolute inset-0 bg-slate-950/50" (click)="confirm.resolve(false)"></div>
        <div @modalScaleAnimation class="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">{{ confirm.options()?.title }}</h2>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">{{ confirm.options()?.message }}</p>
          <div class="mt-6 flex justify-end gap-2">
            <button type="button" (click)="confirm.resolve(false)"
              class="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
              {{ confirm.options()?.cancelLabel || 'Cancel' }}
            </button>
            <button type="button" (click)="confirm.resolve(true)"
              class="px-4 py-2 text-sm font-semibold rounded-xl text-white"
              [class]="confirm.options()?.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary-hover'">
              {{ confirm.options()?.confirmLabel || 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmDialogComponent {
  readonly confirm = inject(ConfirmService);
}
