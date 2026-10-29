import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RestaurantService } from '../../core/services/restaurant.service';
import { OrderService } from '../../core/services/order.service';
import { CouponService } from '../../core/services/coupon.service';
import { ToastService } from '../../core/services/toast.service';
import { Coupon, DiscountType, Order, Restaurant } from '../../core/models';
import { fadeAnimation } from '../../shared/animations/animations';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  animations: [fadeAnimation],
  template: `
    <div @fadeAnimation class="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div class="max-w-7xl mx-auto space-y-8">
        <!-- Top Admin Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-2xl">
              ⚡
            </div>
            <div>
              <h1 class="text-3xl font-extrabold text-slate-800 dark:text-white">Super Admin Dashboard</h1>
              <p class="text-slate-500 dark:text-slate-400 text-sm">Platform metrics, merchant management, and promotional campaigns</p>
            </div>
          </div>
        </div>

        <!-- KPI Summary Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <!-- Total Orders -->
          <div class="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
              <span class="p-2 rounded-xl bg-primary/10 text-primary text-lg">🛍️</span>
            </div>
            <div class="text-3xl font-extrabold text-slate-800 dark:text-white">{{ orders().length }}</div>
            <p class="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">Live orders recorded</p>
          </div>

          <!-- Platform Revenue -->
          <div class="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Platform GMV</span>
              <span class="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 text-lg">💰</span>
            </div>
            <div class="text-3xl font-extrabold text-slate-800 dark:text-white">\${{ platformRevenue().toFixed(2) }}</div>
            <p class="text-xs text-slate-500 mt-1 font-semibold">Gross merchandise volume</p>
          </div>

          <!-- Active Restaurants -->
          <div class="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Active Partners</span>
              <span class="p-2 rounded-xl bg-orange-500/10 text-orange-500 text-lg">🍕</span>
            </div>
            <div class="text-3xl font-extrabold text-slate-800 dark:text-white">{{ activeRestaurantsCount() }}</div>
            <p class="text-xs text-slate-500 mt-1 font-semibold">Out of {{ restaurants().length }} total registered</p>
          </div>

          <!-- Registered Couriers -->
          <div class="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Active Couriers</span>
              <span class="p-2 rounded-xl bg-blue-500/10 text-blue-500 text-lg">🛵</span>
            </div>
            <div class="text-3xl font-extrabold text-slate-800 dark:text-white">{{ uniqueDriversCount() }}</div>
            <p class="text-xs text-blue-600 mt-1 font-semibold">Assigned fleet drivers</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Section 1: Restaurant Approvals & Status (2 cols) -->
          <div class="lg:col-span-2 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-xl font-bold text-slate-800 dark:text-white">Restaurant Partners</h3>
                <p class="text-sm text-slate-500">Enable or disable restaurant ordering operations</p>
              </div>
            </div>

            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
              <div class="overflow-x-auto">
                <table class="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead class="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase font-semibold text-slate-400 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th class="py-3 px-4">Restaurant</th>
                      <th class="py-3 px-4">Cuisine</th>
                      <th class="py-3 px-4">Address</th>
                      <th class="py-3 px-4">Status</th>
                      <th class="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                    @for (res of restaurants(); track res.id) {
                      <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <td class="py-3 px-4 font-bold text-slate-800 dark:text-white">
                          {{ res.name }}
                        </td>
                        <td class="py-3 px-4">
                          <span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                            {{ res.cuisineType }}
                          </span>
                        </td>
                        <td class="py-3 px-4 text-xs text-slate-500 max-w-xs truncate">
                          {{ res.address }}
                        </td>
                        <td class="py-3 px-4">
                          <span
                            class="px-2.5 py-1 text-xs font-bold rounded-full"
                            [class]="res.open
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'">
                            {{ res.open ? 'Active / Open' : 'Disabled / Closed' }}
                          </span>
                        </td>
                        <td class="py-3 px-4 text-right">
                          <button
                            (click)="toggleRestaurantStatus(res)"
                            class="px-3 py-1.5 text-xs font-bold rounded-xl transition-all"
                            [class]="res.open
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'">
                            {{ res.open ? 'Disable' : 'Enable' }}
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Section 2: Platform Coupon Creator (1 col) -->
          <div class="space-y-4">
            <div>
              <h3 class="text-xl font-bold text-slate-800 dark:text-white">Coupon Creator</h3>
              <p class="text-sm text-slate-500">Launch promotional discount codes</p>
            </div>

            <div class="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <form [formGroup]="couponForm" (ngSubmit)="createCoupon()" class="space-y-4">
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Coupon Code</label>
                  <input
                    formControlName="code"
                    type="text"
                    placeholder="e.g. FLASH20"
                    class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40">
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Type</label>
                    <select
                      formControlName="discountType"
                      class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40">
                      <option [value]="DiscountType.PERCENTAGE">Percentage (%)</option>
                      <option [value]="DiscountType.FIXED_AMOUNT">Fixed ($)</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Value</label>
                    <input
                      formControlName="discountValue"
                      type="number"
                      step="1"
                      placeholder="20"
                      class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40">
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Minimum Order ($)</label>
                  <input
                    formControlName="minOrderAmount"
                    type="number"
                    step="1"
                    placeholder="15"
                    class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40">
                </div>

                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Expiry Date</label>
                  <input
                    formControlName="expiryDate"
                    type="date"
                    class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40">
                </div>

                <button
                  type="submit"
                  [disabled]="couponForm.invalid"
                  class="w-full py-3 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-colors text-sm">
                  Create Coupon
                </button>
              </form>
            </div>

            <!-- Existing Coupons List -->
            <div class="space-y-2">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Active Coupons</h4>
              @for (c of coupons(); track c.id) {
                <div class="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <div>
                    <span class="font-mono font-bold text-slate-800 dark:text-white">{{ c.code }}</span>
                    <span class="text-slate-400 ml-2">
                      ({{ c.discountType === DiscountType.PERCENTAGE ? c.discountValue + '%' : '$' + c.discountValue }} off)
                    </span>
                  </div>
                  <span class="px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                    Active
                  </span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private readonly restaurantService = inject(RestaurantService);
  private readonly orderService = inject(OrderService);
  private readonly couponService = inject(CouponService);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly restaurants = signal<Restaurant[]>([]);
  readonly orders = signal<Order[]>([]);
  readonly coupons = signal<Coupon[]>([]);

  readonly DiscountType = DiscountType;

  readonly platformRevenue = computed(() =>
    this.orders().reduce((sum, o) => sum + (o.totalAmount || 0), 0)
  );
  readonly activeRestaurantsCount = computed(() =>
    this.restaurants().filter(r => r.open).length
  );
  readonly uniqueDriversCount = computed(() => {
    const drivers = new Set(this.orders().filter(o => o.driverId).map(o => o.driverId));
    return Math.max(drivers.size, 3);
  });

  readonly couponForm = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(3)]],
    discountType: [DiscountType.PERCENTAGE, [Validators.required]],
    discountValue: [15, [Validators.required, Validators.min(1)]],
    minOrderAmount: [20, [Validators.required, Validators.min(0)]],
    expiryDate: ['2027-12-31', [Validators.required]],
    active: [true]
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.restaurantService.getAll().subscribe({
      next: (res) => this.restaurants.set(res)
    });

    this.orderService.getAll().subscribe({
      next: (orders) => this.orders.set(orders)
    });

    this.couponService.getAll().subscribe({
      next: (coupons) => this.coupons.set(coupons)
    });
  }

  toggleRestaurantStatus(res: Restaurant): void {
    const updated = {
      name: res.name,
      description: res.description,
      address: res.address,
      phone: res.phone,
      cuisineType: res.cuisineType,
      open: !res.open
    };

    this.restaurantService.update(res.id, updated).subscribe({
      next: (val) => {
        this.restaurants.update(list => list.map(r => r.id === val.id ? val : r));
        this.toastService.info('Partner Status Updated', `${val.name} is now ${val.open ? 'Active' : 'Disabled'}`);
      },
      error: () => this.toastService.error('Error', 'Failed to update restaurant status.')
    });
  }

  createCoupon(): void {
    if (this.couponForm.invalid) return;

    const val = this.couponForm.getRawValue();
    this.couponService.create({
      code: val.code.toUpperCase(),
      discountType: val.discountType,
      discountValue: val.discountValue,
      minOrderAmount: val.minOrderAmount,
      expiryDate: val.expiryDate,
      active: true
    }).subscribe({
      next: (created) => {
        this.coupons.update(list => [...list, created]);
        this.toastService.success('Coupon Created', `Promo code ${created.code} is now live!`);
        this.couponForm.reset({
          code: '',
          discountType: DiscountType.PERCENTAGE,
          discountValue: 15,
          minOrderAmount: 20,
          expiryDate: '2027-12-31',
          active: true
        });
      },
      error: () => this.toastService.error('Error', 'Failed to create coupon.')
    });
  }
}
