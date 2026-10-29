import { Component } from '@angular/core';

@Component({
  selector: 'app-skeleton-restaurant-card',
  standalone: true,
  template: `
    <div class="rounded-2xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 animate-pulse">
      <div class="h-48 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-shimmer"></div>
      <div class="p-4 space-y-3">
        <div class="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4"></div>
        <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/2"></div>
        <div class="flex gap-2 pt-1">
          <div class="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
          <div class="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        </div>
      </div>
    </div>
  `
})
export class SkeletonRestaurantCardComponent {}

@Component({
  selector: 'app-skeleton-menu-item',
  standalone: true,
  template: `
    <div class="flex gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 animate-pulse">
      <div class="h-20 w-20 flex-shrink-0 rounded-xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700"></div>
      <div class="flex-1 space-y-2">
        <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
        <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
        <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-4/5"></div>
        <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mt-1"></div>
      </div>
    </div>
  `
})
export class SkeletonMenuItemComponent {}
