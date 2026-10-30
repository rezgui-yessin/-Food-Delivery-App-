import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <p class="text-sm font-semibold text-primary">404</p>
      <h1 class="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Page not found</h1>
      <p class="mt-2 text-slate-500">The page you requested does not exist.</p>
      <a routerLink="/" class="mt-6 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold">Back to restaurants</a>
    </div>
  `
})
export class NotFoundComponent {}
