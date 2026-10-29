import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';
import { Toast } from '../../../core/models';
import { slideInRightAnimation } from '../../animations/animations';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  animations: [slideInRightAnimation],
  template: `
    <div class="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          @slideInRight
          class="pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 shadow-2xl border backdrop-blur-md"
          [class]="getToastClasses(toast)"
          role="alert">
          <div class="flex-shrink-0 mt-0.5">
            @switch (toast.type) {
              @case ('success') { <svg class="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> }
              @case ('error') { <svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg> }
              @case ('warning') { <svg class="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" /></svg> }
              @case ('info') { <svg class="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg> }
            }
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold leading-5" [class]="getTitleClass(toast)">{{ toast.title }}</p>
            <p class="text-sm mt-0.5 leading-5 opacity-80">{{ toast.message }}</p>
          </div>
          <button
            (click)="toastService.dismiss(toast.id)"
            class="flex-shrink-0 ml-1 opacity-50 hover:opacity-100 transition-opacity">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);

  getToastClasses(toast: Toast): string {
    const base = 'transition-all duration-300';
    switch (toast.type) {
      case 'success': return `${base} bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-800`;
      case 'error':   return `${base} bg-white dark:bg-slate-800 border-red-200 dark:border-red-800`;
      case 'warning': return `${base} bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-800`;
      case 'info':    return `${base} bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800`;
      default:        return `${base} bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700`;
    }
  }

  getTitleClass(toast: Toast): string {
    switch (toast.type) {
      case 'success': return 'text-emerald-700 dark:text-emerald-400';
      case 'error':   return 'text-red-700 dark:text-red-400';
      case 'warning': return 'text-amber-700 dark:text-amber-400';
      case 'info':    return 'text-blue-700 dark:text-blue-400';
      default:        return 'text-slate-800 dark:text-slate-100';
    }
  }
}
