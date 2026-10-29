import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ThemeService } from '../../../core/services/theme.service';
import { Role } from '../../../core/models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="sticky top-0 z-30 glass-panel border-b border-slate-200/60 dark:border-slate-800/60 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">

          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-2.5 group">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span class="text-white text-lg">🍔</span>
            </div>
            <span class="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              Food<span class="text-primary">Rush</span>
            </span>
          </a>

          <!-- Center Nav Links (desktop) -->
          <div class="hidden md:flex items-center gap-1">
            <a routerLink="/" routerLinkActive="text-primary font-bold"
               [routerLinkActiveOptions]="{exact: true}"
               class="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary hover:bg-primary/5 transition-all">
              Restaurants
            </a>
            @if (authService.isRestaurantOwner()) {
              <a routerLink="/restaurant-dashboard" routerLinkActive="text-primary font-bold"
                 class="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-primary/5 transition-all">
                Dashboard
              </a>
            }
            @if (authService.isDeliveryDriver()) {
              <a routerLink="/driver-portal" routerLinkActive="text-primary font-bold"
                 class="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-primary/5 transition-all">
                Driver Portal
              </a>
            }
            @if (authService.isAdmin()) {
              <a routerLink="/admin" routerLinkActive="text-primary font-bold"
                 class="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-primary/5 transition-all">
                Admin
              </a>
            }
            @if (authService.isAuthenticated()) {
              <a routerLink="/orders" routerLinkActive="text-primary font-bold"
                 class="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-primary/5 transition-all">
                My Orders
              </a>
            }
          </div>

          <!-- Right Section -->
          <div class="flex items-center gap-2">
            <!-- Theme Toggle -->
            <button
              (click)="themeService.toggleTheme()"
              class="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              @if (themeService.isDark()) {
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
              } @else {
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
              }
            </button>

            <!-- Cart Button -->
            @if (!authService.isAuthenticated() || authService.isCustomer()) {
              <button
                (click)="cartService.toggleDrawer()"
                class="relative p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-primary/5 transition-all">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
                @if (cartService.itemCount() > 0) {
                  <span class="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-bounce-short shadow">
                    {{ cartService.itemCount() }}
                  </span>
                }
              </button>
            }

            <!-- Auth Section -->
            @if (authService.isAuthenticated()) {
              <div class="flex items-center gap-2">
                <div class="hidden sm:flex flex-col items-end">
                  <span class="text-xs font-semibold text-slate-800 dark:text-white leading-tight">
                    {{ getFirstName() }}
                  </span>
                  <span class="text-[10px] text-primary font-medium uppercase tracking-wide">
                    {{ getRoleLabel() }}
                  </span>
                </div>
                <button
                  (click)="authService.logout()"
                  class="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                  Sign Out
                </button>
              </div>
            } @else {
              <div class="flex items-center gap-2">
                <a routerLink="/login"
                   class="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary transition-colors rounded-xl hover:bg-primary/5">
                  Sign In
                </a>
                <a routerLink="/register"
                   class="px-4 py-2 text-sm font-bold bg-primary hover:bg-primary-hover text-white rounded-xl transition-colors shadow-sm shadow-primary/30">
                  Sign Up
                </a>
              </div>
            }
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  readonly authService = inject(AuthService);
  readonly cartService = inject(CartService);
  readonly themeService = inject(ThemeService);

  getFirstName(): string {
    const fullName = this.authService.currentUser()?.fullName;
    return fullName ? fullName.split(' ')[0] : 'User';
  }

  getRoleLabel(): string {
    const role = this.authService.currentUser()?.role;
    return role ? role.replace('_', ' ') : '';
  }
}
