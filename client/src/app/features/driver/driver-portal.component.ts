import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { DriverEarnings, DriverProfile, Order, OrderStatus } from '../../core/models';
import { DriverService } from '../../core/services/driver.service';
import { DashboardLayoutComponent } from '../../shared/components/dashboard-layout/dashboard-layout.component';
import { LiveMapComponent, LiveMapMarker } from '../../shared/components/live-map/live-map.component';
import { fadeAnimation } from '../../shared/animations/animations';

@Component({
  selector: 'app-driver-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardLayoutComponent, LiveMapComponent],
  animations: [fadeAnimation],
  template: `
    <app-dashboard-layout>
      <div @fadeAnimation class="p-6 max-w-5xl mx-auto space-y-6">
        <!-- Action Row -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-2xl">
              🛵
            </div>
            <div>
              <h1 class="text-xl font-extrabold text-slate-800 dark:text-white">Courier Operations Portal</h1>
              <p class="text-slate-500 dark:text-slate-400 text-xs">Pickups, ongoing runs, delivery history, and earnings</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            @if (profile(); as driver) {
              <span class="text-sm font-semibold" [class.text-emerald-600]="driver.available" [class.text-slate-500]="!driver.available">
                {{ driver.available ? 'Online' : 'Offline' }}
              </span>
              <button (click)="setAvailability(!driver.available)" class="px-4 py-2 rounded-xl text-sm font-bold text-white" [class.bg-emerald-600]="!driver.available" [class.bg-slate-600]="driver.available">
                {{ driver.available ? 'Go offline' : 'Go online' }}
              </button>
              <button (click)="shareLocation()" class="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold">Share location</button>
            }
          </div>

          <button
            (click)="refresh()"
            class="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:border-emerald-500 hover:text-emerald-600 transition-colors text-sm font-semibold shadow-sm flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Refresh Runs
          </button>
        </div>

        <!-- Portal Tabs -->
        <div class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1 overflow-x-auto">
          <button
            (click)="activeTab.set('available')"
            class="pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap"
            [class.border-emerald-500]="activeTab() === 'available'"
            [class.text-emerald-600]="activeTab() === 'available'"
            [class.border-transparent]="activeTab() !== 'available'"
            [class.text-slate-500]="activeTab() !== 'available'">
            <span>⚡ Available Pickups</span>
            <span class="px-2 py-0.5 text-xs rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
              {{ availableOrders().length }}
            </span>
          </button>

          <button
            (click)="activeTab.set('active')"
            class="pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap"
            [class.border-emerald-500]="activeTab() === 'active'"
            [class.text-emerald-600]="activeTab() === 'active'"
            [class.border-transparent]="activeTab() !== 'active'"
            [class.text-slate-500]="activeTab() !== 'active'">
            <span>🚀 My Active Deliveries</span>
            <span class="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {{ ongoingDeliveries().length }}
            </span>
          </button>

          <button
            (click)="activeTab.set('history')"
            class="pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap"
            [class.border-emerald-500]="activeTab() === 'history'"
            [class.text-emerald-600]="activeTab() === 'history'"
            [class.border-transparent]="activeTab() !== 'history'"
            [class.text-slate-500]="activeTab() !== 'history'">
            <span>📦 Delivery History</span>
            <span class="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {{ completedDeliveries().length }}
            </span>
          </button>

          <button
            (click)="activeTab.set('earnings')"
            class="pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap"
            [class.border-emerald-500]="activeTab() === 'earnings'"
            [class.text-emerald-600]="activeTab() === 'earnings'"
            [class.border-transparent]="activeTab() !== 'earnings'"
            [class.text-slate-500]="activeTab() !== 'earnings'">
            <span>💰 Earnings</span>
            <span class="px-2 py-0.5 text-xs rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
              \${{ totalEarnings().toFixed(2) }}
            </span>
          </button>
          <button (click)="activeTab.set('profile')" class="pb-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap"
            [class.border-emerald-500]="activeTab() === 'profile'" [class.text-emerald-600]="activeTab() === 'profile'"
            [class.border-transparent]="activeTab() !== 'profile'" [class.text-slate-500]="activeTab() !== 'profile'">👤 Driver profile</button>
        </div>

        <!-- Tab 1: Available Pickups -->
        @if (activeTab() === 'available') {
          <div class="space-y-4">
            @for (order of availableOrders(); track order.id) {
              <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                        Ready for Pickup
                      </span>
                      <span class="text-xs font-mono text-slate-400">#{{ order.id.substring(0, 8).toUpperCase() }}</span>
                    </div>
                    <h3 class="text-lg font-bold text-slate-800 dark:text-white">Delivery to {{ order.customerName }}</h3>
                  </div>

                  <div class="text-left sm:text-right">
                    <span class="text-xs text-slate-400 block">Est. Payout</span>
                    <span class="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">$5.50</span>
                  </div>
                </div>

                <!-- Locations Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-sm">
                  <div class="flex items-start gap-2.5">
                    <span class="text-primary text-base">🏪</span>
                    <div>
                      <span class="text-xs font-semibold text-slate-400 block">Pickup Location</span>
                      <span class="font-medium text-slate-800 dark:text-slate-200">Restaurant Partner</span>
                      <span class="text-xs text-slate-500 block">ID: {{ order.restaurantId.substring(0, 8) }}</span>
                    </div>
                  </div>

                  <iframe
                    [src]="getMapEmbedUrl(order.deliveryAddress)"
                    title="Delivery destination map"
                    class="w-full h-52 rounded-xl border border-slate-200 dark:border-slate-700 mb-5"
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade">
                  </iframe>

                  <div class="flex items-start gap-2.5">
                    <span class="text-emerald-500 text-base">📍</span>
                    <div>
                      <span class="text-xs font-semibold text-slate-400 block">Drop-off Destination</span>
                      <span class="font-medium text-slate-800 dark:text-slate-200">{{ order.deliveryAddress }}</span>
                      <span class="text-xs text-slate-500 block">Contact: {{ order.customerPhone }}</span>
                    </div>
                  </div>
                </div>

                <!-- Action Button -->
                <button
                  (click)="acceptJob(order.id)"
                  class="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2">
                  <span>Accept Job & Start Run</span>
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </button>
                <a
                  [href]="getGoogleMapsUrl(order.deliveryAddress)"
                  target="_blank"
                  rel="noopener"
                  class="mt-2 inline-flex w-full sm:w-auto items-center justify-center gap-2 px-5 py-2.5 border border-blue-200 text-blue-700 font-semibold rounded-xl hover:bg-blue-50">
                  Open delivery map
                </a>
                <button (click)="rejectJob(order.id)" class="mt-2 w-full sm:w-auto px-5 py-2.5 border border-slate-300 text-slate-600 font-semibold rounded-xl">Reject</button>
              </div>
            } @empty {
              <div class="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
                <div class="text-4xl mb-3">🛵</div>
                <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-1">No Orders Available</h3>
                <p class="text-sm text-slate-500">There are currently no orders ready for courier pickup. Check back shortly!</p>
              </div>
            }
          </div>
        }

        <!-- Tab 2: My Active Deliveries -->
        @if (activeTab() === 'active') {
          <div class="space-y-6">
            @for (order of ongoingDeliveries(); track order.id) {
              <div class="bg-white dark:bg-slate-800 rounded-2xl border-2 border-emerald-500/40 dark:border-emerald-500/20 p-6 shadow-lg space-y-5">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-4">
                  <div>
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                      {{ formatStatus(order.status) }}
                    </span>
                    <h3 class="text-xl font-bold text-slate-800 dark:text-white mt-1">Delivering to {{ order.customerName }}</h3>
                  </div>

                  <a
                    [href]="getGoogleMapsUrl(order.deliveryAddress)"
                    target="_blank"
                    class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md transition-colors w-fit">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                    </svg>
                    Navigate (Google Maps)
                  </a>
                </div>

                <div class="flex items-center gap-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                  <img src="/assets/illustrations/delivery-courier.svg" alt="Courier on route" class="w-16 h-12 object-contain">
                  <div>
                    <p class="text-xs font-bold text-emerald-800 dark:text-emerald-300">Active Delivery Run</p>
                    <p class="text-xs text-emerald-600 dark:text-emerald-400">Keep customer updated by advancing order status below</p>
                  </div>
                </div>

                <!-- Customer Details -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span class="text-xs text-slate-400 uppercase font-semibold block mb-1">Destination</span>
                    <p class="font-bold text-slate-800 dark:text-white text-base">{{ order.deliveryAddress }}</p>
                  </div>

                  <app-live-map
                    [markers]="getLiveMapMarkers(order)"
                    aria-label="Live driver and delivery route map">
                  </app-live-map>

                  <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span class="text-xs text-slate-400 uppercase font-semibold block mb-1">Recipient Phone</span>
                    <a [href]="'tel:' + order.customerPhone" class="font-bold text-blue-600 text-base">{{ order.customerPhone }} · Contact customer</a>
                  </div>
                </div>

                <!-- Run Progression Buttons -->
                <div class="pt-2 flex flex-col sm:flex-row gap-3">
                  @if (order.status === OrderStatus.READY_FOR_PICKUP || order.status === OrderStatus.CONFIRMED) {
                    <button
                      (click)="updateStatus(order.id, OrderStatus.PICKED_UP)"
                      class="flex-1 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl shadow-md transition-colors text-base flex items-center justify-center gap-2">
                      <span>✓ Confirm Picked Up from Kitchen</span>
                    </button>
                  } @else if (order.status === OrderStatus.PICKED_UP) {
                    <button
                      (click)="updateStatus(order.id, OrderStatus.OUT_FOR_DELIVERY)"
                      class="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md transition-colors text-base flex items-center justify-center gap-2">
                      <span>🛵 Out for Delivery to Customer</span>
                    </button>
                  } @else if (order.status === OrderStatus.OUT_FOR_DELIVERY) {
                    <div class="flex-1 space-y-2">
                      <input [(ngModel)]="proofCode" placeholder="Verification code (optional)" class="w-full px-3 py-2 rounded-lg border border-slate-200">
                      <input [(ngModel)]="proofPhotoUrl" placeholder="Proof photo URL (optional)" class="w-full px-3 py-2 rounded-lg border border-slate-200">
                      <button (click)="submitProofAndDeliver(order)" class="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg">
                        🎉 Submit proof & confirm delivery
                      </button>
                    </div>
                  }
                </div>
              </div>
            } @empty {
              <div class="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
                <img src="/assets/illustrations/delivery-courier.svg" alt="No Active Deliveries" class="w-40 h-28 mx-auto mb-3 opacity-80">
                <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-1">No Active Deliveries</h3>
                <p class="text-sm text-slate-500">Go to the "Available Pickups" tab to accept a new delivery order.</p>
              </div>
            }
          </div>
        }

        <!-- Tab 3: Completed Delivery History -->
        @if (activeTab() === 'history') {
          <div class="space-y-4">
            @for (order of completedDeliveries(); track order.id) {
              <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm flex items-center justify-between gap-4">
                <div class="flex items-center gap-3.5">
                  <div class="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center text-xl">
                    ✅
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-slate-800 dark:text-white text-sm">Order #{{ order.id.substring(0, 8).toUpperCase() }}</span>
                      <span class="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">Delivered</span>
                    </div>
                    <p class="text-xs text-slate-400 mt-0.5">To: {{ order.customerName }} • {{ order.deliveryAddress }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <span class="text-xs text-slate-400 block">Driver Payout</span>
                  <span class="text-base font-extrabold text-emerald-600 dark:text-emerald-400">+$5.50</span>
                </div>
              </div>
            } @empty {
              <div class="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
                <div class="text-4xl mb-3">📦</div>
                <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-1">No Completed Deliveries</h3>
                <p class="text-sm text-slate-500">Completed runs will be archived and shown here.</p>
              </div>
            }
          </div>
        }

        <!-- Tab 4: Earnings Overview -->
        @if (activeTab() === 'earnings') {
          <div class="space-y-6">
            <!-- Earnings KPI Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                <span class="text-xs font-semibold uppercase text-slate-400 block mb-1">Total Payout</span>
                <span class="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">\${{ totalEarnings().toFixed(2) }}</span>
                <p class="text-xs text-slate-400 mt-1">Available for weekly payout</p>
              </div>

              <div class="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                <span class="text-xs font-semibold uppercase text-slate-400 block mb-1">Completed Runs</span>
                <span class="text-3xl font-extrabold text-slate-800 dark:text-white">{{ completedDeliveries().length }}</span>
                <p class="text-xs text-slate-400 mt-1">Total customer drop-offs</p>
              </div>

              <div class="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                <span class="text-xs font-semibold uppercase text-slate-400 block mb-1">Rate per Drop-off</span>
                <span class="text-3xl font-extrabold text-slate-800 dark:text-white">$5.50</span>
                <p class="text-xs text-slate-400 mt-1">Base rate + distance bonus</p>
              </div>
            </div>
          </div>
        }

        @if (activeTab() === 'profile') {
          <div class="max-w-2xl bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <h2 class="text-xl font-bold">Driver and vehicle profile</h2>
            <div class="grid sm:grid-cols-2 gap-4">
              <input [(ngModel)]="profileDraft.fullName" placeholder="Full name" class="px-3 py-2 rounded-lg border border-slate-200">
              <input [(ngModel)]="profileDraft.phone" placeholder="Phone" class="px-3 py-2 rounded-lg border border-slate-200">
              <input [(ngModel)]="profileDraft.vehicleType" placeholder="Vehicle type" class="px-3 py-2 rounded-lg border border-slate-200">
              <input [(ngModel)]="profileDraft.vehiclePlate" placeholder="Vehicle plate" class="px-3 py-2 rounded-lg border border-slate-200">
              <input [(ngModel)]="profileDraft.deliveryZone" placeholder="Delivery zone" class="px-3 py-2 rounded-lg border border-slate-200">
            </div>
            <p class="text-sm text-slate-500">Rating: {{ profile()?.rating?.toFixed(1) || '0.0' }} / 5</p>
            <button (click)="saveProfile()" class="px-5 py-3 bg-emerald-600 text-white rounded-xl font-bold">Save profile</button>
          </div>
        }
      </div>
    </app-dashboard-layout>
  `
})
export class DriverPortalComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly toastService = inject(ToastService);
  private readonly driverService = inject(DriverService);
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);

  readonly activeTab = signal<'available' | 'active' | 'history' | 'earnings' | 'profile'>('available');
  readonly availableOrders = signal<Order[]>([]);
  readonly myDeliveries = signal<Order[]>([]);
  readonly profile = signal<DriverProfile | null>(null);

  getLiveMapMarkers(order: Order): LiveMapMarker[] {
    const driver = this.profile();
    return [
      { label: 'Driver', latitude: driver?.latitude, longitude: driver?.longitude },
      { label: 'Restaurant', latitude: order.restaurantLatitude, longitude: order.restaurantLongitude },
      { label: 'Customer', latitude: order.deliveryLatitude, longitude: order.deliveryLongitude }
    ];
  }
  readonly earnings = signal<DriverEarnings | null>(null);
  proofCode = '';
  proofPhotoUrl = '';
  profileDraft: Partial<DriverProfile> = {};
  private locationWatchId: number | null = null;
  private lastLocationSentAt = 0;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  readonly ongoingDeliveries = computed(() =>
    this.myDeliveries().filter(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED)
  );

  readonly completedDeliveries = computed(() =>
    this.myDeliveries().filter(o => o.status === OrderStatus.DELIVERED)
  );

  readonly totalEarnings = computed(() =>
    this.earnings()?.totalEarnings ?? this.completedDeliveries().length * 5.50
  );

  readonly OrderStatus = OrderStatus;

  formatStatus(status: OrderStatus): string {
    return (status || '').replace(/_/g, ' ');
  }

  ngOnInit(): void {
    this.route.params.subscribe(p => {
      if (p['tab'] === 'active') this.activeTab.set('active');
      else if (p['tab'] === 'history') this.activeTab.set('history');
      else if (p['tab'] === 'earnings') this.activeTab.set('earnings');
      else if (p['tab'] === 'profile') this.activeTab.set('profile');
      else if (p['tab'] === 'available') this.activeTab.set('available');
    });
    this.refresh();
    this.driverService.getProfile().subscribe({ next: profile => { this.profile.set(profile); this.profileDraft = { ...profile }; } });
    this.driverService.getEarnings().subscribe({ next: earnings => this.earnings.set(earnings) });
    this.refreshTimer = setInterval(() => this.loadAvailable(), 15000);
  }

  refresh(): void {
    this.loadAvailable();
    this.loadMyDeliveries();
    this.driverService.getEarnings().subscribe({ next: earnings => this.earnings.set(earnings) });
  }

  setAvailability(available: boolean): void {
    this.driverService.setAvailability(available).subscribe({
      next: profile => {
        this.profile.set(profile);
        if (available) this.startLocationSharing();
        else this.stopLocationSharing();
      },
      error: error => this.toastService.error('Availability failed', error?.error?.message || 'Could not update availability.')
    });
  }

  shareLocation(): void {
    this.startLocationSharing();
  }

  private startLocationSharing(): void {
    if (!navigator.geolocation) {
      this.toastService.error('Location unavailable', 'This browser does not support GPS location.');
      return;
    }
    if (this.locationWatchId !== null) return;
    this.locationWatchId = navigator.geolocation.watchPosition(position => {
      const now = Date.now();
      if (now - this.lastLocationSentAt < 10000) return;
      this.lastLocationSentAt = now;
      this.driverService.updateLocation(position.coords.latitude, position.coords.longitude).subscribe({
        next: profile => this.profile.set(profile),
        error: error => this.toastService.error('Location failed', error?.error?.message || 'Could not share your location.')
      });
    }, () => this.toastService.error('Location denied', 'Allow location access to share your position.'), {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 15000
    });
    this.toastService.success('Live location enabled', 'Your position will update while you are online.');
  }

  private stopLocationSharing(): void {
    if (this.locationWatchId !== null) {
      navigator.geolocation.clearWatch(this.locationWatchId);
      this.locationWatchId = null;
    }
  }

  submitProofAndDeliver(order: Order): void {
    this.driverService.submitProof(order.id, { verificationCode: this.proofCode, photoUrl: this.proofPhotoUrl }).subscribe({
      next: () => {
        this.proofCode = '';
        this.proofPhotoUrl = '';
        this.updateStatus(order.id, OrderStatus.DELIVERED);
      },
      error: error => this.toastService.error('Proof failed', error?.error?.message || 'Submit delivery proof before completing the order.')
    });
  }

  loadAvailable(): void {
    this.orderService.getAvailableForPickup().subscribe({
      next: (orders) => this.availableOrders.set(orders)
    });
  }

  loadMyDeliveries(): void {
    this.orderService.getMyDeliveries().subscribe({
      next: (orders) => this.myDeliveries.set(orders)
    });
  }

  acceptJob(orderId: string): void {
    this.orderService.acceptOrder(orderId).subscribe({
      next: (order) => {
        this.toastService.success('Job Accepted!', 'Head to the restaurant for order pickup.');
        this.availableOrders.update(list => list.filter(o => o.id !== orderId));
        this.myDeliveries.update(list => [...list, order]);
        this.activeTab.set('active');
      },
      error: () => this.toastService.error('Error', 'Could not accept order.')
    });
  }

  rejectJob(orderId: string): void {
    this.orderService.rejectOrder(orderId).subscribe({
      next: () => { this.availableOrders.update(list => list.filter(order => order.id !== orderId)); this.toastService.info('Job skipped', 'The delivery remains available for another driver.'); },
      error: error => this.toastService.error('Unable to reject', error?.error?.message || 'This delivery is no longer available.')
    });
  }

  saveProfile(): void {
    this.driverService.updateProfile(this.profileDraft).subscribe({
      next: profile => { this.profile.set(profile); this.profileDraft = { ...profile }; this.toastService.success('Profile saved', 'Driver and vehicle details updated.'); },
      error: error => this.toastService.error('Profile failed', error?.error?.message || 'Could not save your profile.')
    });
  }

  updateStatus(orderId: string, status: OrderStatus): void {
    this.orderService.updateStatus(orderId, status).subscribe({
      next: (updated) => {
        if (status === OrderStatus.DELIVERED) {
          this.toastService.success('Completed! 🏆', 'Order successfully marked as delivered.');
          this.myDeliveries.update(list => list.filter(o => o.id !== orderId));
        } else {
          this.toastService.info('Status Updated', `Order is now ${status.replace('_', ' ')}`);
          this.myDeliveries.update(list => list.map(o => o.id === updated.id ? updated : o));
        }
      },
      error: () => this.toastService.error('Error', 'Failed to update order status.')
    });
  }

  getGoogleMapsUrl(address: string): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }

  getMapEmbedUrl(address: string): SafeResourceUrl {
    const query = encodeURIComponent(address || 'Food delivery destination');
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.google.com/maps?q=${query}&output=embed`
    );
  }

  ngOnDestroy(): void {
    this.stopLocationSharing();
    if (this.refreshTimer) clearInterval(this.refreshTimer);
  }
}
