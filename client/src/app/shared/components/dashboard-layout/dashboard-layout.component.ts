import { Component, Input, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { CartService } from '../../../core/services/cart.service';
import { Role } from '../../../core/models';

export interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: number;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="flex h-screen bg-slate-100 dark:bg-slate-950 overflow-hidden">

      <!-- ─── Sidebar ─── -->
      <aside
        class="flex flex-col w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300"
        [class.w-64]="!collapsed()"
        [class.w-16]="collapsed()">

        <!-- Logo / Brand -->
        <div class="flex items-center gap-3 px-4 py-5 border-b border-slate-100 dark:border-slate-800">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white text-lg font-extrabold flex-shrink-0 shadow-md">
            🍔
          </div>
          @if (!collapsed()) {
            <div class="min-w-0">
              <span class="font-extrabold text-slate-800 dark:text-white text-lg leading-tight">FoodRush</span>
              <p class="text-[11px] text-slate-400 dark:text-slate-500 truncate">{{ roleLabel() }}</p>
            </div>
          }
        </div>

        <!-- Nav Items -->
        <nav class="flex-1 overflow-y-auto py-4 space-y-0.5 px-2">
          @for (item of navItems(); track item.route) {
            <a [routerLink]="item.route" routerLinkActive="bg-primary/10 text-primary dark:text-primary border-r-2 border-primary"
               [routerLinkActiveOptions]="{ exact: item.route === dashboardHome() }"
               class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-all group relative font-medium text-sm">
              <span class="text-xl flex-shrink-0 w-6 text-center">{{ item.icon }}</span>
              @if (!collapsed()) {
                <span class="truncate">{{ item.label }}</span>
                @if (item.badge && item.badge > 0) {
                  <span class="ml-auto px-1.5 py-0.5 text-[10px] font-extrabold rounded-full bg-primary text-white min-w-[18px] text-center">
                    {{ item.badge > 99 ? '99+' : item.badge }}
                  </span>
                }
              } @else {
                @if (item.badge && item.badge > 0) {
                  <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary"></span>
                }
              }
            </a>
          }
        </nav>

        <!-- User Profile + Logout -->
        <div class="px-2 pb-4 border-t border-slate-100 dark:border-slate-800 pt-3 space-y-1">
          <!-- Profile row -->
          @if (!collapsed()) {
            <div class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0">
                {{ userInitials() }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="font-bold text-slate-800 dark:text-white text-xs truncate">{{ authService.currentUser()?.fullName }}</p>
                <p class="text-[11px] text-slate-400 truncate">{{ authService.currentUser()?.email }}</p>
              </div>
            </div>
          }
          <!-- Theme Toggle -->
          <button (click)="themeService.toggleTheme()"
            class="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm font-medium">
            <span class="text-lg flex-shrink-0 w-6 text-center">{{ themeService.isDark() ? '☀️' : '🌙' }}</span>
            @if (!collapsed()) { <span>{{ themeService.isDark() ? 'Light Mode' : 'Dark Mode' }}</span> }
          </button>
          <!-- Logout -->
          <button (click)="authService.logout()"
            class="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all text-sm font-medium">
            <span class="text-lg flex-shrink-0 w-6 text-center">🚪</span>
            @if (!collapsed()) { <span>Sign Out</span> }
          </button>
          <!-- Collapse toggle -->
          <button (click)="toggleCollapse()"
            class="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm">
            <span class="text-base flex-shrink-0 w-6 text-center">{{ collapsed() ? '→' : '←' }}</span>
            @if (!collapsed()) { <span class="text-xs">Collapse</span> }
          </button>
        </div>
      </aside>

      <!-- ─── Main Area ─── -->
      <div class="flex flex-col flex-1 min-w-0 overflow-hidden">

        <!-- Top Bar -->
        <header class="flex items-center justify-between px-6 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm flex-shrink-0">
          <div>
            <h2 class="text-lg font-extrabold text-slate-800 dark:text-white">{{ pageTitle() }}</h2>
            <p class="text-xs text-slate-400 dark:text-slate-500">{{ pageSubtitle() }}</p>
          </div>

          <div class="flex items-center gap-3">
            <!-- Customer: Cart button -->
            @if (authService.isCustomer()) {
              <button (click)="cartService.toggleDrawer(true)"
                class="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-primary/10 hover:text-primary transition-all text-sm font-semibold">
                <span class="text-base">🛒</span>
                <span class="hidden sm:block">Cart</span>
                @if (cartService.itemCount() > 0) {
                  <span class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-extrabold flex items-center justify-center">
                    {{ cartService.itemCount() }}
                  </span>
                }
              </button>
            }
            <!-- Browse restaurants link for customers -->
            @if (authService.isCustomer()) {
              <a routerLink="/" class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-all shadow-sm">
                <span>🍽️</span><span class="hidden sm:block">Order Food</span>
              </a>
            }
            <!-- User avatar pill -->
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800">
              <div class="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white text-xs font-extrabold">
                {{ userInitials() }}
              </div>
              <span class="text-sm font-semibold text-slate-700 dark:text-slate-200 hidden sm:block">{{ authService.currentUser()?.fullName }}</span>
            </div>
          </div>
        </header>

        <!-- Scrollable Content -->
        <main class="flex-1 overflow-y-auto">
          <ng-content />
        </main>
      </div>
    </div>
  `
})
export class DashboardLayoutComponent {
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);
  readonly cartService = inject(CartService);

  readonly collapsed = signal(false);

  toggleCollapse(): void {
    this.collapsed.update(v => !v);
  }

  readonly userInitials = computed(() => {
    const name = this.authService.currentUser()?.fullName ?? 'U';
    return name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
  });

  readonly roleLabel = computed(() => {
    switch (this.authService.userRole()) {
      case Role.RESTAURANT_OWNER: return 'Restaurant Owner';
      case Role.DELIVERY_DRIVER:  return 'Delivery Driver';
      case Role.ADMIN:            return 'Platform Admin';
      default:                    return 'Customer Account';
    }
  });

  readonly navItems = computed<NavItem[]>(() => {
    const role = this.authService.userRole();
    switch (role) {
      case Role.RESTAURANT_OWNER:
        return [
          { label: 'Dashboard',       route: '/restaurant-dashboard',           icon: '🏠' },
          { label: 'Kitchen Orders',  route: '/restaurant-dashboard/orders',    icon: '🍳', badge: 0 },
          { label: 'Menu Management', route: '/restaurant-dashboard/menu',      icon: '📋' },
          { label: 'Analytics',       route: '/restaurant-dashboard/analytics', icon: '📊' },
          { label: 'My Restaurants',  route: '/restaurant-dashboard/profile',   icon: '🏪' },
        ];
      case Role.DELIVERY_DRIVER:
        return [
          { label: 'Dashboard',          route: '/driver-portal',                   icon: '🏠' },
          { label: 'Available Pickups',  route: '/driver-portal/available',         icon: '⚡', badge: 0 },
          { label: 'My Deliveries',      route: '/driver-portal/active',            icon: '🚀' },
          { label: 'Delivery History',   route: '/driver-portal/history',           icon: '📦' },
          { label: 'Earnings',           route: '/driver-portal/earnings',          icon: '💰' },
        ];
      case Role.ADMIN:
        return [
          { label: 'Dashboard',       route: '/admin',                      icon: '🏠' },
          { label: 'Orders',          route: '/admin/orders',               icon: '📦' },
          { label: 'Restaurants',     route: '/admin/restaurants',          icon: '🍽️' },
          { label: 'Drivers',         route: '/admin/drivers',              icon: '🛵' },
          { label: 'Customers',       route: '/admin/customers',            icon: '👥' },
          { label: 'Coupons',         route: '/admin/coupons',              icon: '🏷️' },
          { label: 'Analytics',       route: '/admin/analytics',            icon: '📊' },
        ];
      default: // CUSTOMER
        return [
          { label: 'My Dashboard',    route: '/customer-dashboard',              icon: '🏠' },
          { label: 'Browse Food',     route: '/',                                icon: '🍽️' },
          { label: 'My Orders',       route: '/customer-dashboard/orders',       icon: '📦' },
          { label: 'Favorites',       route: '/customer-dashboard/favorites',    icon: '❤️' },
          { label: 'Addresses',       route: '/customer-dashboard/addresses',    icon: '📍' },
          { label: 'Profile',         route: '/customer-dashboard/profile',      icon: '👤' },
        ];
    }
  });

  readonly dashboardHome = computed(() => {
    switch (this.authService.userRole()) {
      case Role.RESTAURANT_OWNER: return '/restaurant-dashboard';
      case Role.DELIVERY_DRIVER:  return '/driver-portal';
      case Role.ADMIN:            return '/admin';
      default:                    return '/customer-dashboard';
    }
  });

  readonly pageTitle = computed(() => {
    switch (this.authService.userRole()) {
      case Role.RESTAURANT_OWNER: return 'Restaurant Dashboard';
      case Role.DELIVERY_DRIVER:  return 'Driver Portal';
      case Role.ADMIN:            return 'Admin Control Panel';
      default:                    return 'My Dashboard';
    }
  });

  readonly pageSubtitle = computed(() => {
    const name = this.authService.currentUser()?.fullName ?? '';
    switch (this.authService.userRole()) {
      case Role.RESTAURANT_OWNER: return `Manage your restaurant, ${name}`;
      case Role.DELIVERY_DRIVER:  return `Ready to deliver, ${name}?`;
      case Role.ADMIN:            return `Full platform control, ${name}`;
      default:                    return `Welcome back, ${name}!`;
    }
  });
}
