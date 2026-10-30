import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { PaymentService } from '../../../core/services/payment.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { Order, OrderStatus } from '../../../core/models';
import { fadeAnimation } from '../../../shared/animations/animations';
import { formatDateTime, formatMoney, formatStatus, isActiveOrder, orderItemName, shortOrderId } from '../../../core/utils/order-helpers';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-customer-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, EmptyStateComponent, StatusBadgeComponent],
  animations: [fadeAnimation],
  template: `
    <div @fadeAnimation class="p-6 max-w-5xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold">My orders</h1>
          <p class="text-sm text-slate-400 mt-0.5">History and live tracking</p>
        </div>
        <a routerLink="/" class="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl">New order</a>
      </div>

      <div class="flex gap-2 mb-6 overflow-x-auto pb-1">
        @for (tab of tabs; track tab.value) {
          <button (click)="activeTab.set(tab.value)"
            class="px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap"
            [class]="activeTab() === tab.value ? 'bg-primary text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'">
            {{ tab.label }} ({{ countByTab(tab.value) }})
          </button>
        }
      </div>

      @if (activeTab() === 'payments') {
        <div class="space-y-3">
          @for (payment of paymentHistory(); track payment.id) {
            <div class="dash-card px-5 py-4 flex items-center justify-between gap-4">
              <div>
                <p class="font-semibold">Order #{{ shortOrderId(payment.id) }}</p>
                <p class="text-xs text-slate-400">{{ formatDateTime(payment.createdAt) }} · {{ formatStatus(payment.paymentMethod) }}</p>
              </div>
              <div class="text-right">
                <p class="font-bold">{{ formatMoney(payment.totalAmount) }}</p>
                <span class="text-xs font-semibold" [class]="payment.paymentStatus === 'PAID' ? 'text-emerald-600' : (payment.paymentStatus === 'REFUNDED' ? 'text-purple-600' : 'text-amber-600')">
                  {{ payment.paymentStatus }}
                </span>
              </div>
            </div>
          } @empty {
            <app-empty-state title="No payment history" message="Payments will appear here after you place an order." />
          }
        </div>
      } @else if (isLoading()) {
        <div class="space-y-4">
          @for (i of [1,2,3]; track i) {
            <div class="h-28 rounded-2xl bg-white dark:bg-slate-900 animate-pulse"></div>
          }
        </div>
      } @else if (filteredOrders().length === 0) {
        <app-empty-state title="No orders found" message="Place an order to see it here." actionLabel="Browse restaurants" actionLink="/" />
      } @else {
        <div class="space-y-4">
          @for (order of filteredOrders(); track order.id) {
            <div class="dash-card overflow-hidden">
              <div class="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
                <div class="flex items-center gap-3">
                  <span class="font-semibold text-sm">#{{ shortOrderId(order.id) }}</span>
                  <app-status-badge [status]="order.status" />
                </div>
                <span class="font-semibold text-primary">{{ formatMoney(order.totalAmount) }}</span>
              </div>
              <div class="px-5 py-4 text-sm text-slate-500 space-y-1">
                <p>{{ getItemsSummary(order) }}</p>
                <p>{{ order.deliveryAddress }}</p>
                <p>{{ formatDateTime(order.createdAt) }} • {{ formatStatus(order.paymentMethod) }} • {{ order.paymentStatus }}</p>
              </div>
              <div class="px-5 py-3 bg-slate-50/70 dark:bg-slate-800/30 flex gap-2">
                <a [routerLink]="['/orders', order.id, 'tracking']" class="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl">
                  {{ isActiveOrder(order.status) ? 'Track order' : 'View details' }}
                </a>
                @if (order.status === OrderStatus.DELIVERED) {
                  <button (click)="reorder(order)" class="px-4 py-2 text-xs font-semibold rounded-xl border border-primary/30 text-primary">
                    Order again
                  </button>
                }
                @if (canCancel(order.status)) {
                  <button (click)="cancel(order)" class="px-4 py-2 text-xs font-semibold rounded-xl border border-red-200 text-red-600">Cancel</button>
                }
                @if (order.paymentStatus === 'FAILED') {
                  <button (click)="retryPayment(order)" class="px-4 py-2 text-xs font-semibold rounded-xl border border-amber-200 text-amber-700">Retry payment</button>
                }
                <button (click)="downloadReceipt(order)" class="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600">Receipt</button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class CustomerOrdersComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly paymentService = inject(PaymentService);

  readonly isLoading = signal(true);
  readonly orders = signal<Order[]>([]);
  readonly paymentHistory = signal<Order[]>([]);
  readonly activeTab = signal('all');
  readonly formatMoney = formatMoney;
  readonly formatDateTime = formatDateTime;
  readonly formatStatus = formatStatus;
  readonly shortOrderId = shortOrderId;
  readonly isActiveOrder = isActiveOrder;
  readonly OrderStatus = OrderStatus;

  readonly tabs = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
    { label: 'Payments', value: 'payments' }
  ];

  filteredOrders(): Order[] {
    const tab = this.activeTab();
    const list = this.orders();
    if (tab === 'active') return list.filter(o => isActiveOrder(o.status));
    if (tab === 'delivered') return list.filter(o => o.status === OrderStatus.DELIVERED);
    if (tab === 'cancelled') return list.filter(o => o.status === OrderStatus.CANCELLED);
    return list;
  }

  countByTab(tab: string): number {
    if (tab === 'payments') return this.paymentHistory().length;
    const list = this.orders();
    if (tab === 'active') return list.filter(o => isActiveOrder(o.status)).length;
    if (tab === 'delivered') return list.filter(o => o.status === OrderStatus.DELIVERED).length;
    if (tab === 'cancelled') return list.filter(o => o.status === OrderStatus.CANCELLED).length;
    return list.length;
  }

  canCancel(status: OrderStatus): boolean {
    return status === OrderStatus.PLACED || status === OrderStatus.PENDING;
  }

  reorder(order: Order): void {
    this.orderService.reorder(order.id).subscribe({
      next: () => this.toast.success('Order created', 'Your previous order was placed again.'),
      error: () => this.toast.error('Reorder failed', 'Some items may no longer be available.')
    });
  }

  getItemsSummary(order: Order): string {
    return (order.items || []).map(i => `${i.quantity}x ${orderItemName(i)}`).join(', ');
  }

  async cancel(order: Order): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Cancel this order?',
      message: 'You can only cancel while the restaurant has not confirmed it.',
      confirmLabel: 'Cancel order',
      danger: true
    });
    if (!ok) return;
    this.orderService.updateStatus(order.id, OrderStatus.CANCELLED).subscribe({
      next: updated => {
        this.orders.update(list => list.map(o => o.id === updated.id ? updated : o));
        this.toast.success('Order cancelled', 'Your order was cancelled.');
      },
      error: err => this.toast.error('Could not cancel', err?.error?.message || 'Please try again.')
    });
  }

  retryPayment(order: Order): void {
    this.paymentService.retryPayment(order.id).subscribe({
      next: () => this.toast.info('Payment ready', 'A new secure payment session was created. Complete it from checkout.'),
      error: error => this.toast.error('Retry failed', error?.error?.message || 'Could not retry this payment.')
    });
  }

  downloadReceipt(order: Order): void {
    const receipt = [
      `FoodDelivery receipt #${order.id}`,
      `Date: ${formatDateTime(order.createdAt)}`,
      `Customer: ${order.customerName}`,
      `Address: ${order.deliveryAddress}`,
      '',
      ...order.items.map(item => `${item.quantity}x ${orderItemName(item)} - ${formatMoney(item.subtotal)}`),
      '',
      `Subtotal: ${formatMoney(order.subtotalAmount)}`,
      `Delivery fee: ${formatMoney(order.deliveryFee || 0)}`,
      `Tax: ${formatMoney(order.taxAmount || 0)}`,
      `Total: ${formatMoney(order.totalAmount)}`,
      `Payment: ${order.paymentMethod} / ${order.paymentStatus}`
    ].join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([receipt], { type: 'text/plain;charset=utf-8' }));
    link.download = `receipt-${order.id}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  ngOnInit(): void {
    this.orderService.getMyOrders().subscribe({
      next: data => { this.orders.set(data); this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
    });
    this.paymentService.getPaymentHistory().subscribe({
      next: data => this.paymentHistory.set(data)
    });
  }
}
