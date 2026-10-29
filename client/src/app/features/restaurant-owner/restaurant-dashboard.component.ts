import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrderService } from '../../core/services/order.service';
import { MenuService } from '../../core/services/menu.service';
import { RestaurantService } from '../../core/services/restaurant.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { MenuItem, Order, OrderStatus, Restaurant } from '../../core/models';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { getDishImage, PRESET_DISH_IMAGES } from '../../core/utils/asset-helpers';
import { fadeAnimation } from '../../shared/animations/animations';

@Component({
  selector: 'app-restaurant-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalComponent],
  animations: [fadeAnimation],
  template: `
    <div @fadeAnimation class="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div class="max-w-7xl mx-auto">
        <!-- Dashboard Top Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl">
                👨‍🍳
              </div>
              <div>
                <h1 class="text-3xl font-extrabold text-slate-800 dark:text-white">Restaurant Dashboard</h1>
                <p class="text-slate-500 dark:text-slate-400 text-sm">
                  Manage live kitchen orders and restaurant menu
                </p>
              </div>
            </div>
          </div>

          <!-- Restaurant Selector / Status -->
          <div class="flex items-center gap-3">
            @if (myRestaurants().length > 1) {
              <select
                [ngModel]="selectedRestaurantId()"
                (ngModelChange)="onRestaurantChange($event)"
                class="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/30">
                @for (res of myRestaurants(); track res.id) {
                  <option [value]="res.id">{{ res.name }}</option>
                }
              </select>
            }

            <button
              (click)="refreshData()"
              class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:border-primary hover:text-primary transition-colors text-sm font-semibold shadow-sm">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        <!-- Dashboard Navigation Tabs -->
        <div class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mb-8">
          <button
            (click)="activeTab.set('orders')"
            class="pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2"
            [class]="activeTab() === 'orders' ? 'border-primary text-primary' : 'border-transparent text-slate-500 dark:text-slate-400'">
            <span>🍳 Kitchen Orders</span>
            <span class="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
              {{ activeOrdersCount() }}
            </span>
          </button>

          <button
            (click)="activeTab.set('menu')"
            class="pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2"
            [class]="activeTab() === 'menu' ? 'border-primary text-primary' : 'border-transparent text-slate-500 dark:text-slate-400'">
            <span>📋 Menu Management</span>
            <span class="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {{ menuItems().length }}
            </span>
          </button>
        </div>

        <!-- Tab 1: Live Kitchen Kanban Board -->
        @if (activeTab() === 'orders') {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <!-- Column 1: New Orders (PLACED) -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
              <div class="p-4 bg-amber-50/70 dark:bg-amber-950/20 border-b border-amber-100 dark:border-amber-900/30 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-amber-500 animate-ping"></span>
                  <h3 class="font-bold text-slate-800 dark:text-white">New Orders</h3>
                </div>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                  {{ placedOrders().length }}
                </span>
              </div>

              <div class="p-4 space-y-3 flex-1 overflow-y-auto max-h-[70vh]">
                @for (order of placedOrders(); track order.id) {
                  <div class="p-4 rounded-xl border border-amber-200/80 dark:border-amber-800/40 bg-amber-50/30 dark:bg-amber-950/10 shadow-sm space-y-3">
                    <div class="flex items-start justify-between">
                      <div>
                        <span class="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">#{{ order.id.substring(0, 8).toUpperCase() }}</span>
                        <h4 class="font-bold text-slate-800 dark:text-white text-base">{{ order.customerName }}</h4>
                        <p class="text-xs text-slate-500">📞 {{ order.customerPhone }}</p>
                      </div>
                      <span class="text-sm font-extrabold text-primary">\${{ order.totalAmount.toFixed(2) }}</span>
                    </div>

                    <!-- Items List -->
                    <div class="space-y-1 bg-white/60 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-xs">
                      @for (item of order.items; track item.menuItemId) {
                        <div class="flex justify-between items-start">
                          <span class="font-medium text-slate-700 dark:text-slate-300">
                            {{ item.quantity }}x {{ item.menuItemName }}
                          </span>
                          <span class="text-slate-400">\${{ (item.unitPrice * item.quantity).toFixed(2) }}</span>
                        </div>
                        @if (item.specialInstructions) {
                          <p class="text-[11px] text-amber-600 dark:text-amber-400 italic">"{{ item.specialInstructions }}"</p>
                        }
                      }
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex gap-2 pt-1">
                      <button
                        (click)="advanceStatus(order.id, OrderStatus.PREPARING)"
                        class="flex-1 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm">
                        ✓ Accept & Cook
                      </button>
                      <button
                        (click)="advanceStatus(order.id, OrderStatus.CANCELLED)"
                        class="px-3 py-2 text-xs font-semibold bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950/40 dark:text-red-300 rounded-lg transition-colors">
                        Decline
                      </button>
                    </div>
                  </div>
                } @empty {
                  <div class="text-center py-12 text-slate-400 text-sm">
                    No new orders right now
                  </div>
                }
              </div>
            </div>

            <!-- Column 2: In the Kitchen (PREPARING) -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
              <div class="p-4 bg-orange-50/70 dark:bg-orange-950/20 border-b border-orange-100 dark:border-orange-900/30 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-primary"></span>
                  <h3 class="font-bold text-slate-800 dark:text-white">In the Kitchen</h3>
                </div>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-900/40 text-primary">
                  {{ preparingOrders().length }}
                </span>
              </div>

              <div class="p-4 space-y-3 flex-1 overflow-y-auto max-h-[70vh]">
                @for (order of preparingOrders(); track order.id) {
                  <div class="p-4 rounded-xl border border-orange-200/80 dark:border-orange-800/40 bg-orange-50/20 dark:bg-orange-950/10 shadow-sm space-y-3">
                    <div class="flex items-start justify-between">
                      <div>
                        <span class="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">#{{ order.id.substring(0, 8).toUpperCase() }}</span>
                        <h4 class="font-bold text-slate-800 dark:text-white text-base">{{ order.customerName }}</h4>
                        <p class="text-xs text-slate-500">📍 {{ order.deliveryAddress }}</p>
                      </div>
                      <span class="text-sm font-extrabold text-primary">\${{ order.totalAmount.toFixed(2) }}</span>
                    </div>

                    <div class="space-y-1 bg-white/60 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-xs">
                      @for (item of order.items; track item.menuItemId) {
                        <div class="flex justify-between items-start">
                          <span class="font-medium text-slate-700 dark:text-slate-300">
                            {{ item.quantity }}x {{ item.menuItemName }}
                          </span>
                        </div>
                        @if (item.specialInstructions) {
                          <p class="text-[11px] text-primary italic">Note: {{ item.specialInstructions }}</p>
                        }
                      }
                    </div>

                    <button
                      (click)="advanceStatus(order.id, OrderStatus.READY_FOR_PICKUP)"
                      class="w-full py-2.5 text-xs font-bold bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1.5">
                      <span>📦 Mark Ready for Pickup</span>
                    </button>
                  </div>
                } @empty {
                  <div class="text-center py-12 text-slate-400 text-sm">
                    No orders being cooked
                  </div>
                }
              </div>
            </div>

            <!-- Column 3: Ready & Dispatched -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
              <div class="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <h3 class="font-bold text-slate-800 dark:text-white">Ready / Dispatched</h3>
                </div>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                  {{ readyOrders().length }}
                </span>
              </div>

              <div class="p-4 space-y-3 flex-1 overflow-y-auto max-h-[70vh]">
                @for (order of readyOrders(); track order.id) {
                  <div class="p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/40 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm space-y-2">
                    <div class="flex items-start justify-between">
                      <div>
                        <span class="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">#{{ order.id.substring(0, 8).toUpperCase() }}</span>
                        <h4 class="font-bold text-slate-800 dark:text-white text-base">{{ order.customerName }}</h4>
                        <span class="inline-block mt-1 px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          {{ order.status.replace('_', ' ') }}
                        </span>
                      </div>
                      <span class="text-sm font-extrabold text-emerald-600">\${{ order.totalAmount.toFixed(2) }}</span>
                    </div>

                    @if (order.driverName) {
                      <div class="p-2 rounded-lg bg-emerald-100/50 dark:bg-emerald-900/30 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <span>🛵 Driver:</span>
                        <span class="font-bold">{{ order.driverName }}</span>
                      </div>
                    } @else {
                      <p class="text-xs text-slate-400 italic">Waiting for delivery driver pickup...</p>
                    }
                  </div>
                } @empty {
                  <div class="text-center py-12 text-slate-400 text-sm">
                    No orders waiting for pickup
                  </div>
                }
              </div>
            </div>

          </div>
        }

        <!-- Tab 2: Menu Management -->
        @if (activeTab() === 'menu') {
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-xl font-bold text-slate-800 dark:text-white">Dish Catalog</h3>
                <p class="text-sm text-slate-500">Edit prices, toggle stock availability, or add new dishes.</p>
              </div>

              <button
                (click)="openAddDishModal()"
                class="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5">
                <span class="text-lg leading-none">+</span> Add New Dish
              </button>
            </div>

            <!-- Menu Table -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
              <div class="overflow-x-auto">
                <table class="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead class="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th class="py-3 px-4">Item</th>
                      <th class="py-3 px-4">Category</th>
                      <th class="py-3 px-4">Price ($)</th>
                      <th class="py-3 px-4">Availability</th>
                      <th class="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                    @for (dish of menuItems(); track dish.id) {
                      <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <td class="py-3 px-4">
                          <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0 shadow-sm border border-slate-200 dark:border-slate-700">
                              <img [src]="getDishImage(dish.name, dish.imageUrl)" [alt]="dish.name" class="w-full h-full object-cover">
                            </div>
                            <div>
                              <p class="font-bold text-slate-800 dark:text-white">{{ dish.name }}</p>
                              <p class="text-xs text-slate-400 max-w-xs truncate">{{ dish.description }}</p>
                            </div>
                          </div>
                        </td>
                        <td class="py-3 px-4 font-medium">
                          <span class="px-2.5 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {{ dish.category }}
                          </span>
                        </td>
                        <td class="py-3 px-4">
                          <div class="flex items-center gap-1">
                            <span class="text-slate-400 font-semibold">$</span>
                            <input
                              type="number"
                              step="0.5"
                              [value]="dish.price"
                              (change)="onPriceBlur(dish, $event)"
                              class="w-20 px-2 py-1 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-white focus:ring-1 focus:ring-primary">
                          </div>
                        </td>
                        <td class="py-3 px-4">
                          <button
                            (click)="toggleDishAvailability(dish)"
                            class="px-3 py-1 text-xs font-bold rounded-full transition-all"
                            [class]="dish.available
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'">
                            {{ dish.available ? '● Available' : '○ Sold Out' }}
                          </button>
                        </td>
                        <td class="py-3 px-4 text-right">
                          <button
                            (click)="deleteDish(dish.id)"
                            class="text-xs font-semibold text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors">
                            Delete
                          </button>
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="5" class="py-8 text-center text-slate-400 text-sm">
                          No menu items found. Click "+ Add New Dish" above.
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Modal for Adding New Dish -->
    <app-modal
      [isOpen]="isAddModalOpen()"
      title="Add New Dish to Menu"
      (close)="isAddModalOpen.set(false)">
      <form [formGroup]="dishForm" (ngSubmit)="submitDish()" class="space-y-4">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Dish Name</label>
          <input
            formControlName="name"
            type="text"
            placeholder="e.g. Truffle Mushroom Burger"
            class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40">
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Description</label>
          <textarea
            formControlName="description"
            rows="2"
            placeholder="Ingredients and culinary description..."
            class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"></textarea>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Price ($)</label>
            <input
              formControlName="price"
              type="number"
              step="0.01"
              placeholder="12.99"
              class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40">
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Category</label>
            <input
              formControlName="category"
              type="text"
              placeholder="Burgers, Mains, Drinks..."
              class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40">
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">Preset Food Photos</label>
          <div class="flex gap-2 overflow-x-auto pb-2">
            @for (preset of presetDishImages; track preset.url) {
              <button
                type="button"
                (click)="dishForm.patchValue({ imageUrl: preset.url })"
                class="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all hover:scale-105"
                [class]="dishForm.get('imageUrl')?.value === preset.url ? 'border-primary ring-2 ring-primary/40' : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'"
                [title]="preset.label">
                <img [src]="preset.url" [alt]="preset.label" class="w-full h-full object-cover">
              </button>
            }
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Image URL</label>
          <input
            formControlName="imageUrl"
            type="text"
            placeholder="Selected preset or custom image URL..."
            class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40">
        </div>

        <button
          type="submit"
          [disabled]="dishForm.invalid"
          class="w-full py-3 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-colors text-sm">
          Save Dish
        </button>
      </form>
    </app-modal>
  `
})
export class RestaurantDashboardComponent implements OnInit {
  readonly getDishImage = getDishImage;
  readonly presetDishImages = PRESET_DISH_IMAGES;
  private readonly orderService = inject(OrderService);
  private readonly menuService = inject(MenuService);
  private readonly restaurantService = inject(RestaurantService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly activeTab = signal<'orders' | 'menu'>('orders');
  readonly myRestaurants = signal<Restaurant[]>([]);
  readonly selectedRestaurantId = signal<string>('');
  readonly orders = signal<Order[]>([]);
  readonly menuItems = signal<MenuItem[]>([]);
  readonly isAddModalOpen = signal<boolean>(false);

  readonly OrderStatus = OrderStatus;

  readonly placedOrders = computed(() =>
    this.orders().filter(o => o.status === OrderStatus.PLACED || o.status === OrderStatus.PENDING)
  );
  readonly preparingOrders = computed(() =>
    this.orders().filter(o => o.status === OrderStatus.CONFIRMED || o.status === OrderStatus.PREPARING)
  );
  readonly readyOrders = computed(() =>
    this.orders().filter(o =>
      o.status === OrderStatus.READY_FOR_PICKUP ||
      o.status === OrderStatus.PICKED_UP ||
      o.status === OrderStatus.OUT_FOR_DELIVERY
    )
  );
  readonly activeOrdersCount = computed(() =>
    this.placedOrders().length + this.preparingOrders().length + this.readyOrders().length
  );

  private previousOrderCount = 0;
  private audioContext: AudioContext | null = null;

  readonly dishForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required]],
    price: [9.99, [Validators.required, Validators.min(0.5)]],
    category: ['Mains', [Validators.required]],
    imageUrl: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80', [Validators.required]],
    available: [true]
  });

  ngOnInit(): void {
    this.restaurantService.getAll().subscribe({
      next: (restaurants) => {
        this.myRestaurants.set(restaurants);
        if (restaurants.length > 0) {
          this.selectedRestaurantId.set(restaurants[0].id);
          this.loadOrders();
          this.loadMenu();
        }
      }
    });

    setInterval(() => {
      if (this.selectedRestaurantId()) {
        this.loadOrders(false);
      }
    }, 10000);
  }

  onRestaurantChange(id: string): void {
    this.selectedRestaurantId.set(id);
    this.loadOrders();
    this.loadMenu();
  }

  refreshData(): void {
    this.loadOrders();
    this.loadMenu();
    this.toastService.info('Refreshed', 'Dashboard data updated.');
  }

  loadOrders(notify = true): void {
    const rId = this.selectedRestaurantId();
    if (!rId) return;

    this.orderService.getByRestaurant(rId).subscribe({
      next: (orders) => {
        if (orders.length > this.previousOrderCount && this.previousOrderCount > 0) {
          this.playKitchenBell();
          this.toastService.info('New Order Arrived!', 'A new customer order just came in.');
        }
        this.previousOrderCount = orders.length;
        this.orders.set(orders);
      }
    });
  }

  loadMenu(): void {
    const rId = this.selectedRestaurantId();
    if (!rId) return;

    this.menuService.getByRestaurant(rId).subscribe({
      next: (items) => this.menuItems.set(items)
    });
  }

  advanceStatus(orderId: string, nextStatus: OrderStatus): void {
    this.orderService.updateStatus(orderId, nextStatus).subscribe({
      next: (updated) => {
        this.orders.update(list => list.map(o => o.id === updated.id ? updated : o));
        this.toastService.success('Order Updated', `Order status set to ${nextStatus.replace('_', ' ')}`);
      },
      error: () => this.toastService.error('Error', 'Could not update order status.')
    });
  }

  playKitchenBell(): void {
    try {
      const audio = new Audio('/assets/sounds/kitchen-bell.wav');
      audio.volume = 0.6;
      audio.play().catch(() => {
        this.fallbackWebAudioBell();
      });
    } catch {
      this.fallbackWebAudioBell();
    }
  }

  private fallbackWebAudioBell(): void {
    try {
      const ctx = this.audioContext || new (window.AudioContext || (window as any).webkitAudioContext)();
      this.audioContext = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(830, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn('Audio unavailable', e);
    }
  }

  openAddDishModal(): void {
    this.dishForm.reset({
      name: '',
      description: '',
      price: 9.99,
      category: 'Mains',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80',
      available: true
    });
    this.isAddModalOpen.set(true);
  }

  submitDish(): void {
    const rId = this.selectedRestaurantId();
    if (!rId || this.dishForm.invalid) return;

    const val = this.dishForm.getRawValue();
    this.menuService.create(rId, val).subscribe({
      next: (created) => {
        this.menuItems.update(items => [...items, created]);
        this.isAddModalOpen.set(false);
        this.toastService.success('Dish Added', `${created.name} added to menu!`);
      },
      error: () => this.toastService.error('Error', 'Failed to add dish.')
    });
  }

  onPriceBlur(dish: MenuItem, event: Event): void {
    const input = event.target as HTMLInputElement;
    const newPrice = parseFloat(input.value);
    if (isNaN(newPrice) || newPrice <= 0 || newPrice === dish.price) return;

    const rId = this.selectedRestaurantId();
    this.menuService.update(rId, dish.id, {
      name: dish.name,
      description: dish.description,
      price: newPrice,
      category: dish.category,
      imageUrl: dish.imageUrl,
      available: dish.available
    }).subscribe({
      next: (updated) => {
        this.menuItems.update(list => list.map(d => d.id === updated.id ? updated : d));
        this.toastService.success('Price Updated', `${dish.name} is now $${newPrice.toFixed(2)}`);
      }
    });
  }

  toggleDishAvailability(dish: MenuItem): void {
    const rId = this.selectedRestaurantId();
    const newAvail = !dish.available;

    this.menuService.update(rId, dish.id, {
      name: dish.name,
      description: dish.description,
      price: dish.price,
      category: dish.category,
      imageUrl: dish.imageUrl,
      available: newAvail
    }).subscribe({
      next: (updated) => {
        this.menuItems.update(list => list.map(d => d.id === updated.id ? updated : d));
        this.toastService.info('Availability Changed', `${dish.name} marked as ${newAvail ? 'Available' : 'Sold Out'}`);
      }
    });
  }

  deleteDish(dishId: string): void {
    const rId = this.selectedRestaurantId();
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    this.menuService.delete(rId, dishId).subscribe({
      next: () => {
        this.menuItems.update(list => list.filter(d => d.id !== dishId));
        this.toastService.info('Dish Deleted', 'Dish removed from menu.');
      }
    });
  }
}
