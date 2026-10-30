import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardLayoutComponent } from '../../../shared/components/dashboard-layout/dashboard-layout.component';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus } from '../../../core/models';
import { fadeAnimation } from '../../../shared/animations/animations';

@Component({
  selector: 'app-customer-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, DashboardLayoutComponent],
  animations: [fadeAnimation],
  template: `
    <app-dashboard-layout>
      <div @fadeAnimation class="p-6 max-w-5xl mx-auto">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-extrabold text-slate-800 dark:text-white">My Orders</h1>
            <p class="text-sm text-slate-400 mt-0.5">Full order history and live tracking</p>
          </div>
          <a routerLink="/" class="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-hover transition-colors flex items-center gap-2">
            <span>+</span> New Order
          </a>
        </div>

        <!-- Filter tabs -->
        <div class="flex gap-2 mb-6 overflow-x-auto pb-1">
          @for (tab of tabs; track tab.value) {
            <button (click)="activeTab.set(tab.value)"
              class="px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex-shrink-0"
              [class]="activeTab() === tab.value
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-primary/40'">
              {{ tab.label }} <span class="opacity-70">({{ countByTab(tab.value) }})</span>
            </button>
          }
        </div>

        @if (isLoading()) {
          <div class="space-y-4">
            @for (i of [1,2,3,4]; track i) {
              <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 animate-pulse flex gap-4">
                <div class="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0"></div>
                <div class="flex-1 space-y-2.5 pt-1">
                  <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                  <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                  <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                </div>
              </div>
            }
          </div>
        } @else if (filteredOrders().length === 0) {
          <div class="flex flex-col items-center justify-center py-20 text-center">
            <img src="/assets/illustrations/empty-orders.svg" alt="No orders" class="w-48 h-36 mb-5 opacity-80">
            <p class="text-lg font-bold text-slate-700 dark:text-slate-300">No orders found</p>
            <p class="text-sm text-slate-400 mt-1">{{ activeTab() === 'all' ? 'You haven\'t placed any orders yet.' : 'No orders in this category.' }}</p>
            <a routerLink="/" class="mt-5 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-hover transition-colors">Browse Restaurants</a>
          </div>
        } @else {
          <div class="space-y-4">
            @for (order of filteredOrders(); track order.id) {
              <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <!-- Header -->
                <div class="flex items-center justify-between px-5 py-3.5 border-b border-slate-50 dark:border-slate-800">
                  <div class="flex items-center gap-3">
                    <span class="text-xl">{{ getStatusIcon(order.status) }}</span>
                    <div>
                      <span class="font-extrabold text-slate-800 dark:text-white text-sm">Order #{{ order.id.substring(0, 8).toUpperCase() }}</span>
                      <span class="ml-2 px-2 py-0.5 text-[10px] font-extrabold rounded-full" [class]="getStatusBadge(order.status)">
                        {{ formatStatus(order.status) }}
                      </span>
                    </div>
                  </div>
                  <span class="font-extrabold text-primary text-base">\${{ order.totalAmount.toFixed(2) }}</span>
                </div>

                <!-- Body -->
                <div class="px-5 py-4">
                  <div class="flex items-start justify-between gap-4">
                    <div class="space-y-1 text-sm text-slate-500 dark:text-slate-400">
                      <p><span class="font-semibold text-slate-700 dark:text-slate-300">Items:</span>
                        {{ getItemsSummary(order) }}
                      </p>
                      <p><span class="font-semibold text-slate-700 dark:text-slate-300">Deliver to:</span> {{ order.deliveryAddress }}</p>
                      <p><span class="font-semibold text-slate-700 dark:text-slate-300">Placed:</span> {{ formatDate(order.createdAt) }}</p>
                      <p><span class="font-semibold text-slate-700 dark:text-slate-300">Payment:</span> {{ formatPaymentMethod(order.paymentMethod) }} — {{ order.paymentStatus }}</p>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="px-5 py-3 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-50 dark:border-slate-800 flex gap-2 flex-wrap">
                  @if (isActive(order.status)) {
                    <a [routerLink]="['/orders', order.id, 'tracking']"
                       class="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-colors flex items-center gap-1.5">
                      🔴 Live Track
                    </a>
                  } @else {
                    <a [routerLink]="['/orders', order.id, 'tracking']"
                       class="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                      View Details
                    </a>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    </app-dashboard-layout>
  `
})
export class CustomerOrdersComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  readonly isLoading = signal(true);
  readonly orders = signal<Order[]>([]);
  readonly activeTab = signal<string>('all');
  readonly OrderStatus = OrderStatus;

  readonly tabs = [
    { label: 'All',       value: 'all' },
    { label: 'Active',    value: 'active' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  filteredOrders() {
    const tab = this.activeTab();
    const list = this.orders();
    if (tab === 'active') return list.filter(o => this.isActive(o.status));
    if (tab === 'delivered') return list.filter(o => o.status === OrderStatus.DELIVERED);
    if (tab === 'cancelled') return list.filter(o => o.status === OrderStatus.CANCELLED);
    return list;
  }

  countByTab(tab: string): number {
    const list = this.orders();
    if (tab === 'active') return list.filter(o => this.isActive(o.status)).length;
    if (tab === 'delivered') return list.filter(o => o.status === OrderStatus.DELIVERED).length;
    if (tab === 'cancelled') return list.filter(o => o.status === OrderStatus.CANCELLED).length;
    return list.length;
  }

  isActive(status: OrderStatus): boolean {
    return [OrderStatus.PLACED, OrderStatus.PENDING, OrderStatus.CONFIRMED,
            OrderStatus.PREPARING, OrderStatus.READY_FOR_PICKUP,
            OrderStatus.PICKED_UP, OrderStatus.OUT_FOR_DELIVERY].includes(status);
  }

  getStatusIcon(status: OrderStatus): string {
    const m: Partial<Record<OrderStatus, string>> = {
      [OrderStatus.PLACED]: '📋', [OrderStatus.PENDING]: '⏳',
      [OrderStatus.CONFIRMED]: '✅', [OrderStatus.PREPARING]: '👨‍🍳',
      [OrderStatus.READY_FOR_PICKUP]: '📦', [OrderStatus.PICKED_UP]: '🤝',
      [OrderStatus.OUT_FOR_DELIVERY]: '🛵', [OrderStatus.DELIVERED]: '🎉',
      [OrderStatus.CANCELLED]: '❌'
    };
    return m[status] ?? '📋';
  }

  getStatusBadge(status: OrderStatus): string {
    if (status === OrderStatus.DELIVERED) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';
    if (status === OrderStatus.CANCELLED) return 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400';
    if (this.isActive(status)) return 'bg-primary/10 text-primary';
    return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
  }

  formatStatus(status: OrderStatus): string {
    return (status || '').replace(/_/g, ' ');
  }

  formatPaymentMethod(method: string): string {
    return (method || '').replace(/_/g, ' ');
  }

  getItemsSummary(order: Order): string {
    return (order.items || []).map(i => `${i.quantity}x ${i.menuItemName}`).join(', ');
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  ngOnInit(): void {
    this.orderService.getMyOrders().subscribe({
      next: (d: Order[]) => { this.orders.set(d); this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
    });
  }
}
