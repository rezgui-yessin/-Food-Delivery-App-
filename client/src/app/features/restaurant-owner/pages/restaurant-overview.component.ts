import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OwnerContextService } from '../../../core/services/owner-context.service';
import { OrderService } from '../../../core/services/order.service';
import { MenuService } from '../../../core/services/menu.service';
import { Order } from '../../../core/models';
import { derivePlatformStats, formatMoney, shortOrderId } from '../../../core/utils/order-helpers';
import { fadeAnimation } from '../../../shared/animations/animations';
import { RestaurantPickerComponent } from '../components/restaurant-picker.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-restaurant-overview',
  standalone: true,
  imports: [CommonModule, RouterLink, RestaurantPickerComponent, StatusBadgeComponent, EmptyStateComponent],
  animations: [fadeAnimation],
  template: `
    <div @fadeAnimation class="p-6 max-w-7xl mx-auto space-y-6">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold">Restaurant overview</h1>
          <p class="text-sm text-slate-500">Orders and catalog stats from the API</p>
        </div>
        <app-restaurant-picker />
      </div>

      @if (!ctx.selected()) {
        <app-empty-state title="No restaurant yet" message="Create your restaurant profile in Settings." actionLabel="Open settings" actionLink="/restaurant/settings" />
      } @else {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="dash-card p-5"><p class="kpi-label">Orders</p><p class="kpi-value">{{ stats().totalOrders }}</p></div>
          <div class="dash-card p-5"><p class="kpi-label">Revenue</p><p class="kpi-value">{{ formatMoney(stats().totalRevenue) }}</p></div>
          <div class="dash-card p-5"><p class="kpi-label">Active orders</p><p class="kpi-value">{{ stats().activeOrders }}</p></div>
          <div class="dash-card p-5"><p class="kpi-label">Menu items</p><p class="kpi-value">{{ menuCount() }}</p></div>
        </div>

        <div class="dash-card overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between">
            <h2 class="font-semibold">Latest orders</h2>
            <a routerLink="/restaurant/orders" class="text-sm text-primary font-semibold">Kitchen</a>
          </div>
          @if (recent().length === 0) {
            <p class="p-6 text-sm text-slate-500">No orders for this restaurant yet.</p>
          } @else {
            <table class="w-full text-sm">
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                @for (order of recent(); track order.id) {
                  <tr>
                    <td class="px-5 py-3 font-medium">#{{ shortOrderId(order.id) }}</td>
                    <td class="px-5 py-3">{{ order.customerName }}</td>
                    <td class="px-5 py-3"><app-status-badge [status]="order.status" /></td>
                    <td class="px-5 py-3 text-right">{{ formatMoney(order.totalAmount) }}</td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      }
    </div>
  `
})
export class RestaurantOverviewComponent implements OnInit {
  readonly ctx = inject(OwnerContextService);
  private readonly orderService = inject(OrderService);
  private readonly menuService = inject(MenuService);
  readonly orders = signal<Order[]>([]);
  readonly menuCount = signal(0);
  readonly formatMoney = formatMoney;
  readonly shortOrderId = shortOrderId;

  readonly stats = computed(() => derivePlatformStats(this.orders(), this.ctx.selected() ? [this.ctx.selected()!] : []));
  readonly recent = computed(() => this.orders().slice(0, 8));

  constructor() {
    effect(() => {
      const id = this.ctx.selectedId();
      if (!id) return;
      this.orderService.getByRestaurant(id).subscribe(orders => this.orders.set(orders));
      this.menuService.getByRestaurant(id).subscribe(items => this.menuCount.set(items.length));
    });
  }

  ngOnInit(): void {
    this.ctx.load();
  }
}
