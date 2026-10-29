import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus } from '../../../core/models';
import { fadeAnimation } from '../../../shared/animations/animations';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  animations: [fadeAnimation],
  template: `
    <div @fadeAnimation class="min-h-screen bg-slate-50 dark:bg-slate-900 py-10 px-4">
      <div class="max-w-3xl mx-auto">
        <h1 class="text-3xl font-extrabold text-slate-800 dark:text-white mb-8">My Orders</h1>

        @if (isLoading()) {
          <div class="space-y-4">
            @for (i of skeletons; track $index) {
              <div class="h-28 rounded-2xl bg-white dark:bg-slate-800 animate-pulse border border-slate-100 dark:border-slate-700"></div>
            }
          </div>
        } @else if (orders().length === 0) {
          <div class="text-center py-20">
            <img src="/assets/illustrations/empty-orders.svg" alt="No Orders" class="w-48 h-36 mx-auto mb-2">
            <h2 class="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">No orders yet</h2>
            <p class="text-slate-400 text-sm mb-6">Your order history will appear here.</p>
            <a routerLink="/" class="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors">
              Order Food Now
            </a>
          </div>
        } @else {
          <div class="space-y-4">
            @for (order of orders(); track order.id) {
              <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-all">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span [class]="getStatusBadgeClass(order.status)" class="px-2.5 py-1 text-xs font-bold rounded-full">
                        {{ formatStatus(order.status) }}
                      </span>
                      <span class="text-xs text-slate-400">{{ formatDate(order.createdAt) }}</span>
                    </div>
                    <p class="font-bold text-slate-800 dark:text-white">Order #{{ order.id.substring(0, 8).toUpperCase() }}</p>
                    <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {{ order.items.length }} item{{ order.items.length !== 1 ? 's' : '' }} · \${{ formatTotal(order.totalAmount) }}
                    </p>
                  </div>
                  <a [routerLink]="['/orders', order.id, 'tracking']"
                    class="flex-shrink-0 px-4 py-2 text-sm font-bold border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-xl transition-all">
                    Track
                  </a>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class OrdersComponent implements OnInit {
  private readonly orderService = inject(OrderService);

  readonly orders = signal<Order[]>([]);
  readonly isLoading = signal(true);
  readonly skeletons = Array(4).fill(null);

  ngOnInit(): void {
    this.orderService.getAll().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  formatTotal(amount: any): string {
    return Number(amount || 0).toFixed(2);
  }

  getStatusBadgeClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.DELIVERED: return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case OrderStatus.CANCELLED: return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case OrderStatus.OUT_FOR_DELIVERY:
      case OrderStatus.PICKED_UP: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case OrderStatus.PREPARING: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
  }

  formatStatus(status: OrderStatus): string {
    return status.replace(/_/g, ' ');
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
