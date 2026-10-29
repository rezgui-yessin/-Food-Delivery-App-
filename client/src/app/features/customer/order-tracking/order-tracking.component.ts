import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderTrackingService } from '../../../core/services/order-tracking.service';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus } from '../../../core/models';
import { getDishImage } from '../../../core/utils/asset-helpers';
import { fadeAnimation } from '../../../shared/animations/animations';

interface TrackingStep {
  status: OrderStatus;
  label: string;
  description: string;
  emoji: string;
}

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  animations: [fadeAnimation],
  template: `
    <div @fadeAnimation class="min-h-screen bg-slate-50 dark:bg-slate-900 py-10 px-4">
      <div class="max-w-2xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <a routerLink="/orders" class="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">← My Orders</a>
            <h1 class="text-2xl font-extrabold text-slate-800 dark:text-white mt-1 flex items-center gap-2">
              <span>Live Tracking</span>
              <span class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full"
                [class]="getConnectionBadgeClass()">
                <span class="w-2 h-2 rounded-full animate-pulse" [class]="getConnectionDotClass()"></span>
                {{ trackingService.connectionStatus() | titlecase }}
              </span>
            </h1>
          </div>

          @if (order()) {
            <div class="text-right">
              <p class="text-xs text-slate-400">Order ID</p>
              <p class="text-sm font-mono font-bold text-slate-700 dark:text-slate-300">#{{ order()!.id.substring(0, 8).toUpperCase() }}</p>
            </div>
          }
        </div>

        @if (order()) {
          <!-- Stepper -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm mb-6">
            <div class="space-y-0">
              @for (step of trackingSteps; track step.status; let i = $index; let last = $last) {
                <div class="flex gap-4">
                  <!-- Indicator column -->
                  <div class="flex flex-col items-center flex-shrink-0">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all duration-500"
                      [class]="getStepCircleClass(step.status)">
                      @if (getStepState(step.status) === 'completed') {
                        <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      } @else {
                        <span [class.opacity-40]="getStepState(step.status) === 'pending'"
                              [class.radar-glow]="getStepState(step.status) === 'active'">
                          {{ step.emoji }}
                        </span>
                      }
                    </div>
                    @if (!last) {
                      <div class="w-0.5 flex-1 min-h-[2.5rem] mt-1 transition-all duration-500"
                        [class]="isStepDone(step.status) ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'">
                      </div>
                    }
                  </div>

                  <!-- Content column -->
                  <div class="pb-6 flex-1">
                    <div class="flex items-start justify-between">
                      <div>
                        <p class="font-semibold text-sm transition-colors" [class]="getStepTextClass(step.status)">
                          {{ step.label }}
                        </p>
                        <p class="text-xs text-slate-400 mt-0.5">{{ step.description }}</p>
                      </div>
                      @if (getStepState(step.status) === 'active') {
                        <span class="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">In Progress</span>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Driver Card & Out for Delivery illustration -->
          @if (order()!.status === OrderStatus.OUT_FOR_DELIVERY || order()!.status === OrderStatus.PICKED_UP) {
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 p-5 shadow-sm mb-6 flex flex-col sm:flex-row items-center gap-5">
              <img src="/assets/illustrations/delivery-courier.svg" alt="Delivery Courier" class="w-32 h-24 object-contain flex-shrink-0 animate-bounce">
              <div class="flex-1 text-center sm:text-left">
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 inline-block mb-1">
                  On the Road
                </span>
                <p class="font-bold text-slate-800 dark:text-white text-lg">
                  {{ order()!.driverName || 'Courier Assigned' }}
                </p>
                <p class="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Your delicious meal is speeding to your door!</p>
              </div>
            </div>
          }

          <!-- Delivered Banner -->
          @if (order()!.status === OrderStatus.DELIVERED) {
            <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white text-center mb-6 shadow-lg shadow-emerald-500/20">
              <div class="text-5xl mb-2">🎉</div>
              <h2 class="text-2xl font-extrabold">Enjoy your meal!</h2>
              <p class="text-emerald-100 mt-1">Your order has been delivered.</p>
            </div>
          }

          <!-- Order Details -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm mb-6">
            <h3 class="font-bold text-slate-800 dark:text-white mb-3">Order Details</h3>
            <div class="space-y-3 mb-3">
              @for (item of order()!.items; track item.menuItemId) {
                <div class="flex items-center justify-between gap-3 text-sm">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <img [src]="getDishImage(item.menuItemName)" [alt]="item.menuItemName" class="w-10 h-10 rounded-lg object-cover flex-shrink-0 shadow-sm border border-slate-100 dark:border-slate-700">
                    <span class="text-slate-700 dark:text-slate-300 font-medium truncate">
                      <span class="font-bold text-slate-500 mr-1.5">×{{ item.quantity }}</span>{{ item.menuItemName }}
                    </span>
                  </div>
                  <span class="font-bold text-slate-800 dark:text-white flex-shrink-0">
                    \${{ ((item.unitPrice || 0) * item.quantity).toFixed(2) }}
                  </span>
                </div>
              }
            </div>
            <div class="border-t border-slate-100 dark:border-slate-700 pt-3 flex justify-between font-bold text-slate-900 dark:text-white">
              <span>Total</span>
              <span class="text-primary">\${{ getTotal() }}</span>
            </div>
          </div>

          <!-- Event Log -->
          @if (trackingService.eventLog().length > 0) {
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm">
              <h3 class="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Live Updates
              </h3>
              <div class="space-y-2.5 max-h-48 overflow-y-auto">
                @for (log of trackingService.eventLog(); track $index) {
                  <div class="flex gap-3 text-sm">
                    <span class="text-slate-400 text-xs flex-shrink-0 mt-0.5">{{ formatTime(log.timestamp) }}</span>
                    <span class="text-slate-600 dark:text-slate-300">{{ log.message }}</span>
                  </div>
                }
              </div>
            </div>
          }
        } @else {
          <div class="animate-pulse space-y-4">
            <div class="h-64 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700"></div>
            <div class="h-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700"></div>
          </div>
        }
      </div>
    </div>
  `
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  readonly getDishImage = getDishImage;
  readonly trackingService = inject(OrderTrackingService);
  private readonly orderService = inject(OrderService);
  private readonly route = inject(ActivatedRoute);

  readonly order = signal<Order | null>(null);
  readonly OrderStatus = OrderStatus;

  private pollInterval: any = null;

  readonly trackingSteps: TrackingStep[] = [
    { status: OrderStatus.PLACED,           label: 'Order Received',      description: 'We received your order',              emoji: '📋' },
    { status: OrderStatus.CONFIRMED,        label: 'Restaurant Confirmed', description: 'Restaurant accepted your order',       emoji: '✅' },
    { status: OrderStatus.PREPARING,        label: 'Chef is Cooking',      description: 'Your food is being prepared',          emoji: '👨‍🍳' },
    { status: OrderStatus.READY_FOR_PICKUP, label: 'Ready for Pickup',     description: 'Food packed and waiting for driver',   emoji: '📦' },
    { status: OrderStatus.OUT_FOR_DELIVERY, label: 'On the Way',           description: 'Your driver is heading to you',        emoji: '🛵' },
    { status: OrderStatus.DELIVERED,        label: 'Delivered',            description: 'Enjoy your meal!',                     emoji: '🎉' }
  ];

  private readonly statusOrder: OrderStatus[] = [
    OrderStatus.PLACED, OrderStatus.CONFIRMED, OrderStatus.PREPARING,
    OrderStatus.READY_FOR_PICKUP, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED
  ];

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id')!;

    this.orderService.getById(orderId).subscribe({
      next: (order) => this.order.set(order),
      error: () => {}
    });

    this.trackingService.connect(orderId);

    this.pollInterval = setInterval(() => {
      const event = this.trackingService.trackingEvent();
      if (event && event.orderId === orderId) {
        this.order.update(o => {
          if (!o) return o;
          return {
            ...o,
            status: event.status,
            driverId: event.driverId || o.driverId,
            driverName: event.driverName || o.driverName
          };
        });
      }
    }, 500);
  }

  getTotal(): string {
    const o = this.order();
    if (!o) return '0.00';
    return Number(o.totalAmount).toFixed(2);
  }

  getStepState(status: OrderStatus): 'completed' | 'active' | 'pending' {
    const currentOrder = this.order();
    if (!currentOrder) return 'pending';

    const currentIdx = this.statusOrder.indexOf(currentOrder.status);
    const stepIdx = this.statusOrder.indexOf(status);

    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'active';
    return 'pending';
  }

  isStepDone(status: OrderStatus): boolean {
    return this.getStepState(status) === 'completed';
  }

  getStepCircleClass(status: OrderStatus): string {
    const state = this.getStepState(status);
    if (state === 'completed') {
      return 'border-primary bg-primary text-white';
    }
    if (state === 'active') {
      return 'border-primary bg-white dark:bg-slate-800 shadow-lg shadow-orange-500/30';
    }
    return 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800';
  }

  getStepTextClass(status: OrderStatus): string {
    const state = this.getStepState(status);
    if (state === 'active') {
      return 'text-primary font-bold';
    }
    if (state === 'completed') {
      return 'text-slate-800 dark:text-white';
    }
    return 'text-slate-400 dark:text-slate-500';
  }

  getConnectionBadgeClass(): string {
    const s = this.trackingService.connectionStatus();
    if (s === 'connected') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (s === 'connecting') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';
  }

  getConnectionDotClass(): string {
    const s = this.trackingService.connectionStatus();
    if (s === 'connected') return 'bg-emerald-500';
    if (s === 'connecting') return 'bg-amber-500';
    return 'bg-slate-400';
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  ngOnDestroy(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
    this.trackingService.disconnect();
  }
}
