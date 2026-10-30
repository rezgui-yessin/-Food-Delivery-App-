import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { CartService } from '../../../core/services/cart.service';
import { Role } from '../../../core/models';
import { getDashboardRoute } from '../../../core/utils/role-redirect';

interface NavItem {
  label: string;
  route: string;
  exact?: boolean;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="flex h-[100dvh] bg-slate-100 dark:bg-slate-950 overflow-hidden">
      @if (mobileOpen()) {
        <div class="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" (click)="mobileOpen.set(false)"></div>
      }

      <aside
        class="dash-sidebar z-50 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800"
        [class.collapsed]="collapsed() && !mobileOpen()"
        [class.mobile-open]="mobileOpen()">

        <div class="flex items-center gap-3 px-4 py-5 border-b border-slate-100 dark:border-slate-800">
          <div class="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">F</div>
          @if (!collapsed() || mobileOpen()) {
            <div class="min-w-0">
              <span class="font-bold text-slate-800 dark:text-white leading-tight block">FoodRush</span>
              <p class="text-[11px] text-slate-400 truncate">{{ roleLabel() }}</p>
            </div>
          }
        </div>

        <nav class="flex-1 overflow-y-auto py-4 space-y-1 px-2">
          @for (item of navItems(); track item.route) {
            <a [routerLink]="item.route"
               routerLinkActive="bg-primary/10 text-primary"
               [routerLinkActiveOptions]="{ exact: !!item.exact }"
               (click)="mobileOpen.set(false)"
               class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white text-sm font-medium">
              <span class="truncate">{{ item.label }}</span>
            </a>
          }
        </nav>

        <div class="px-2 pb-4 border-t border-slate-100 dark:border-slate-800 pt-3 space-y-1">
          @if (!collapsed() || mobileOpen()) {
            <div class="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <p class="font-semibold text-slate-800 dark:text-white text-xs truncate">{{ authService.currentUser()?.fullName }}</p>
              <p class="text-[11px] text-slate-400 truncate">{{ authService.currentUser()?.email }}</p>
            </div>
          }
          <button (click)="themeService.toggleTheme()"
            class="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm">
            {{ themeService.isDark() ? 'Light mode' : 'Dark mode' }}
          </button>
          <button (click)="authService.logout()"
            class="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-sm">
            Sign out
          </button>
          <button (click)="toggleCollapsed()" class="hidden lg:flex items-center w-full px-3 py-2 rounded-xl text-slate-400 text-xs">
            {{ collapsed() ? 'Expand' : 'Collapse' }}
          </button>
        </div>
      </aside>

      <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header class="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div class="min-w-0">
            <button (click)="mobileOpen.set(true)" aria-label="Open navigation menu" class="lg:hidden mr-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium">☰</button>
            <p class="text-[11px] text-slate-400 truncate">{{ breadcrumbs() }}</p>
            <h2 class="text-lg font-semibold text-slate-800 dark:text-white truncate">{{ pageTitle() }}</h2>
          </div>
          <div class="flex items-center gap-2">
            @if (authService.isCustomer()) {
              <button (click)="cartService.toggleDrawer(true)"
                class="relative px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-medium">
                Cart
                @if (cartService.itemCount() > 0) {
                  <span class="ml-1 text-primary font-bold">{{ cartService.itemCount() }}</span>
                }
              </button>
              <a routerLink="/" class="px-3 py-2 rounded-xl bg-primary text-white text-sm font-semibold">Order food</a>
            }
          </div>
        </header>
        <main class="flex-1 overflow-y-auto">
          <ng-content></ng-content>
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class DashboardLayoutComponent {
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);
  readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  readonly collapsed = signal(false);
  readonly mobileOpen = signal(false);

  toggleCollapsed(): void {
    this.collapsed.update(value => !value);
  }

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  readonly roleLabel = computed(() => {
    switch (this.authService.userRole()) {
      case Role.RESTAURANT_OWNER: return 'Restaurant owner';
      case Role.DELIVERY_DRIVER: return 'Delivery driver';
      case Role.ADMIN: return 'Platform admin';
      default: return 'Customer';
    }
  });

  readonly navItems = computed<NavItem[]>(() => {
    switch (this.authService.userRole()) {
      case Role.RESTAURANT_OWNER:
        return [
          { label: 'Overview', route: '/restaurant', exact: true },
          { label: 'Kitchen Orders', route: '/restaurant/orders' },
          { label: 'Menu Catalog', route: '/restaurant/menu' },
          { label: 'Categories', route: '/restaurant/categories' },
          { label: 'Coupons', route: '/restaurant/coupons' },
          { label: 'Analytics', route: '/restaurant/analytics' },
          { label: 'Store Settings', route: '/restaurant/settings' }
        ];
      case Role.DELIVERY_DRIVER:
        return [
          { label: 'Overview', route: '/driver', exact: true },
          { label: 'Available pickups', route: '/driver/available' },
          { label: 'Active deliveries', route: '/driver/active' },
          { label: 'Delivery History', route: '/driver/history' },
          { label: 'Earnings & Payouts', route: '/driver/earnings' }
        ];
      case Role.ADMIN:
        return [
          { label: 'Overview', route: '/admin', exact: true },
          { label: 'Users & Couriers', route: '/admin/users' },
          { label: 'Restaurants', route: '/admin/restaurants' },
          { label: 'Orders & Refunds', route: '/admin/orders' },
          { label: 'Promo Coupons', route: '/admin/coupons' },
          { label: 'Platform Settings', route: '/admin/settings' },
          { label: 'Audit Logs', route: '/admin/logs' }
        ];
      default:
        return [
          { label: 'Overview', route: '/customer', exact: true },
          { label: 'Browse food', route: '/' },
          { label: 'My orders', route: '/customer/orders' },
          { label: 'Profile', route: '/customer/profile' }
        ];
    }
  });

  readonly pageTitle = computed(() => {
    const path = this.url();
    const item = this.navItems().find(i => i.exact ? path === i.route : path.startsWith(i.route));
    return item?.label || 'Dashboard';
  });

  readonly breadcrumbs = computed(() => {
    const home = getDashboardRoute(this.authService.userRole());
    const title = this.pageTitle();
    return title === 'Overview' ? 'Dashboard' : `Dashboard / ${title}`;
  });
}
