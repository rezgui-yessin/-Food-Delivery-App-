import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { backdropFadeAnimation, modalScaleAnimation } from '../../animations/animations';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  animations: [backdropFadeAnimation, modalScaleAnimation],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
        <div
          @backdropFadeAnimation
          (click)="onBackdropClick()"
          class="absolute inset-0 bg-black/60 backdrop-blur-sm">
        </div>
        <div
          @modalScaleAnimation
          class="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-10">
          @if (title) {
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <h2 class="text-lg font-bold text-slate-800 dark:text-slate-100">{{ title }}</h2>
              <button
                (click)="close.emit()"
                class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-700">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          }
          <div class="px-6 py-5">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    }
  `
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() closeOnBackdrop = true;
  @Output() close = new EventEmitter<void>();

  onBackdropClick(): void {
    if (this.closeOnBackdrop) {
      this.close.emit();
    }
  }
}
