import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardLayoutComponent } from '../../../shared/components/dashboard-layout/dashboard-layout.component';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus } from '../../../core/models';
import { getDishImage } from '../../../core/utils/asset-helpers';
import { fadeAnimation } from '../../../shared/animations/animations';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DashboardLayoutComponent],
  animations: [fadeAnimation],
  template: `
    <app-dashboard-layout>
      <div @fadeAnimation class="p-6 max-w-7xl mx-auto space-y-8">

        <!-- Welcome Banner -->
        <div class="relative overflow-hidden bg-gradient-to-r from-primary via-orange-500 to-amber-400 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-primary/20">
          <div class="absolute inset-0 bg-[url('/assets/images/hero/hero-spread.jpg')] bg-cover bg-center opacity-15 rounded-3xl"></div>
          <div class="relative">
            <p class="text-orange-100 text-sm font-semibold mb-1">Welcome back 👋</p>
            <h1 class="text-2xl sm:text-3xl font-extrabold">{{ authService.currentUser()?.fullName }}</h1>
            <p class="text-orange-100 mt-2 text-sm max-w-md">Hungry? Browse our top restaurants and get fresh food delivered to your door.</p>
            <a routerLink="/" class="inline-flex items-center gap-2 mt-5 px-6 py-3 bg-white text-primary font-extrabold rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 text-sm">
              <span>🍽️</span> Browse Restaurants
            </a>
          </div>
        </div>

        <!-- KPI Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          @for (kpi of kpiCards(); track kpi.label) {
            <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ kpi.label }}</p>
                  <p class="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{{ kpi.value }}</p>
                </div>
                <span class="text-2xl">{{ kpi.icon }}</span>
              </div>
            </div>
          }
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">

          <!-- Recent Orders -->
          <div class="xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 class="font-extrabold text-slate-800 dark:text-white text-base">Recent Orders</h2>
              <a routerLink="/customer-dashboard/orders" class="text-xs text-primary font-bold hover:underline">View All →</a>
            </div>

            <div class="divide-y divide-slate-50 dark:divide-slate-800">
              @if (isLoading()) {
                @for (i of [1,2,3]; track i) {
                  <div class="flex items-center gap-4 px-6 py-4 animate-pulse">
                    <div class="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0"></div>
                    <div class="flex-1 space-y-2">
                      <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                      <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                    </div>
                  </div>
                }
              } @else if (recentOrders().length === 0) {
                <div class="flex flex-col items-center justify-center py-16 text-center px-6">
                  <img src="/assets/illustrations/empty-orders.svg" alt="No orders" class="w-40 h-32 mb-4 opacity-80">
                  <p class="text-slate-600 dark:text-slate-400 font-semibold">No orders yet</p>
                  <p class="text-sm text-slate-400 mt-1">Your order history will appear here.</p>
                  <a routerLink="/" class="mt-4 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-hover transition-colors">Start Ordering</a>
                </div>
              } @else {
                @for (order of recentOrders(); track order.id) {
                  <a [routerLink]="['/orders', order.id, 'tracking']"
                     class="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <!-- Status icon -->
                    <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                      [class]="getOrderStatusBg(order.status)">
                      {{ getOrderStatusIcon(order.status) }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 flex-wrap">
                        <p class="font-bold text-slate-800 dark:text-white text-sm truncate">
                          Order #{{ order.id.substring(0, 8).toUpperCase() }}
                        </p>
                        <span class="px-2 py-0.5 text-[10px] font-extrabold rounded-full"
                          [class]="getStatusBadgeClass(order.status)">
                          {{ formatStatus(order.status) }}
                        </span>
                      </div>
                      <p class="text-xs text-slate-400 mt-0.5 truncate">
                        {{ order.items.length }} item{{ order.items.length > 1 ? 's' : '' }} • {{ formatDate(order.createdAt) }}
                      </p>
                    </div>
                    <div class="text-right flex-shrink-0">
                      <p class="font-extrabold text-slate-800 dark:text-white text-sm">\${{ order.totalAmount.toFixed(2) }}</p>
                      @if (isActiveOrder(order.status)) {
                        <span class="text-[10px] text-primary font-bold group-hover:underline">Track →</span>
                      } @else {
                        <span class="text-[10px] text-slate-400">Details →</span>
                      }
                    </div>
                  </a>
                }
              }
            </div>
          </div>

          <!-- Quick Actions + Cuisine Suggestions -->
          <div class="space-y-5">
            <!-- Quick Actions -->
            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5">
              <h2 class="font-extrabold text-slate-800 dark:text-white text-base mb-4">Quick Actions</h2>
              <div class="space-y-2">
                @for (action of quickActions; track action.label) {
                  <a [routerLink]="action.route"
                     class="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/40 hover:bg-primary/5 transition-all group">
                    <span class="text-xl w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">{{ action.icon }}</span>
                    <div class="min-w-0">
                      <p class="font-semibold text-slate-800 dark:text-white text-sm group-hover:text-primary transition-colors">{{ action.label }}</p>
                      <p class="text-xs text-slate-400">{{ action.desc }}</p>
                    </div>
                    <span class="ml-auto text-slate-300 group-hover:text-primary transition-colors text-sm">→</span>
                  </a>
                }
              </div>
            </div>

            <!-- Cuisine Quick Browse -->
            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5">
              <h2 class="font-extrabold text-slate-800 dark:text-white text-base mb-4">Cravings?</h2>
              <div class="grid grid-cols-3 gap-2">
                @for (c of cuisines; track c.label) {
                  <a [routerLink]="['/']" [queryParams]="{ cuisine: c.value }"
                     class="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/40 hover:bg-primary/5 transition-all group cursor-pointer">
                    <div class="w-10 h-10 rounded-lg overflow-hidden">
                      <img [src]="c.img" [alt]="c.label" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
                    </div>
                    <span class="text-[11px] font-semibold text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors">{{ c.label }}</span>
                  </a>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-dashboard-layout>
  `
})
export class CustomerDashboardComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly orderService = inject(OrderService);

  readonly getDishImage = getDishImage;
  readonly isLoading = signal(true);
  readonly orders = signal<Order[]>([]);

  readonly recentOrders = computed(() => this.orders().slice(0, 5));

  readonly kpiCards = computed(() => {
    const os = this.orders();
    const total = os.length;
    const spent = os.reduce((s, o) => s + o.totalAmount, 0);
    const delivered = os.filter(o => o.status === OrderStatus.DELIVERED).length;
    const active = os.filter(o => this.isActiveOrder(o.status)).length;
    return [
      { label: 'Total Orders', value: total, icon: '📦' },
      { label: 'Total Spent', value: `\$${spent.toFixed(0)}`, icon: '💳' },
      { label: 'Delivered', value: delivered, icon: '✅' },
      { label: 'Active', value: active, icon: '🔴' },
    ];
  });

  readonly quickActions = [
    { icon: '🍽️', label: 'Order Food', desc: 'Browse restaurants near you', route: '/' },
    { icon: '📦', label: 'My Orders', desc: 'Track and view order history', route: '/customer-dashboard/orders' },
    { icon: '👤', label: 'My Profile', desc: 'Update your account details', route: '/customer-dashboard/profile' },
    { icon: '📍', label: 'Addresses', desc: 'Manage delivery addresses', route: '/customer-dashboard/addresses' },
  ];

  readonly cuisines = [
    { label: 'Pizza', value: 'Pizza', img: '/assets/images/cuisines/pizza.jpg' },
    { label: 'Burgers', value: 'Burgers', img: '/assets/images/cuisines/burgers.jpg' },
    { label: 'Sushi', value: 'Sushi', img: '/assets/images/cuisines/sushi.jpg' },
    { label: 'Healthy', value: 'Healthy', img: '/assets/images/cuisines/healthy.jpg' },
    { label: 'Desserts', value: 'Desserts', img: '/assets/images/cuisines/desserts.jpg' },
    { label: 'Asian', value: 'Asian', img: '/assets/images/cuisines/asian.jpg' },
  ];

  ngOnInit(): void {
    this.orderService.getMyOrders().subscribe({
      next: (data: Order[]) => { this.orders.set(data); this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
    });
  }

  isActiveOrder(status: OrderStatus): boolean {
    return [OrderStatus.PLACED, OrderStatus.PENDING, OrderStatus.CONFIRMED,
            OrderStatus.PREPARING, OrderStatus.READY_FOR_PICKUP,
            OrderStatus.PICKED_UP, OrderStatus.OUT_FOR_DELIVERY].includes(status);
  }

  getOrderStatusIcon(status: OrderStatus): string {
    const map: Partial<Record<OrderStatus, string>> = {
      [OrderStatus.PLACED]: '📋', [OrderStatus.PENDING]: '⏳',
      [OrderStatus.CONFIRMED]: '✅', [OrderStatus.PREPARING]: '👨‍🍳',
      [OrderStatus.READY_FOR_PICKUP]: '📦', [OrderStatus.PICKED_UP]: '🤝',
      [OrderStatus.OUT_FOR_DELIVERY]: '🛵', [OrderStatus.DELIVERED]: '🎉',
      [OrderStatus.CANCELLED]: '❌'
    };
    return map[status] ?? '📋';
  }

  getOrderStatusBg(status: OrderStatus): string {
    if (status === OrderStatus.DELIVERED) return 'bg-emerald-100 dark:bg-emerald-950/40';
    if (status === OrderStatus.CANCELLED) return 'bg-red-100 dark:bg-red-950/40';
    if (this.isActiveOrder(status)) return 'bg-primary/10';
    return 'bg-slate-100 dark:bg-slate-800';
  }

  getStatusBadgeClass(status: OrderStatus): string {
    if (status === OrderStatus.DELIVERED) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';
    if (status === OrderStatus.CANCELLED) return 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400';
    if (this.isActiveOrder(status)) return 'bg-primary/10 text-primary';
    return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
  }

  formatStatus(status: OrderStatus): string {
    return (status || '').replace(/_/g, ' ');
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
