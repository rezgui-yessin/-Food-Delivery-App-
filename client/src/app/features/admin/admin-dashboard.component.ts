import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RestaurantService } from '../../core/services/restaurant.service';
import { AdminService } from '../../core/services/admin.service';
import { OrderService } from '../../core/services/order.service';
import { CouponService } from '../../core/services/coupon.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { AdminReport, AdminUser, AuditLog, Coupon, DiscountType, Order, Restaurant, Role, PlatformSettings, OrderStatus, RestaurantRequest, CouponRequest, AdminUserCreateRequest } from '../../core/models';
import { DashboardLayoutComponent } from '../../shared/components/dashboard-layout/dashboard-layout.component';
import { SimpleChartComponent } from '../../shared/components/simple-chart/simple-chart.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { fadeAnimation } from '../../shared/animations/animations';
import { formatDateTime, formatMoney, shortOrderId } from '../../core/utils/order-helpers';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    DashboardLayoutComponent,
    SimpleChartComponent,
    StatusBadgeComponent,
    ModalComponent
  ],
  animations: [fadeAnimation],
  template: `
    <app-dashboard-layout>
      <div @fadeAnimation class="p-6 max-w-7xl mx-auto space-y-6">

        <!-- Top Platform Admin Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl font-bold">
              ⚡
            </div>
            <div>
              <h1 class="text-xl font-extrabold text-slate-800 dark:text-white">Platform Administration</h1>
              <p class="text-slate-500 dark:text-slate-400 text-xs">Full CRUD control across users, partner restaurants, coupons, orders, and financial settings</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              (click)="refreshAll()"
              class="flex items-center gap-2 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-primary transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh
            </button>
            <button
              (click)="exportReport()"
              class="px-3.5 py-2 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition-colors">
              Export CSV
            </button>
            <button
              (click)="printReport()"
              class="px-3.5 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity">
              Print
            </button>
          </div>
        </div>

        <!-- Section Navigation Tabs -->
        <div class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1 overflow-x-auto text-sm font-semibold">
          <button
            (click)="setSection('overview')"
            class="pb-3 px-3.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap"
            [class]="activeSection() === 'overview' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'">
            <span>📊 Overview</span>
          </button>
          <button
            (click)="setSection('users')"
            class="pb-3 px-3.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap"
            [class]="activeSection() === 'users' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'">
            <span>👥 Users & Couriers</span>
            <span class="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{{ users().length }}</span>
          </button>
          <button
            (click)="setSection('restaurants')"
            class="pb-3 px-3.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap"
            [class]="activeSection() === 'restaurants' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'">
            <span>🏪 Restaurants</span>
            <span class="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{{ managedRestaurants().length }}</span>
          </button>
          <button
            (click)="setSection('orders')"
            class="pb-3 px-3.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap"
            [class]="activeSection() === 'orders' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'">
            <span>🛍️ Orders</span>
            <span class="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{{ orders().length }}</span>
          </button>
          <button
            (click)="setSection('coupons')"
            class="pb-3 px-3.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap"
            [class]="activeSection() === 'coupons' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'">
            <span>🎟️ Promo Coupons</span>
            <span class="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{{ coupons().length }}</span>
          </button>
          <button
            (click)="setSection('settings')"
            class="pb-3 px-3.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap"
            [class]="activeSection() === 'settings' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'">
            <span>⚙️ Platform Settings</span>
          </button>
          <button
            (click)="setSection('logs')"
            class="pb-3 px-3.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap"
            [class]="activeSection() === 'logs' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'">
            <span>📜 Audit Logs</span>
            <span class="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{{ auditLogs().length }}</span>
          </button>
        </div>

        <!-- TAB 1: OVERVIEW & KPIS -->
        @if (activeSection() === 'overview' || activeSection() === 'analytics') {
          <div class="space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Gross Merchandise Vol</span>
                  <span class="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 text-lg">💰</span>
                </div>
                <div class="text-2xl font-extrabold text-slate-800 dark:text-white">\${{ platformRevenue().toFixed(2) }}</div>
                <p class="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">15% commission: \${{ (platformRevenue() * (settingsDraft.commissionRate / 100)).toFixed(2) }}</p>
              </div>

              <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Total System Orders</span>
                  <span class="p-2 rounded-xl bg-primary/10 text-primary text-lg">🛍️</span>
                </div>
                <div class="text-2xl font-extrabold text-slate-800 dark:text-white">{{ orders().length }}</div>
                <p class="text-xs text-slate-500 mt-1 font-semibold">{{ deliveredOrdersCount() }} delivered orders</p>
              </div>

              <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Active Merchants</span>
                  <span class="p-2 rounded-xl bg-orange-500/10 text-orange-500 text-lg">🍕</span>
                </div>
                <div class="text-2xl font-extrabold text-slate-800 dark:text-white">{{ activeRestaurantsCount() }} / {{ managedRestaurants().length }}</div>
                <p class="text-xs text-slate-500 mt-1 font-semibold">Partner restaurants onboarded</p>
              </div>

              <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Active Couriers</span>
                  <span class="p-2 rounded-xl bg-blue-500/10 text-blue-500 text-lg">🛵</span>
                </div>
                <div class="text-2xl font-extrabold text-slate-800 dark:text-white">{{ couriersCount() }}</div>
                <p class="text-xs text-blue-600 mt-1 font-semibold">Couriers registered in fleet</p>
              </div>
            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div class="flex items-center justify-between">
                  <h3 class="font-bold text-slate-800 dark:text-white">Revenue by Restaurant</h3>
                  <span class="text-xs text-slate-400 font-semibold">USD</span>
                </div>
                <app-simple-chart
                  [labels]="chartLabels()"
                  [values]="chartValues()"
                  label="Sales ($)" />
              </div>

              <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div class="flex items-center justify-between">
                  <h3 class="font-bold text-slate-800 dark:text-white">Order Status Distribution</h3>
                  <span class="text-xs text-slate-400 font-semibold">{{ orders().length }} orders</span>
                </div>
                <div class="space-y-3 pt-2">
                  @for (stat of orderStatusBreakdown(); track stat.status) {
                    <div>
                      <div class="flex justify-between text-xs font-semibold mb-1">
                        <span class="text-slate-600 dark:text-slate-300">{{ stat.label }}</span>
                        <span class="text-slate-800 dark:text-white font-bold">{{ stat.count }} ({{ stat.percentage }}%)</span>
                      </div>
                      <div class="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div class="h-full rounded-full transition-all" [class]="stat.colorClass" [style.width.%]="stat.percentage"></div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        }

        <!-- TAB 2: USER & DRIVER CRUD -->
        @if (activeSection() === 'users') {
          <div class="space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <h2 class="text-lg font-bold text-slate-800 dark:text-white">User & Courier Management</h2>
                <p class="text-xs text-slate-500">Create, view, update roles, toggle approval, and manage account statuses.</p>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <input
                  [(ngModel)]="userQuery"
                  (ngModelChange)="loadUsers()"
                  placeholder="Search name or email..."
                  class="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-800 dark:text-white">
                <select
                  [(ngModel)]="selectedRoleFilter"
                  (ngModelChange)="loadUsers()"
                  class="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white">
                  <option value="">All Roles</option>
                  @for (role of roles; track role) {
                    <option [value]="role">{{ role }}</option>
                  }
                </select>
                <button
                  (click)="openCreateUserModal()"
                  class="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors">
                  + Add User
                </button>
              </div>
            </div>

            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead class="bg-slate-50 dark:bg-slate-800/60 uppercase font-semibold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th class="py-3 px-4">User</th>
                      <th class="py-3 px-4">Role</th>
                      <th class="py-3 px-4">Courier Info</th>
                      <th class="py-3 px-4">Status & Approval</th>
                      <th class="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    @for (user of users(); track user.id) {
                      <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td class="py-3.5 px-4">
                          <p class="font-bold text-slate-800 dark:text-white text-sm">{{ user.fullName }}</p>
                          <p class="text-slate-400 text-xs">{{ user.email }} • {{ user.phone || 'No phone' }}</p>
                        </td>
                        <td class="py-3.5 px-4">
                          <span class="px-2.5 py-1 rounded-lg text-[11px] font-bold"
                            [class]="user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : (user.role === 'RESTAURANT_OWNER' ? 'bg-amber-100 text-amber-700' : (user.role === 'DELIVERY_DRIVER' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'))">
                            {{ user.role }}
                          </span>
                        </td>
                        <td class="py-3.5 px-4">
                          @if (user.role === 'DELIVERY_DRIVER') {
                            <div class="text-[11px]">
                              <p class="font-semibold text-slate-700 dark:text-slate-200">🛵 {{ user.vehicleType || 'Not set' }}</p>
                              <p class="text-slate-400">Plate: {{ user.vehiclePlate || 'N/A' }}</p>
                              <span class="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold" [class]="user.driverAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'">
                                {{ user.driverAvailable ? 'Online' : 'Offline' }}
                              </span>
                            </div>
                          } @else {
                            <span class="text-slate-400">—</span>
                          }
                        </td>
                        <td class="py-3.5 px-4 space-x-1">
                          <span
                            class="px-2 py-0.5 rounded text-[10px] font-bold"
                            [class]="user.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'">
                            {{ user.active ? 'Active' : 'Suspended' }}
                          </span>
                          <span
                            class="px-2 py-0.5 rounded text-[10px] font-bold"
                            [class]="user.approved ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'">
                            {{ user.approved ? 'Approved' : 'Pending' }}
                          </span>
                        </td>
                        <td class="py-3.5 px-4 text-right space-x-2">
                          <button
                            (click)="openEditUserModal(user)"
                            class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors">
                            Edit
                          </button>
                          <button
                            (click)="toggleUser(user)"
                            class="px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors"
                            [class]="user.active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'">
                            {{ user.active ? 'Suspend' : 'Activate' }}
                          </button>
                          <button
                            (click)="deleteUser(user)"
                            class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                            Delete
                          </button>
                        </td>
                      </tr>
                    } @empty {
                      <tr><td colspan="5" class="p-6 text-center text-slate-400">No users match your criteria.</td></tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }

        <!-- TAB 3: RESTAURANT CRUD -->
        @if (activeSection() === 'restaurants') {
          <div class="space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <h2 class="text-lg font-bold text-slate-800 dark:text-white">Partner Restaurants (CRUD)</h2>
                <p class="text-xs text-slate-500">Create restaurants, edit metadata, delete stores, and control operational status.</p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  (click)="openCreateRestaurantModal()"
                  class="px-3.5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-colors shadow">
                  + Add Restaurant
                </button>
                <button (click)="exportRestaurants()" class="px-3.5 py-2 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 rounded-xl text-xs font-semibold">
                  Export CSV
                </button>
              </div>
            </div>

            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead class="bg-slate-50 dark:bg-slate-800/60 uppercase font-semibold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th class="py-3 px-4">Restaurant</th>
                      <th class="py-3 px-4">Cuisine & Fee</th>
                      <th class="py-3 px-4">Address & Phone</th>
                      <th class="py-3 px-4">Approval</th>
                      <th class="py-3 px-4">Status</th>
                      <th class="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    @for (res of managedRestaurants(); track res.id) {
                      <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td class="py-3.5 px-4">
                          <div class="flex items-center gap-3">
                            <img [src]="res.imageUrl || '/assets/icons/favicon.svg'" alt="" class="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700">
                            <div>
                              <p class="font-bold text-slate-800 dark:text-white text-sm">{{ res.name }}</p>
                              <span class="text-amber-500 font-bold">★ {{ res.rating || 0 }}</span>
                            </div>
                          </div>
                        </td>
                        <td class="py-3.5 px-4">
                          <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold text-[10px]">{{ res.cuisineType }}</span>
                          <p class="text-slate-400 text-[11px] mt-1">Fee: \${{ res.deliveryFee }} · {{ res.deliveryTimeMin }}-{{ (res.deliveryTimeMin || 25) + 10 }} min</p>
                        </td>
                        <td class="py-3.5 px-4 max-w-xs truncate text-slate-500">
                          <p class="truncate">{{ res.address }}</p>
                          <p class="text-[11px] text-slate-400">{{ res.phone }}</p>
                        </td>
                        <td class="py-3.5 px-4">
                          <button
                            (click)="approveRestaurant(res)"
                            class="px-2 py-0.5 rounded-full text-[10px] font-bold transition-all"
                            [class]="res.approved ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'">
                            {{ res.approved ? 'Approved ✓' : 'Pending Review' }}
                          </button>
                        </td>
                        <td class="py-3.5 px-4">
                          <button
                            (click)="toggleRestaurantStatus(res)"
                            class="px-2 py-0.5 rounded-full text-[10px] font-bold transition-all"
                            [class]="res.open ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'">
                            {{ res.open ? 'Open' : 'Closed' }}
                          </button>
                        </td>
                        <td class="py-3.5 px-4 text-right space-x-2">
                          <button
                            (click)="openEditRestaurantModal(res)"
                            class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors">
                            Edit
                          </button>
                          <button
                            (click)="deleteRestaurant(res)"
                            class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors">
                            Delete
                          </button>
                        </td>
                      </tr>
                    } @empty {
                      <tr><td colspan="6" class="p-6 text-center text-slate-400">No restaurants found. Click "+ Add Restaurant" to create one.</td></tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }

        <!-- TAB 4: ORDERS & STATUS ADVANCEMENT -->
        @if (activeSection() === 'orders') {
          <div class="space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <h2 class="text-lg font-bold text-slate-800 dark:text-white">Order Operations & Refunds</h2>
                <p class="text-xs text-slate-500">Inspect full customer orders, update order lifecycle statuses, or issue instant test refunds.</p>
              </div>
              <div class="flex items-center gap-2">
                <input
                  [(ngModel)]="orderSearchQuery"
                  placeholder="Search order ID or customer..."
                  class="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs w-60 text-slate-800 dark:text-white">
              </div>
            </div>

            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead class="bg-slate-50 dark:bg-slate-800/60 uppercase font-semibold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th class="py-3 px-4">Order ID</th>
                      <th class="py-3 px-4">Customer</th>
                      <th class="py-3 px-4">Amount</th>
                      <th class="py-3 px-4">Payment</th>
                      <th class="py-3 px-4">Status & Update</th>
                      <th class="py-3 px-4">Placed At</th>
                      <th class="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    @for (order of filteredOrders(); track order.id) {
                      <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td class="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-white">
                          #{{ shortOrderId(order.id) }}
                        </td>
                        <td class="py-3.5 px-4">
                          <p class="font-semibold text-slate-800 dark:text-white">{{ order.customerName }}</p>
                          <p class="text-slate-400 text-[11px] truncate max-w-[180px]">{{ order.deliveryAddress }}</p>
                        </td>
                        <td class="py-3.5 px-4 font-extrabold text-slate-800 dark:text-white">
                          {{ formatMoney(order.totalAmount) }}
                        </td>
                        <td class="py-3.5 px-4">
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold"
                            [class]="order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : (order.paymentStatus === 'REFUNDED' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700')">
                            {{ order.paymentStatus }}
                          </span>
                        </td>
                        <td class="py-3.5 px-4">
                          <select
                            [ngModel]="order.status"
                            (ngModelChange)="updateOrderStatus(order.id, $event)"
                            class="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-semibold">
                            @for (st of getOrderStatusOptions(order.status); track st) {
                              <option [value]="st">{{ st }}</option>
                            }
                          </select>
                        </td>
                        <td class="py-3.5 px-4 text-slate-400">
                          {{ formatDateTime(order.createdAt) }}
                        </td>
                        <td class="py-3.5 px-4 text-right space-x-2">
                          <button
                            (click)="openOrderDetails(order)"
                            class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors">
                            Details
                          </button>
                          @if (order.paymentStatus === 'PAID') {
                            <button
                              (click)="refund(order)"
                              class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors">
                              Refund
                            </button>
                          }
                        </td>
                      </tr>
                    } @empty {
                      <tr><td colspan="7" class="p-6 text-center text-slate-400">No orders match your filter.</td></tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }

        <!-- TAB 5: COUPONS CRUD -->
        @if (activeSection() === 'coupons') {
          <div class="space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <h2 class="text-lg font-bold text-slate-800 dark:text-white">Promotional Coupons (CRUD)</h2>
                <p class="text-xs text-slate-500">Create, edit, toggle, or delete platform promo codes.</p>
              </div>
              <button
                (click)="openCreateCouponModal()"
                class="px-3.5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-colors shadow">
                + Create Coupon
              </button>
            </div>

            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead class="bg-slate-50 dark:bg-slate-800/60 uppercase font-semibold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th class="py-3 px-4">Coupon Code</th>
                      <th class="py-3 px-4">Discount</th>
                      <th class="py-3 px-4">Min Order</th>
                      <th class="py-3 px-4">Usage</th>
                      <th class="py-3 px-4">Expiry Date</th>
                      <th class="py-3 px-4">Status</th>
                      <th class="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    @for (c of coupons(); track c.id) {
                      <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td class="py-3.5 px-4 font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">
                          {{ c.code }}
                        </td>
                        <td class="py-3.5 px-4 font-semibold text-slate-800 dark:text-white">
                          {{ c.discountType === DiscountType.PERCENTAGE ? c.discountValue + '%' : '$' + c.discountValue }} off
                        </td>
                        <td class="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          \${{ c.minOrderAmount }}
                        </td>
                        <td class="py-3.5 px-4 text-slate-500">
                          {{ c.usageCount || 0 }} {{ c.maxUsageCount ? '/ ' + c.maxUsageCount : 'used' }}
                        </td>
                        <td class="py-3.5 px-4 text-slate-400">
                          {{ c.expiryDate | date:'mediumDate' }}
                        </td>
                        <td class="py-3.5 px-4">
                          <button
                            (click)="toggleCouponActive(c)"
                            class="px-2 py-0.5 rounded-full text-[10px] font-bold transition-all"
                            [class]="c.active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'">
                            {{ c.active ? 'Active' : 'Disabled' }}
                          </button>
                        </td>
                        <td class="py-3.5 px-4 text-right space-x-2">
                          <button
                            (click)="openEditCouponModal(c)"
                            class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors">
                            Edit
                          </button>
                          <button
                            (click)="deleteCoupon(c)"
                            class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors">
                            Delete
                          </button>
                        </td>
                      </tr>
                    } @empty {
                      <tr><td colspan="7" class="p-6 text-center text-slate-400">No promo coupons created. Click "+ Create Coupon" above.</td></tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }

        <!-- TAB 6: SETTINGS -->
        @if (activeSection() === 'settings') {
          <div class="max-w-2xl bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <h2 class="text-lg font-bold text-slate-800 dark:text-white">Platform Settings & Financial Controls</h2>
              <p class="text-xs text-slate-500">Configure global transaction commission and currency for partner payouts.</p>
            </div>

            <div class="space-y-4 text-xs">
              <div>
                <label class="block font-bold uppercase tracking-wider text-slate-500 mb-1">Platform Commission Rate (%)</label>
                <div class="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    [(ngModel)]="settingsDraft.commissionRate"
                    class="w-32 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-800 dark:text-white">
                  <span class="text-slate-400">Standard commission deducted from merchant transactions</span>
                </div>
              </div>

              <div>
                <label class="block font-bold uppercase tracking-wider text-slate-500 mb-1">Platform Currency Code</label>
                <input
                  type="text"
                  maxlength="3"
                  [(ngModel)]="settingsDraft.currency"
                  class="w-32 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold uppercase text-slate-800 dark:text-white">
              </div>

              <div class="pt-2">
                <button
                  (click)="saveSettings()"
                  class="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow transition-colors">
                  Save Platform Settings
                </button>
              </div>
            </div>
          </div>
        }

        <!-- TAB 7: AUDIT LOGS -->
        @if (activeSection() === 'logs') {
          <div class="space-y-4">
            <div class="flex items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <h2 class="text-lg font-bold text-slate-800 dark:text-white">Platform Security & Audit Trail</h2>
                <p class="text-xs text-slate-500">Immutable record of all administrative, merchant, and courier events.</p>
              </div>
              <button (click)="loadAdminData()" class="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-primary">
                Refresh Logs
              </button>
            </div>

            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead class="bg-slate-50 dark:bg-slate-800/60 uppercase font-semibold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th class="py-3 px-4">Timestamp</th>
                      <th class="py-3 px-4">Action</th>
                      <th class="py-3 px-4">Target Entity</th>
                      <th class="py-3 px-4">Details</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    @for (log of auditLogs(); track log.id) {
                      <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td class="py-3 px-4 text-slate-400 whitespace-nowrap">{{ log.createdAt | date:'short' }}</td>
                        <td class="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">{{ log.action }}</td>
                        <td class="py-3 px-4 text-slate-700 dark:text-slate-200">{{ log.targetType }} #{{ log.targetId.substring(0, 8) }}</td>
                        <td class="py-3 px-4 font-sans text-slate-500">{{ log.details || 'System event recorded' }}</td>
                      </tr>
                    } @empty {
                      <tr><td colspan="4" class="p-6 text-center text-slate-400 font-sans">No audit logs recorded yet.</td></tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }

      </div>
    </app-dashboard-layout>

    <!-- MODAL 1: Create User -->
    <app-modal [isOpen]="isCreateUserModalOpen()" title="Create New Platform User" (close)="isCreateUserModalOpen.set(false)">
      <form [formGroup]="createUserForm" (ngSubmit)="submitCreateUser()" class="space-y-4 text-xs">
        <div>
          <label class="block font-bold uppercase tracking-wider text-slate-500 mb-1">Full Name</label>
          <input formControlName="fullName" type="text" placeholder="e.g. Jane Doe" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white">
        </div>
        <div>
          <label class="block font-bold uppercase tracking-wider text-slate-500 mb-1">Email Address</label>
          <input formControlName="email" type="email" placeholder="jane@example.com" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white">
        </div>
        <div>
          <label class="block font-bold uppercase tracking-wider text-slate-500 mb-1">Password</label>
          <input formControlName="password" type="password" placeholder="At least 6 characters" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white">
        </div>
        <div>
          <label class="block font-bold uppercase tracking-wider text-slate-500 mb-1">Role</label>
          <select formControlName="role" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white">
            <option value="CUSTOMER">CUSTOMER</option>
            <option value="RESTAURANT_OWNER">RESTAURANT_OWNER</option>
            <option value="DELIVERY_DRIVER">DELIVERY_DRIVER</option>
          </select>
        </div>
        <button type="submit" [disabled]="createUserForm.invalid" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow transition-colors">
          Create Account
        </button>
      </form>
    </app-modal>

    <!-- MODAL 2: Edit User -->
    <app-modal [isOpen]="isEditUserModalOpen()" title="Edit User Account" (close)="isEditUserModalOpen.set(false)">
      <form [formGroup]="editUserForm" (ngSubmit)="submitEditUser()" class="space-y-4 text-xs">
        <div>
          <label class="block font-bold uppercase tracking-wider text-slate-500 mb-1">Full Name</label>
          <input formControlName="fullName" type="text" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white">
        </div>
        <div>
          <label class="block font-bold uppercase tracking-wider text-slate-500 mb-1">Role</label>
          <select formControlName="role" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white">
            @for (role of roles; track role) {
              <option [value]="role">{{ role }}</option>
            }
          </select>
        </div>
        <div class="flex items-center gap-6 pt-2">
          <label class="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
            <input formControlName="active" type="checkbox" class="rounded"> Active Account
          </label>
          <label class="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
            <input formControlName="approved" type="checkbox" class="rounded"> Approved
          </label>
        </div>
        <button type="submit" [disabled]="editUserForm.invalid" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow transition-colors">
          Update User
        </button>
      </form>
    </app-modal>

    <!-- MODAL 3: Create / Edit Restaurant -->
    <app-modal [isOpen]="isRestaurantModalOpen()" [title]="isEditingRestaurant() ? 'Edit Partner Restaurant' : 'Add New Restaurant'" (close)="isRestaurantModalOpen.set(false)">
      <form [formGroup]="restaurantForm" (ngSubmit)="submitRestaurant()" class="space-y-3 text-xs">
        <div>
          <label class="block font-bold uppercase tracking-wider text-slate-500 mb-1">Restaurant Name</label>
          <input formControlName="name" type="text" placeholder="e.g. Bella Roma" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold uppercase tracking-wider text-slate-500 mb-1">Cuisine</label>
            <input formControlName="cuisineType" type="text" placeholder="Italian, Sushi, etc." class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white">
          </div>
          <div>
            <label class="block font-bold uppercase tracking-wider text-slate-500 mb-1">Phone</label>
            <input formControlName="phone" type="text" placeholder="+1 212-555-0100" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white">
          </div>
        </div>
        <div>
          <label class="block font-bold uppercase tracking-wider text-slate-500 mb-1">Address</label>
          <input formControlName="address" type="text" placeholder="Street, City, Zip" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white">
        </div>
        <div>
          <label class="block font-bold uppercase tracking-wider text-slate-500 mb-1">Description</label>
          <textarea formControlName="description" rows="2" placeholder="Brief restaurant overview..." class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"></textarea>
        </div>
        <div class="pt-2">
          <button type="submit" [disabled]="restaurantForm.invalid" class="w-full py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold rounded-xl shadow transition-colors">
            {{ isEditingRestaurant() ? 'Save Changes' : 'Create Restaurant' }}
          </button>
        </div>
      </form>
    </app-modal>

    <!-- MODAL 4: Create / Edit Coupon -->
    <app-modal [isOpen]="isCouponModalOpen()" [title]="isEditingCoupon() ? 'Edit Promo Coupon' : 'Create Promo Coupon'" (close)="isCouponModalOpen.set(false)">
      <form [formGroup]="couponForm" (ngSubmit)="submitCoupon()" class="space-y-3 text-xs">
        <div>
          <label class="block font-bold uppercase tracking-wider text-slate-500 mb-1">Coupon Code</label>
          <input formControlName="code" type="text" placeholder="e.g. FLASH25" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono font-bold uppercase text-slate-800 dark:text-white">
        </div>
        <div>
          <label class="block font-bold uppercase tracking-wider text-slate-500 mb-1">Description</label>
          <input formControlName="description" type="text" placeholder="Promo details" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold uppercase tracking-wider text-slate-500 mb-1">Discount Type</label>
            <select formControlName="discountType" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white">
              <option [value]="DiscountType.PERCENTAGE">Percentage (%)</option>
              <option [value]="DiscountType.FIXED_AMOUNT">Fixed Amount ($)</option>
            </select>
          </div>
          <div>
            <label class="block font-bold uppercase tracking-wider text-slate-500 mb-1">Value</label>
            <input formControlName="discountValue" type="number" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold uppercase tracking-wider text-slate-500 mb-1">Min Order ($)</label>
            <input formControlName="minOrderAmount" type="number" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white">
          </div>
          <div>
            <label class="block font-bold uppercase tracking-wider text-slate-500 mb-1">Expiry Date</label>
            <input formControlName="expiryDate" type="date" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white">
          </div>
        </div>
        <div class="pt-2">
          <button type="submit" [disabled]="couponForm.invalid" class="w-full py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold rounded-xl shadow transition-colors">
            {{ isEditingCoupon() ? 'Update Coupon' : 'Create Coupon' }}
          </button>
        </div>
      </form>
    </app-modal>

    <!-- MODAL 5: Order Details & Inspection -->
    <app-modal [isOpen]="isOrderDetailsModalOpen()" title="Order Inspection & Lifecycle" (close)="isOrderDetailsModalOpen.set(false)">
      @if (selectedOrderForDetails(); as order) {
        <div class="space-y-4 text-xs">
          <div class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
            <div class="flex justify-between items-center">
              <span class="font-mono font-bold text-sm text-slate-800 dark:text-white">Order #{{ shortOrderId(order.id) }}</span>
              <app-status-badge [status]="order.status" />
            </div>
            <p class="text-slate-500">Customer: <strong class="text-slate-800 dark:text-slate-200">{{ order.customerName }}</strong> ({{ order.customerPhone || 'N/A' }})</p>
            <p class="text-slate-500">Address: {{ order.deliveryAddress }}</p>
            <p class="text-slate-400">Placed: {{ formatDateTime(order.createdAt) }}</p>
          </div>

          <div>
            <h4 class="font-bold uppercase tracking-wider text-slate-400 mb-2">Order Items</h4>
            <div class="divide-y divide-slate-100 dark:divide-slate-800 border-t border-b border-slate-100 dark:border-slate-800 max-h-36 overflow-y-auto">
              @for (item of order.items; track item.menuItemId) {
                <div class="py-2 flex justify-between items-center">
                  <div>
                    <span class="font-semibold text-slate-800 dark:text-white">{{ item.quantity }}x {{ item.name }}</span>
                    @if (item.specialInstructions) {
                      <p class="text-[10px] text-amber-600 dark:text-amber-400 italic">"{{ item.specialInstructions }}"</p>
                    }
                  </div>
                  <span class="font-mono text-slate-600 dark:text-slate-300">\${{ (item.subtotal || item.unitPrice * item.quantity).toFixed(2) }}</span>
                </div>
              }
            </div>
          </div>

          <div class="space-y-1 text-slate-500 text-[11px]">
            <div class="flex justify-between"><span>Subtotal:</span><span>\${{ order.subtotalAmount?.toFixed(2) || '0.00' }}</span></div>
            <div class="flex justify-between"><span>Delivery Fee:</span><span>\${{ order.deliveryFee?.toFixed(2) || '0.00' }}</span></div>
            <div class="flex justify-between"><span>Tax:</span><span>\${{ order.taxAmount?.toFixed(2) || '0.00' }}</span></div>
            @if (order.discountAmount) {
              <div class="flex justify-between text-emerald-600"><span>Discount:</span><span>-\${{ order.discountAmount.toFixed(2) }}</span></div>
            }
            <div class="flex justify-between font-bold text-sm text-slate-800 dark:text-white pt-1 border-t border-slate-100 dark:border-slate-800">
              <span>Total:</span><span>{{ formatMoney(order.totalAmount) }}</span>
            </div>
          </div>

          <div class="pt-2 space-y-2">
            <label class="block font-bold uppercase tracking-wider text-slate-500">Advance Order Status</label>
            <div class="flex gap-2">
              <select [(ngModel)]="orderStatusDraft" class="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-xs">
                @for (st of getOrderStatusOptions(order.status); track st) {
                  <option [value]="st">{{ st }}</option>
                }
              </select>
              <button (click)="submitOrderStatusChange(order.id)" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors">
                Apply
              </button>
            </div>
          </div>
        </div>
      }
    </app-modal>
  `
})
export class AdminDashboardComponent implements OnInit {
  private readonly restaurantService = inject(RestaurantService);
  private readonly orderService = inject(OrderService);
  private readonly couponService = inject(CouponService);
  private readonly toastService = inject(ToastService);
  private readonly adminService = inject(AdminService);
  private readonly confirm = inject(ConfirmService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly activeSection = signal('overview');
  readonly restaurants = signal<Restaurant[]>([]);
  readonly orders = signal<Order[]>([]);
  readonly coupons = signal<Coupon[]>([]);
  readonly users = signal<AdminUser[]>([]);
  readonly managedRestaurants = signal<Restaurant[]>([]);
  readonly auditLogs = signal<AuditLog[]>([]);
  readonly report = signal<AdminReport | null>(null);
  readonly roles = Object.values(Role);
  readonly orderStatuses = Object.values(OrderStatus);
  private readonly orderTransitions: Record<OrderStatus, readonly OrderStatus[]> = {
    [OrderStatus.PLACED]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
    [OrderStatus.PREPARING]: [OrderStatus.READY_FOR_PICKUP, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CANCELLED],
    [OrderStatus.READY_FOR_PICKUP]: [OrderStatus.PICKED_UP, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CANCELLED],
    [OrderStatus.PICKED_UP]: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED],
    [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: []
  };

  userQuery = '';
  selectedRoleFilter = '';
  orderSearchQuery = '';
  orderStatusDraft: OrderStatus = OrderStatus.CONFIRMED;
  settingsDraft: PlatformSettings = { commissionRate: 15, currency: 'USD' };

  // Modals signals
  readonly isCreateUserModalOpen = signal(false);
  readonly isEditUserModalOpen = signal(false);
  readonly isRestaurantModalOpen = signal(false);
  readonly isEditingRestaurant = signal(false);
  readonly isCouponModalOpen = signal(false);
  readonly isEditingCoupon = signal(false);
  readonly isOrderDetailsModalOpen = signal(false);
  readonly selectedOrderForDetails = signal<Order | null>(null);

  readonly DiscountType = DiscountType;
  readonly formatMoney = formatMoney;
  readonly formatDateTime = formatDateTime;
  readonly shortOrderId = shortOrderId;

  // Forms
  readonly createUserForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: [Role.CUSTOMER, [Validators.required]]
  });

  readonly editUserForm = this.fb.group({
    id: [''],
    fullName: ['', [Validators.required]],
    role: [Role.CUSTOMER, [Validators.required]],
    active: [true],
    approved: [true]
  });

  readonly restaurantForm = this.fb.group({
    id: [''],
    name: ['', [Validators.required, Validators.minLength(2)]],
    cuisineType: ['', [Validators.required]],
    description: [''],
    address: ['', [Validators.required]],
    phone: ['', [Validators.required]],
    open: [true]
  });

  readonly couponForm = this.fb.group({
    id: [''],
    code: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    discountType: [DiscountType.PERCENTAGE, [Validators.required]],
    discountValue: [15, [Validators.required, Validators.min(1)]],
    minOrderAmount: [20, [Validators.required, Validators.min(0)]],
    expiryDate: ['2027-12-31', [Validators.required]],
    active: [true]
  });

  // Computed signals
  readonly platformRevenue = computed(() =>
    this.orders().reduce((sum, o) => sum + (o.totalAmount || 0), 0)
  );
  readonly activeRestaurantsCount = computed(() =>
    this.managedRestaurants().filter(r => r.open).length
  );
  readonly deliveredOrdersCount = computed(() =>
    this.orders().filter(o => o.status === OrderStatus.DELIVERED).length
  );
  readonly couriersCount = computed(() =>
    this.users().filter(u => u.role === Role.DELIVERY_DRIVER).length
  );

  readonly chartLabels = computed(() =>
    this.managedRestaurants().map(r => r.name.length > 15 ? r.name.substring(0, 15) + '...' : r.name)
  );

  readonly chartValues = computed(() => {
    const map = new Map<string, number>();
    this.orders().forEach(o => {
      const current = map.get(o.restaurantId) || 0;
      map.set(o.restaurantId, current + (o.totalAmount || 0));
    });
    return this.managedRestaurants().map(r => map.get(r.id) || 0);
  });

  readonly filteredOrders = computed(() => {
    const query = this.orderSearchQuery.trim().toLowerCase();
    if (!query) return this.orders();
    return this.orders().filter(o =>
      (o.id && o.id.toLowerCase().includes(query)) ||
      (o.customerName && o.customerName.toLowerCase().includes(query)) ||
      (o.status && o.status.toLowerCase().includes(query))
    );
  });

  readonly orderStatusBreakdown = computed(() => {
    const all = this.orders();
    const total = all.length || 1;
    const statuses = [
      { status: OrderStatus.DELIVERED, label: 'Delivered', colorClass: 'bg-emerald-500' },
      { status: OrderStatus.OUT_FOR_DELIVERY, label: 'Out for Delivery', colorClass: 'bg-blue-500' },
      { status: OrderStatus.PREPARING, label: 'In Kitchen', colorClass: 'bg-amber-500' },
      { status: OrderStatus.READY_FOR_PICKUP, label: 'Ready for Courier', colorClass: 'bg-indigo-500' },
      { status: OrderStatus.PLACED, label: 'New / Placed', colorClass: 'bg-orange-500' },
      { status: OrderStatus.CANCELLED, label: 'Cancelled', colorClass: 'bg-red-500' }
    ];

    return statuses.map(s => {
      const count = all.filter(o => o.status === s.status).length;
      const percentage = Math.round((count / total) * 100);
      return { ...s, count, percentage };
    });
  });

  ngOnInit(): void {
    this.route.params.subscribe(p => {
      if (p['section']) {
        this.activeSection.set(p['section']);
      }
    });
    this.refreshAll();
  }

  setSection(section: string): void {
    this.activeSection.set(section);
  }

  refreshAll(): void {
    this.loadData();
    this.loadAdminData();
  }

  loadAdminData(): void {
    this.loadUsers();
    this.adminService.getManagedRestaurants().subscribe({ next: value => this.managedRestaurants.set(value) });
    this.adminService.getAuditLogs().subscribe({ next: value => this.auditLogs.set(value) });
    this.adminService.getSettings().subscribe({ next: value => this.settingsDraft = { ...value } });
    this.adminService.getReport().subscribe({ next: value => this.report.set(value) });
  }

  loadUsers(): void {
    this.adminService.getUsers(this.userQuery, (this.selectedRoleFilter as Role) || undefined).subscribe({
      next: value => this.users.set(value)
    });
  }

  // ----------------------------------------------------
  // USER CRUD OPERATIONS
  // ----------------------------------------------------
  openCreateUserModal(): void {
    this.createUserForm.reset({
      fullName: '',
      email: '',
      password: '',
      role: Role.CUSTOMER
    });
    this.isCreateUserModalOpen.set(true);
  }

  submitCreateUser(): void {
    if (this.createUserForm.invalid) return;
    const val = this.createUserForm.getRawValue();
    const request: AdminUserCreateRequest = {
      fullName: val.fullName,
      email: val.email,
      password: val.password,
      role: val.role
    };
    this.adminService.createUser(request).subscribe({
      next: (created) => {
        this.toastService.success('User Created', `Account for ${created.fullName} successfully registered.`);
        this.isCreateUserModalOpen.set(false);
        this.loadUsers();
      },
      error: (err) => this.toastService.error('Creation failed', err?.error?.message || 'Could not create account.')
    });
  }

  openEditUserModal(user: AdminUser): void {
    this.editUserForm.patchValue({
      id: user.id,
      fullName: user.fullName,
      role: user.role,
      active: user.active,
      approved: user.approved
    });
    this.isEditUserModalOpen.set(true);
  }

  submitEditUser(): void {
    if (this.editUserForm.invalid) return;
    const val = this.editUserForm.getRawValue();
    this.adminService.updateUser(val.id, {
      fullName: val.fullName,
      role: val.role,
      active: val.active,
      approved: val.approved
    }).subscribe({
      next: (updated) => {
        this.users.update(list => list.map(u => u.id === updated.id ? updated : u));
        this.toastService.success('User updated', `${updated.fullName} was updated successfully.`);
        this.isEditUserModalOpen.set(false);
      },
      error: (err) => this.toastService.error('Update failed', err?.error?.message || 'Could not update user.')
    });
  }

  toggleUser(user: AdminUser): void {
    this.adminService.updateUser(user.id, { active: !user.active }).subscribe({
      next: updated => {
        this.users.update(items => items.map(item => item.id === updated.id ? updated : item));
        this.toastService.success('Account status updated', `${updated.fullName} is now ${updated.active ? 'active' : 'suspended'}.`);
      },
      error: error => this.toastService.error('Update failed', error?.error?.message || 'Could not update account.')
    });
  }

  async deleteUser(user: AdminUser): Promise<void> {
    const confirmed = await this.confirm.ask({
      title: 'Delete User',
      message: `Delete ${user.fullName}'s account permanently? This action cannot be undone.`,
      danger: true,
      confirmLabel: 'Delete User'
    });
    if (!confirmed) return;
    this.adminService.deleteUser(user.id).subscribe({
      next: () => {
        this.users.update(items => items.filter(item => item.id !== user.id));
        this.toastService.success('User deleted', `${user.fullName}'s account was removed.`);
      },
      error: error => this.toastService.error('Delete failed', error?.error?.message || 'Could not delete user.')
    });
  }

  changeRole(user: AdminUser, role: Role): void {
    this.adminService.updateUser(user.id, { role }).subscribe({
      next: updated => {
        this.users.update(items => items.map(item => item.id === updated.id ? updated : item));
        this.toastService.success('Role updated', `${updated.fullName} role changed to ${role}.`);
      },
      error: error => this.toastService.error('Role update failed', error?.error?.message || 'Could not update role.')
    });
  }

  // ----------------------------------------------------
  // RESTAURANT CRUD OPERATIONS
  // ----------------------------------------------------
  openCreateRestaurantModal(): void {
    this.isEditingRestaurant.set(false);
    this.restaurantForm.reset({
      id: '',
      name: '',
      cuisineType: 'Italian',
      description: '',
      address: '',
      phone: '',
      open: true
    });
    this.isRestaurantModalOpen.set(true);
  }

  openEditRestaurantModal(res: Restaurant): void {
    this.isEditingRestaurant.set(true);
    this.restaurantForm.patchValue({
      id: res.id,
      name: res.name,
      cuisineType: res.cuisineType,
      description: res.description,
      address: res.address,
      phone: res.phone,
      open: res.open
    });
    this.isRestaurantModalOpen.set(true);
  }

  submitRestaurant(): void {
    if (this.restaurantForm.invalid) return;
    const val = this.restaurantForm.getRawValue();
    const req: RestaurantRequest = {
      name: val.name,
      cuisineType: val.cuisineType,
      description: val.description,
      address: val.address,
      phone: val.phone,
      open: val.open
    };

    if (this.isEditingRestaurant() && val.id) {
      this.restaurantService.update(val.id, req).subscribe({
        next: (updated) => {
          this.managedRestaurants.update(list => list.map(r => r.id === updated.id ? updated : r));
          this.toastService.success('Restaurant updated', `${updated.name} has been updated.`);
          this.isRestaurantModalOpen.set(false);
        },
        error: (err) => this.toastService.error('Update failed', err?.error?.message || 'Could not update restaurant.')
      });
    } else {
      this.restaurantService.create(req).subscribe({
        next: (created) => {
          this.managedRestaurants.update(list => [...list, created]);
          this.toastService.success('Restaurant created', `${created.name} is now registered.`);
          this.isRestaurantModalOpen.set(false);
        },
        error: (err) => this.toastService.error('Create failed', err?.error?.message || 'Could not create restaurant.')
      });
    }
  }

  async deleteRestaurant(res: Restaurant): Promise<void> {
    const confirmed = await this.confirm.ask({
      title: 'Delete Restaurant',
      message: `Are you sure you want to permanently delete "${res.name}"? This will delete associated menu items and records.`,
      danger: true,
      confirmLabel: 'Delete Restaurant'
    });

    if (confirmed) {
      this.restaurantService.delete(res.id).subscribe({
        next: () => {
          this.managedRestaurants.update(list => list.filter(r => r.id !== res.id));
          this.toastService.success('Restaurant deleted', `${res.name} was removed.`);
        },
        error: (err) => this.toastService.error('Delete failed', err?.error?.message || 'Could not delete restaurant.')
      });
    }
  }

  approveRestaurant(restaurant: Restaurant): void {
    this.adminService.approveRestaurant(restaurant.id, !restaurant.approved).subscribe({
      next: updated => {
        this.managedRestaurants.update(items => items.map(item => item.id === updated.id ? updated : item));
        this.toastService.success('Approval updated', `${updated.name} approval is now ${updated.approved ? 'Approved' : 'Revoked'}.`);
      },
      error: error => this.toastService.error('Approval failed', error?.error?.message || 'Could not update approval.')
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
        this.managedRestaurants.update(list => list.map(r => r.id === val.id ? val : r));
        this.toastService.info('Partner Status Updated', `${val.name} is now ${val.open ? 'Active' : 'Disabled'}`);
      },
      error: () => this.toastService.error('Error', 'Failed to update restaurant status.')
    });
  }

  // ----------------------------------------------------
  // COUPON CRUD OPERATIONS
  // ----------------------------------------------------
  openCreateCouponModal(): void {
    this.isEditingCoupon.set(false);
    this.couponForm.reset({
      id: '',
      code: '',
      description: '',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 15,
      minOrderAmount: 20,
      expiryDate: '2027-12-31',
      active: true
    });
    this.isCouponModalOpen.set(true);
  }

  openEditCouponModal(coupon: Coupon): void {
    this.isEditingCoupon.set(true);
    const expiry = coupon.expiryDate ? coupon.expiryDate.split('T')[0] : '2027-12-31';
    this.couponForm.patchValue({
      id: coupon.id,
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      expiryDate: expiry,
      active: coupon.active
    });
    this.isCouponModalOpen.set(true);
  }

  submitCoupon(): void {
    if (this.couponForm.invalid) return;
    const val = this.couponForm.getRawValue();
    const req: CouponRequest = {
      code: val.code.toUpperCase(),
      discountType: val.discountType,
      discountValue: val.discountValue,
      minOrderAmount: val.minOrderAmount,
      expiryDate: this.toInstant(val.expiryDate),
      active: val.active,
      description: val.description
    };

    if (this.isEditingCoupon() && val.id) {
      this.couponService.update(val.id, req).subscribe({
        next: (updated) => {
          this.coupons.update(list => list.map(c => c.id === updated.id ? updated : c));
          this.toastService.success('Coupon updated', `Promo code ${updated.code} has been updated.`);
          this.isCouponModalOpen.set(false);
        },
        error: (err) => this.toastService.error('Update failed', err?.error?.message || 'Could not update coupon.')
      });
    } else {
      this.couponService.create(req).subscribe({
        next: (created) => {
          this.coupons.update(list => [...list, created]);
          this.toastService.success('Coupon created', `Promo code ${created.code} is now live!`);
          this.isCouponModalOpen.set(false);
        },
        error: (err) => this.toastService.error('Create failed', err?.error?.message || 'Could not create coupon.')
      });
    }
  }

  async deleteCoupon(coupon: Coupon): Promise<void> {
    const confirmed = await this.confirm.ask({
      title: 'Delete Promo Coupon',
      message: `Are you sure you want to delete coupon code "${coupon.code}"?`,
      danger: true,
      confirmLabel: 'Delete'
    });

    if (confirmed) {
      this.couponService.delete(coupon.id).subscribe({
        next: () => {
          this.coupons.update(list => list.filter(c => c.id !== coupon.id));
          this.toastService.success('Coupon deleted', `Promo code ${coupon.code} was deleted.`);
        },
        error: (err) => this.toastService.error('Delete failed', err?.error?.message || 'Could not delete coupon.')
      });
    }
  }

  toggleCouponActive(coupon: Coupon): void {
    this.couponService.update(coupon.id, {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      expiryDate: this.toInstant(coupon.expiryDate),
      active: !coupon.active,
      description: coupon.description
    }).subscribe({
      next: (updated) => {
        this.coupons.update(list => list.map(c => c.id === updated.id ? updated : c));
        this.toastService.info('Coupon Status', `Promo code ${updated.code} is now ${updated.active ? 'Active' : 'Disabled'}.`);
      },
      error: () => this.toastService.error('Error', 'Failed to toggle coupon status.')
    });
  }

  private toInstant(value: string | undefined): string | undefined {
    if (!value) return undefined;
    if (value.includes('T')) return value;
    return `${value}T23:59:59Z`;
  }

  // ----------------------------------------------------
  // ORDER OPERATIONS & DETAILS
  // ----------------------------------------------------
  openOrderDetails(order: Order): void {
    this.selectedOrderForDetails.set(order);
    this.orderStatusDraft = order.status;
    this.isOrderDetailsModalOpen.set(true);
  }

  updateOrderStatus(orderId: string, newStatus: OrderStatus): void {
    const current = this.orders().find(order => order.id === orderId)?.status;
    if (!current || current === newStatus) return;

    this.orderService.updateStatus(orderId, newStatus).subscribe({
      next: (updated) => {
        this.orders.update(list => list.map(o => o.id === updated.id ? updated : o));
        this.toastService.success('Order status updated', `Order #${shortOrderId(updated.id)} moved to ${updated.status}.`);
      },
      error: (err) => this.toastService.error('Status update failed', err?.error?.message || 'Could not advance order.')
    });
  }

  getOrderStatusOptions(status: OrderStatus): readonly OrderStatus[] {
    return [status, ...(this.orderTransitions[status] ?? [])];
  }

  submitOrderStatusChange(orderId: string): void {
    this.updateOrderStatus(orderId, this.orderStatusDraft);
    this.isOrderDetailsModalOpen.set(false);
  }

  async refund(order: Order): Promise<void> {
    const confirmed = await this.confirm.ask({
      title: 'Refund Order',
      message: `Process full refund of ${formatMoney(order.totalAmount)} to customer ${order.customerName} for order #${shortOrderId(order.id)}?`,
      danger: true,
      confirmLabel: 'Issue Refund'
    });

    if (confirmed) {
      this.adminService.refundOrder(order.id).subscribe({
        next: updated => {
          this.orders.update(items => items.map(item => item.id === updated.id ? updated : item));
          this.toastService.success('Refund completed', `Order #${order.id.substring(0, 8)} was refunded.`);
        },
        error: error => this.toastService.error('Refund failed', error?.error?.message || 'Could not refund this order.')
      });
    }
  }

  // ----------------------------------------------------
  // SETTINGS & EXPORTS
  // ----------------------------------------------------
  saveSettings(): void {
    this.adminService.updateSettings(this.settingsDraft).subscribe({
      next: value => {
        this.settingsDraft = { ...value };
        this.toastService.success('Settings Saved', `Platform commission updated to ${value.commissionRate}%.`);
      },
      error: error => this.toastService.error('Settings failed', error?.error?.message || 'Could not save settings.')
    });
  }

  exportReport(): void {
    const report = this.report();
    if (!report) return;
    this.downloadCsv('platform-report.csv', Object.entries(report).map(([key, value]) => `${key},${value}`).join('\n'));
  }

  printReport(): void {
    window.print();
  }

  exportRestaurants(): void {
    this.downloadCsv('restaurants.csv', [
      'name,cuisine,address,approved,open',
      ...this.managedRestaurants().map(item =>
        [item.name, item.cuisineType, item.address, item.approved, item.open]
          .map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n'));
  }

  private downloadCsv(filename: string, content: string): void {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
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
}
