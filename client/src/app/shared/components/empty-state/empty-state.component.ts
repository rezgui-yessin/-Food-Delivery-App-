import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="flex flex-col items-center justify-center text-center py-16 px-6">
      @if (image) {
        <img [src]="image" [alt]="title" class="w-40 h-32 mb-4 opacity-80">
      }
      <h3 class="text-lg font-semibold text-slate-800 dark:text-white">{{ title }}</h3>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">{{ message }}</p>
      @if (actionLabel && actionLink) {
        <a [routerLink]="actionLink" class="mt-5 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover">
          {{ actionLabel }}
        </a>
      }
    </div>
  `
})
export class EmptyStateComponent {
  @Input() title = 'Nothing here yet';
  @Input() message = '';
  @Input() image?: string;
  @Input() actionLabel?: string;
  @Input() actionLink?: string;
}
