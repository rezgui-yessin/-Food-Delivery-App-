import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus } from '../../../core/models';
import { fadeAnimation } from '../../../shared/animations/animations';
import { formatDateTime, formatMoney, isActiveOrder, shortOrderId, statusBadgeClass } from '../../../core/utils/order-helpers';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, EmptyStateComponent, StatusBadgeComponent],
  animations: [fadeAnimation],
  template: `
    <div @fadeAnimation class="p-6 max-w-7xl mx-auto space-y-8">
      <div class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
        <p class="text-sm text-slate-500">Welcome back</p>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ authService.currentUser()?.fullName }}</h1>
        <p class="text-sm text-slate-500 mt-2">Order from nearby restaurants and track deliveries from this account.</p>
        <a routerLink="/" class="inline-flex mt-4 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover">Browse restaurants</a>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        @for (kpi of kpiCards(); track kpi.label) {
          <div class="dash-card p-5">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ kpi.label }}</p>
            <p class="text-2xl font-bold text-slate-800 dark:text-white mt-1">{{ kpi.value }}</p>
          </div>
        }
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div class="xl:col-span-2 dash-card overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 class="font-semibold text-slate-800 dark:text-white">Recent orders</h2>
            <a routerLink="/customer/orders" class="text-xs text-primary font-semibold">View all</a>
          </div>
          @if (isLoading()) {
            <div class="p-6 space-y-3">
              @for (i of [1,2,3]; track i) {
                <div class="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
              }
            </div>
          } @else if (recentOrders().length === 0) {
            <app-empty-state title="No orders yet" message="Your order history will appear here." actionLabel="Start ordering" actionLink="/" />
          } @else {
            <div class="divide-y divide-slate-100 dark:divide-slate-800">
              @for (order of recentOrders(); track order.id) {
                <a [routerLink]="['/orders', order.id, 'tracking']" class="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <p class="font-semibold text-sm">#{{ shortOrderId(order.id) }}</p>
                      <app-status-badge [status]="order.status" />
                    </div>
                    <p class="text-xs text-slate-400 mt-1">{{ order.items.length }} items • {{ formatDateTime(order.createdAt) }}</p>
                  </div>
                  <p class="font-semibold text-sm">{{ formatMoney(order.totalAmount) }}</p>
                </a>
              }
            </div>
          }
        </div>

        <div class="space-y-5">
          <div class="dash-card p-5">
            <h2 class="font-semibold mb-4">Quick actions</h2>
            <div class="space-y-2">
              <a routerLink="/" class="block p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/40 text-sm font-medium">Browse restaurants</a>
              <a routerLink="/customer/orders" class="block p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/40 text-sm font-medium">Order history</a>
              <a routerLink="/customer/profile" class="block p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/40 text-sm font-medium">Account</a>
            </div>
          </div>
          <div class="dash-card p-5">
            <h2 class="font-semibold mb-3">Cuisines</h2>
            <div class="grid grid-cols-2 gap-2">
              @for (c of cuisines; track c) {
                <a [routerLink]="['/']" [queryParams]="{ cuisine: c }" class="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-sm text-center hover:border-primary/40">{{ c }}</a>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CustomerDashboardComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly orderService = inject(OrderService);

  readonly isLoading = signal(true);
  readonly orders = signal<Order[]>([]);
  readonly recentOrders = computed(() => this.orders().slice(0, 5));
  readonly formatDateTime = formatDateTime;
  readonly formatMoney = formatMoney;
  readonly shortOrderId = shortOrderId;
  readonly statusBadgeClass = statusBadgeClass;

  readonly kpiCards = computed(() => {
    const os = this.orders();
    return [
      { label: 'Total orders', value: os.length },
      { label: 'Total spent', value: formatMoney(os.reduce((s, o) => s + o.totalAmount, 0)) },
      { label: 'Delivered', value: os.filter(o => o.status === OrderStatus.DELIVERED).length },
      { label: 'Active', value: os.filter(o => isActiveOrder(o.status)).length }
    ];
  });

  readonly cuisines = ['Pizza', 'Burgers', 'Sushi', 'Healthy', 'Desserts', 'Asian'];

  ngOnInit(): void {
    this.orderService.getMyOrders().subscribe({
      next: data => { this.orders.set(data); this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
    });
  }
}
