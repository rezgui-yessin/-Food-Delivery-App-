import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { MenuService } from '../../core/services/menu.service';
import { RestaurantService } from '../../core/services/restaurant.service';
import { CouponService } from '../../core/services/coupon.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Category, Coupon, MenuItem, Order, OrderStatus, Restaurant, RestaurantRequest, RestaurantAnalytics } from '../../core/models';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { DashboardLayoutComponent } from '../../shared/components/dashboard-layout/dashboard-layout.component';
import { SimpleChartComponent } from '../../shared/components/simple-chart/simple-chart.component';
import { getDishImage, PRESET_DISH_IMAGES } from '../../core/utils/asset-helpers';
import { fadeAnimation } from '../../shared/animations/animations';

@Component({
  selector: 'app-restaurant-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalComponent, DashboardLayoutComponent, SimpleChartComponent],
  animations: [fadeAnimation],
  template: `
    <app-dashboard-layout>
      <div @fadeAnimation [class.kitchen-mode]="kitchenMode()" class="p-6 max-w-7xl mx-auto space-y-6">
        <!-- Dashboard Top Action Bar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl">
              👨‍🍳
            </div>
            <div>
              <h1 class="text-xl font-extrabold text-slate-800 dark:text-white">Kitchen Operations & Menu</h1>
              <p class="text-slate-500 dark:text-slate-400 text-xs">
                Manage live kitchen orders and menu catalog
              </p>
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
            <button (click)="kitchenMode.set(!kitchenMode())" class="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold">
              {{ kitchenMode() ? 'Exit kitchen mode' : 'Kitchen mode' }}
            </button>
          </div>
        </div>

        <!-- Dashboard Navigation Tabs -->
        <div class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1 overflow-x-auto text-sm font-bold">
          <button
            (click)="activeTab.set('orders')"
            class="pb-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap"
            [class]="activeTab() === 'orders' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'">
            <span>🍳 Kitchen Orders</span>
            <span class="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
              {{ activeOrdersCount() }}
            </span>
          </button>

          <button
            (click)="activeTab.set('menu')"
            class="pb-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap"
            [class]="activeTab() === 'menu' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'">
            <span>📋 Menu Catalog</span>
            <span class="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {{ menuItems().length }}
            </span>
          </button>

          <button
            (click)="activeTab.set('categories')"
            class="pb-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap"
            [class]="activeTab() === 'categories' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'">
            <span>🏷️ Categories</span>
            <span class="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {{ categories().length }}
            </span>
          </button>

          <button
            (click)="activeTab.set('coupons')"
            class="pb-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap"
            [class]="activeTab() === 'coupons' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'">
            <span>🎟️ Coupons</span>
            <span class="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {{ coupons().length }}
            </span>
          </button>

          <button
            (click)="activeTab.set('analytics')"
            class="pb-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap"
            [class]="activeTab() === 'analytics' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'">
            <span>📈 Analytics</span>
          </button>

          <button
            (click)="activeTab.set('settings')"
            class="pb-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap"
            [class]="activeTab() === 'settings' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'">
            <span>⚙️ Settings</span>
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
                      <button (click)="printReceipt(order)" class="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg">Print</button>
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
            <div class="dash-card p-5">
              <div class="flex items-center justify-between mb-3">
                <div><h3 class="font-bold">Categories</h3><p class="text-xs text-slate-500">Organize your menu into reusable categories.</p></div>
                <button (click)="addCategory()" class="px-3 py-2 bg-primary text-white rounded-xl text-xs font-semibold">Add category</button>
              </div>
              <div class="flex flex-wrap gap-2">
                @for (category of categories(); track category.id) {
                  <span class="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-sm">
                    {{ category.name }}
                    <button (click)="editCategory(category)" class="ml-1 text-primary" aria-label="Edit category">Edit</button>
                    <button (click)="deleteCategory(category.id)" class="ml-1 text-red-500" aria-label="Delete category">×</button>
                  </span>
                } @empty { <span class="text-sm text-slate-500">No categories created yet.</span> }
              </div>
            </div>
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
                      <th class="py-3 px-4">Stock / Prep</th>
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
                        <td class="py-3 px-4 text-xs text-slate-500">
                          <span class="px-2.5 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {{ dish.category }}
                          </span>
                        </td>
                        <td class="py-3 px-4">
                          <div class="flex items-center gap-2">
                            <input type="number" min="0" [value]="dish.stockQuantity ?? 0" (change)="updateInventory(dish, $event, 'stockQuantity')" class="w-16 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900">
                            <input type="number" min="1" [value]="dish.preparationTimeMinutes ?? 20" (change)="updateInventory(dish, $event, 'preparationTimeMinutes')" class="w-16 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900">
                          </div>
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
                        <td colspan="6" class="py-8 text-center text-slate-400 text-sm">
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

        @if (activeTab() === 'categories') {
          <div class="dash-card overflow-hidden">
            <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 class="text-xl font-bold">Category Catalog</h3>
                <p class="text-sm text-slate-500">Group your dishes into customer-facing menu sections.</p>
              </div>
              <button
                (click)="addCategory()"
                class="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-sm transition-colors">
                + Add Category
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm">
                <thead class="bg-slate-50 dark:bg-slate-800/60 uppercase font-semibold text-slate-400 text-xs border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th class="py-3 px-5">Name</th>
                    <th class="py-3 px-5">Description</th>
                    <th class="py-3 px-5">Sort Order</th>
                    <th class="py-3 px-5">Status</th>
                    <th class="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  @for (cat of categories(); track cat.id) {
                    <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td class="py-3.5 px-5 font-bold text-slate-800 dark:text-white">{{ cat.name }}</td>
                      <td class="py-3.5 px-5 text-slate-500 text-xs">{{ cat.description || '—' }}</td>
                      <td class="py-3.5 px-5 text-slate-500 text-xs">{{ cat.sortOrder }}</td>
                      <td class="py-3.5 px-5">
                        <span class="px-2 py-0.5 rounded-full text-xs font-bold" [class]="cat.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-600'">
                          {{ cat.active ? 'Active' : 'Hidden' }}
                        </span>
                      </td>
                      <td class="py-3.5 px-5 text-right space-x-2">
                        <button (click)="editCategory(cat)" class="text-xs font-semibold text-primary hover:underline">Edit</button>
                        <button (click)="deleteCategory(cat.id)" class="text-xs font-semibold text-red-500 hover:text-red-700">Delete</button>
                      </td>
                    </tr>
                  } @empty {
                    <tr><td colspan="5" class="p-8 text-center text-slate-400 text-sm">No categories yet. Click "+ Add Category" to create one.</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        @if (activeTab() === 'coupons') {
          <div class="dash-card overflow-hidden">
            <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 class="text-xl font-bold">Restaurant Coupons & Promotions</h3>
                <p class="text-sm text-slate-500">Promotions currently valid for this restaurant.</p>
              </div>
              <button (click)="loadCoupons()" class="text-xs font-semibold text-primary">Refresh</button>
            </div>
            <div class="divide-y divide-slate-100 dark:divide-slate-800">
              @for (coupon of coupons(); track coupon.id) {
                <div class="px-5 py-4 flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3">
                    <span class="font-mono font-bold text-sm px-2.5 py-1 rounded-lg bg-primary/10 text-primary">{{ coupon.code }}</span>
                    <div>
                      <p class="font-semibold text-sm">{{ coupon.discountValue }}{{ coupon.discountType === 'PERCENTAGE' ? '%' : '$' }} off (Min: \${{ coupon.minOrderAmount }})</p>
                      <p class="text-xs text-slate-400">{{ coupon.description || 'Active promotion' }}</p>
                    </div>
                  </div>
                  <button (click)="removeCoupon(coupon)" class="text-xs text-red-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-red-50">Delete</button>
                </div>
              } @empty {
                <p class="p-8 text-center text-sm text-slate-400">No coupons configured for this restaurant.</p>
              }
            </div>
          </div>
        }

        @if (activeTab() === 'analytics') {
          <div class="space-y-6">
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="dash-card p-5"><p class="kpi-label">Daily revenue</p><p class="kpi-value text-2xl font-bold">\${{ analytics()?.dailyRevenue?.toFixed(2) || '0.00' }}</p></div>
              <div class="dash-card p-5"><p class="kpi-label">Weekly orders</p><p class="kpi-value text-2xl font-bold">{{ analytics()?.weeklyOrders || 0 }}</p></div>
              <div class="dash-card p-5"><p class="kpi-label">Average order</p><p class="kpi-value text-2xl font-bold">\${{ analytics()?.averageOrderValue?.toFixed(2) || '0.00' }}</p></div>
              <div class="dash-card p-5"><p class="kpi-label">Delivered</p><p class="kpi-value text-2xl font-bold">{{ deliveredOrders() }}</p></div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="dash-card p-5 space-y-4">
                <h3 class="font-bold text-slate-800 dark:text-white">Top Dish Sales by Volume</h3>
                @if (popularProductsChartLabels().length > 0) {
                  <app-simple-chart
                    [labels]="popularProductsChartLabels()"
                    [values]="popularProductsChartValues()"
                    label="Units Sold" />
                } @else {
                  <p class="text-sm text-slate-400 py-12 text-center">Charts will populate as completed orders accumulate.</p>
                }
              </div>

              <div class="dash-card p-5">
                <h3 class="font-bold mb-4">Popular Dish Breakdown</h3>
                <div class="divide-y divide-slate-100 dark:divide-slate-800">
                  @for (product of analytics()?.popularProducts || []; track product.name) {
                    <div class="flex items-center justify-between text-sm py-3">
                      <div>
                        <p class="font-semibold text-slate-800 dark:text-white">{{ product.name }}</p>
                        <p class="text-xs text-slate-400">\${{ (product.revenue || 0).toFixed(2) }} total revenue</p>
                      </div>
                      <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">{{ product.quantity }} sold</span>
                    </div>
                  } @empty {
                    <p class="text-sm text-slate-500 py-6 text-center">Analytics will appear after orders are completed.</p>
                  }
                </div>
              </div>
            </div>
          </div>
        }

        @if (activeTab() === 'settings') {
          <div class="dash-card max-w-2xl p-6">
            <h3 class="text-xl font-bold mb-1">Restaurant settings</h3>
            <p class="text-sm text-slate-500 mb-6">Update the restaurant profile through the backend API.</p>
            <form [formGroup]="restaurantForm" (ngSubmit)="saveRestaurant()" class="space-y-4">
              <div class="flex items-center gap-4">
                <img [src]="selectedRestaurant()?.imageUrl || '/assets/icons/favicon.svg'" alt="Restaurant logo" class="w-16 h-16 rounded-2xl object-cover border border-slate-200">
                <label class="px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold cursor-pointer">Upload logo
                  <input type="file" accept="image/png,image/jpeg,image/webp" class="hidden" (change)="uploadRestaurantImage($event)">
                </label>
              </div>
              <input formControlName="name" placeholder="Restaurant name" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent">
              <textarea formControlName="description" rows="3" placeholder="Description" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent"></textarea>
              <input formControlName="address" placeholder="Address" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent">
              <div class="grid grid-cols-2 gap-3">
                <input formControlName="phone" placeholder="Phone" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent">
                <input formControlName="cuisineType" placeholder="Cuisine type" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent">
              </div>
              <label class="flex items-center gap-2 text-sm"><input type="checkbox" formControlName="open"> Accepting orders</label>
              <div class="grid grid-cols-2 gap-3">
                @for (day of weekDays; track day) {
                  <label class="text-xs font-semibold capitalize">{{ day }}<input [ngModel]="hours()[day]" (ngModelChange)="setHour(day, $event)" [ngModelOptions]="{standalone: true}" class="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 bg-transparent" placeholder="09:00-22:00"></label>
                }
              </div>
              <button type="submit" [disabled]="restaurantForm.invalid" class="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold disabled:opacity-50">Save changes</button>
            </form>
          </div>
        }
      </div>
    </app-dashboard-layout>

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
export class RestaurantDashboardComponent implements OnInit, OnDestroy {
  readonly getDishImage = getDishImage;
  readonly presetDishImages = PRESET_DISH_IMAGES;
  private readonly orderService = inject(OrderService);
  private readonly menuService = inject(MenuService);
  private readonly restaurantService = inject(RestaurantService);
  private readonly couponService = inject(CouponService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);

  readonly activeTab = signal<'orders' | 'menu' | 'categories' | 'coupons' | 'analytics' | 'settings'>('orders');
  readonly kitchenMode = signal(false);
  readonly myRestaurants = signal<Restaurant[]>([]);
  readonly selectedRestaurantId = signal<string>('');
  readonly orders = signal<Order[]>([]);
  readonly menuItems = signal<MenuItem[]>([]);
  readonly coupons = signal<Coupon[]>([]);
  readonly analytics = signal<RestaurantAnalytics | null>(null);
  readonly categories = signal<Category[]>([]);
  readonly hours = signal<Record<string, string>>({});
  readonly selectedRestaurant = computed(() => this.myRestaurants().find(item => item.id === this.selectedRestaurantId()));
  readonly weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  readonly isAddModalOpen = signal<boolean>(false);
  readonly revenue = computed(() => this.orders().reduce((sum, order) => sum + order.totalAmount, 0));
  readonly deliveredOrders = computed(() => this.orders().filter(order => order.status === OrderStatus.DELIVERED).length);

  readonly popularProductsChartLabels = computed(() =>
    (this.analytics()?.popularProducts || []).map(p => p.name)
  );
  readonly popularProductsChartValues = computed(() =>
    (this.analytics()?.popularProducts || []).map(p => p.quantity)
  );

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
  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  readonly dishForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required]],
    price: [9.99, [Validators.required, Validators.min(0.5)]],
    category: ['Mains', [Validators.required]],
    imageUrl: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80', [Validators.required]],
    available: [true]
  });
  readonly restaurantForm = this.fb.group({
    name: ['', [Validators.required]],
    description: [''],
    address: ['', [Validators.required]],
    phone: ['', [Validators.required]],
    cuisineType: ['', [Validators.required]],
    open: [true]
  });

  ngOnInit(): void {
    this.route.params.subscribe(p => {
      if (p['tab'] === 'menu') {
        this.activeTab.set('menu');
      } else if (p['tab'] === 'orders') {
        this.activeTab.set('orders');
      } else if (p['tab'] === 'categories') {
        this.activeTab.set('categories');
      } else if (p['tab'] === 'analytics') {
        this.activeTab.set('analytics');
      } else if (p['tab'] === 'settings') {
        this.activeTab.set('settings');
      } else if (p['tab'] === 'coupons') {
        this.activeTab.set('coupons');
      }
    });

    this.restaurantService.getAll().subscribe({
      next: (restaurants) => {
        this.myRestaurants.set(restaurants);
        if (restaurants.length > 0) {
          this.selectedRestaurantId.set(restaurants[0].id);
          this.restaurantForm.patchValue(restaurants[0]);
          this.loadOrders();
          this.loadMenu();
          this.loadCoupons();
          this.loadOwnerExtras();
        }
      }
    });

    this.refreshTimer = setInterval(() => {
      if (this.selectedRestaurantId()) {
        this.loadOrders(false);
      }
    }, 10000);
  }

  onRestaurantChange(id: string): void {
    this.selectedRestaurantId.set(id);
    const restaurant = this.myRestaurants().find(item => item.id === id);
    if (restaurant) this.restaurantForm.patchValue(restaurant);
    this.loadOrders();
    this.loadMenu();
    this.loadCoupons();
    this.loadOwnerExtras();
  }

  saveRestaurant(): void {
    const id = this.selectedRestaurantId();
    if (!id || this.restaurantForm.invalid) return;
    this.restaurantService.update(id, this.restaurantForm.getRawValue() as RestaurantRequest).subscribe({
      next: updated => {
        this.myRestaurants.update(list => list.map(item => item.id === updated.id ? updated : item));
        this.toastService.success('Settings saved', 'Restaurant profile updated.');
        this.restaurantService.updateHours(id, this.hours()).subscribe();
      },
      error: error => this.toastService.error('Save failed', error?.error?.message || 'Could not update restaurant profile.')
    });
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

  loadCoupons(): void {
    const rId = this.selectedRestaurantId();
    if (!rId) return;
    this.couponService.getAll(rId).subscribe({
      next: coupons => this.coupons.set(coupons)
    });
  }

  loadOwnerExtras(): void {
    const id = this.selectedRestaurantId();
    if (!id) return;
    this.restaurantService.getAnalytics(id).subscribe({ next: data => this.analytics.set(data) });
    this.restaurantService.getCategories(id).subscribe({ next: data => this.categories.set(data) });
    this.hours.set(this.selectedRestaurant()?.openingHours || {});
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    if (this.audioContext) {
      void this.audioContext.close();
      this.audioContext = null;
    }
  }

  setHour(day: string, value: string): void {
    this.hours.update(current => ({ ...current, [day]: value }));
  }

  uploadRestaurantImage(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    const id = this.selectedRestaurantId();
    if (!file || !id) return;
    this.restaurantService.uploadImage(id, file).subscribe({
      next: updated => {
        this.myRestaurants.update(list => list.map(item => item.id === updated.id ? updated : item));
        this.toastService.success('Logo updated', 'Restaurant branding has been updated.');
      },
      error: error => this.toastService.error('Upload failed', error?.error?.message || 'Could not upload the logo.')
    });
  }

  addCategory(): void {
    const name = window.prompt('Category name');
    const id = this.selectedRestaurantId();
    if (!name?.trim() || !id) return;
    this.restaurantService.createCategory(id, { name: name.trim(), description: '', sortOrder: this.categories().length, active: true }).subscribe({
      next: category => this.categories.update(items => [...items, category]),
      error: error => this.toastService.error('Category failed', error?.error?.message || 'Could not create category.')
    });
  }

  editCategory(category: Category): void {
    const name = window.prompt('Category name', category.name);
    const restaurantId = this.selectedRestaurantId();
    if (!name?.trim() || !restaurantId) return;
    this.restaurantService.updateCategory(restaurantId, category.id, {
      name: name.trim(),
      description: category.description || '',
      sortOrder: category.sortOrder,
      active: category.active
    }).subscribe({
      next: updated => this.categories.update(items => items.map(item => item.id === updated.id ? updated : item)),
      error: error => this.toastService.error('Category failed', error?.error?.message || 'Could not update category.')
    });
  }

  deleteCategory(id: string): void {
    const restaurantId = this.selectedRestaurantId();
    this.restaurantService.deleteCategory(restaurantId, id).subscribe({
      next: () => this.categories.update(items => items.filter(item => item.id !== id)),
      error: error => this.toastService.error('Category failed', error?.error?.message || 'Could not delete category.')
    });
  }

  printReceipt(order: Order): void {
    const lines = order.items.map(item => `${item.quantity}x ${item.name}`).join('\n');
    const receipt = `FoodRush order #${order.id}\nCustomer: ${order.customerName}\nAddress: ${order.deliveryAddress}\n\n${lines}\n\nTotal: $${order.totalAmount.toFixed(2)}`;
    const popup = window.open('', '_blank', 'width=420,height=600');
    if (!popup) return;
    popup.document.write(`<pre style="font:14px monospace;white-space:pre-wrap;padding:24px">${receipt.replace(/</g, '&lt;')}</pre>`);
    popup.document.close();
    popup.print();
  }

  updateInventory(dish: MenuItem, event: Event, field: 'stockQuantity' | 'preparationTimeMinutes'): void {
    const restaurantId = this.selectedRestaurantId();
    if (!restaurantId) return;
    const value = Math.max(0, Number((event.target as HTMLInputElement).value) || 0);
    const request = {
      name: dish.name,
      description: dish.description,
      price: dish.price,
      category: dish.category,
      available: dish.available,
      stockQuantity: field === 'stockQuantity' ? value : (dish.stockQuantity ?? 0),
      preparationTimeMinutes: field === 'preparationTimeMinutes' ? Math.max(1, value) : (dish.preparationTimeMinutes ?? 20),
      sortOrder: dish.sortOrder ?? 0
    };
    this.menuService.update(restaurantId, dish.id, request).subscribe({
      next: updated => this.menuItems.update(items => items.map(item => item.id === updated.id ? updated : item)),
      error: error => this.toastService.error('Inventory failed', error?.error?.message || 'Could not update inventory.')
    });
  }

  removeCoupon(coupon: Coupon): void {
    this.couponService.delete(coupon.id).subscribe({
      next: () => {
        this.coupons.update(list => list.filter(item => item.id !== coupon.id));
        this.toastService.success('Coupon deleted', `${coupon.code} was removed.`);
      },
      error: error => this.toastService.error('Delete failed', error?.error?.message || 'Could not delete coupon.')
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
    const { imageUrl: _imageUrl, ...request } = val;
    this.menuService.create(rId, request).subscribe({
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
      available: dish.available,
      stockQuantity: dish.stockQuantity ?? 0,
      preparationTimeMinutes: dish.preparationTimeMinutes ?? 20,
      sortOrder: dish.sortOrder ?? 0
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
      available: newAvail,
      stockQuantity: dish.stockQuantity ?? 0,
      preparationTimeMinutes: dish.preparationTimeMinutes ?? 20,
      sortOrder: dish.sortOrder ?? 0
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
