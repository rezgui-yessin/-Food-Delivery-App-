import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { CouponService } from '../../../core/services/coupon.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { slideOverAnimation, backdropFadeAnimation } from '../../animations/animations';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  animations: [slideOverAnimation, backdropFadeAnimation],
  template: `
    @if (cartService.isDrawerOpen()) {
      <!-- Backdrop -->
      <div
        @backdropFadeAnimation
        (click)="cartService.toggleDrawer(false)"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40">
      </div>

      <!-- Drawer -->
      <div
        @slideOverAnimation
        class="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col">

        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 class="text-xl font-bold text-slate-800 dark:text-white">Your Cart</h2>
            @if (cartService.cart()?.restaurantName) {
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                📍 {{ cartService.cart()!.restaurantName }}
              </p>
            }
          </div>
          <button
            (click)="cartService.toggleDrawer(false)"
            class="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Items List -->
        <div class="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          @if (cartService.items().length === 0) {
            <div class="flex flex-col items-center justify-center h-full text-center py-16">
              <div class="text-6xl mb-4">🛒</div>
              <p class="text-lg font-semibold text-slate-600 dark:text-slate-400">Your cart is empty</p>
              <p class="text-sm text-slate-400 dark:text-slate-500 mt-1">Browse restaurants and add some delicious food!</p>
              <button
                (click)="cartService.toggleDrawer(false)"
                class="mt-6 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors text-sm">
                Browse Restaurants
              </button>
            </div>
          }

          @for (item of cartService.items(); track item.menuItemId) {
            <div class="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-slate-800 dark:text-white text-sm truncate">{{ item.name }}</p>
                @if (item.specialInstructions) {
                  <p class="text-xs text-slate-400 italic mt-0.5 truncate">{{ item.specialInstructions }}</p>
                }
                <p class="text-sm font-bold text-primary mt-1">\${{ (item.unitPrice * item.quantity).toFixed(2) }}</p>
              </div>
              <!-- Qty Stepper -->
              <div class="flex items-center gap-1.5 flex-shrink-0">
                <button
                  (click)="cartService.updateQuantity(item.menuItemId, item.quantity - 1)"
                  class="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-primary hover:text-white transition-colors flex items-center justify-center text-lg leading-none">
                  −
                </button>
                <span class="w-6 text-center text-sm font-bold text-slate-800 dark:text-white">{{ item.quantity }}</span>
                <button
                  (click)="cartService.updateQuantity(item.menuItemId, item.quantity + 1)"
                  class="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-primary hover:text-white transition-colors flex items-center justify-center text-lg leading-none">
                  +
                </button>
                <button
                  (click)="cartService.removeItem(item.menuItemId)"
                  class="w-7 h-7 ml-1 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors flex items-center justify-center">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Bottom Section -->
        @if (cartService.items().length > 0) {
          <div class="border-t border-slate-100 dark:border-slate-800 px-5 pt-4 pb-6 space-y-4">
            <!-- Coupon -->
            <div>
              @if (!cartService.appliedCoupon()) {
                <div class="flex gap-2">
                  <input
                    [(ngModel)]="couponCode"
                    placeholder="Promo code"
                    [disabled]="isValidatingCoupon"
                    class="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    (keyup.enter)="applyCoupon()">
                  <button
                    (click)="applyCoupon()"
                    [disabled]="!couponCode || isValidatingCoupon"
                    class="px-4 py-2 text-sm font-semibold bg-slate-800 dark:bg-slate-600 text-white rounded-xl hover:bg-slate-900 dark:hover:bg-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                    @if (isValidatingCoupon) { Checking... } @else { Apply }
                  </button>
                </div>
                @if (couponError) {
                  <p class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <span>⚠</span> {{ couponError }}
                  </p>
                }
              } @else {
                <div class="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <div class="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    <span>✓</span>
                    <span>{{ cartService.appliedCoupon() }}</span>
                    <span class="text-emerald-600">−\${{ cartService.discountAmount().toFixed(2) }}</span>
                  </div>
                  <button (click)="cartService.removeDiscount()" class="text-xs text-slate-400 hover:text-red-500 transition-colors">Remove</button>
                </div>
              }
            </div>

            <!-- Price Summary -->
            <div class="space-y-1.5 text-sm">
              <div class="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span>\${{ cartService.subtotal().toFixed(2) }}</span>
              </div>
              @if (cartService.discountAmount() > 0) {
                <div class="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Discount</span>
                  <span>−\${{ cartService.discountAmount().toFixed(2) }}</span>
                </div>
              }
              <div class="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Delivery</span>
                <span>\${{ cartService.deliveryFee().toFixed(2) }}</span>
              </div>
              <div class="flex justify-between font-bold text-slate-900 dark:text-white text-base pt-1.5 border-t border-slate-100 dark:border-slate-800">
                <span>Total</span>
                <span class="text-primary">\${{ cartService.totalAmount().toFixed(2) }}</span>
              </div>
            </div>

            <!-- Checkout CTA -->
            @if (authService.isAuthenticated()) {
              <a
                routerLink="/checkout"
                (click)="cartService.toggleDrawer(false)"
                class="block w-full text-center py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-colors shadow-lg shadow-primary/20">
                Proceed to Checkout →
              </a>
            } @else {
              <a
                routerLink="/login"
                (click)="cartService.toggleDrawer(false)"
                class="block w-full text-center py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-colors">
                Sign in to Checkout
              </a>
            }
          </div>
        }
      </div>
    }

    <!-- Cart Conflict Modal -->
    @if (cartService.conflictModalOpen()) {
      <div class="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="cartService.cancelConflict()"></div>
        <div class="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 z-10">
          <div class="text-center">
            <div class="text-4xl mb-3">🍽️</div>
            <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-2">Start New Order?</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Your cart already has items from <strong class="text-slate-700 dark:text-slate-200">{{ cartService.cart()?.restaurantName }}</strong>.
              Adding from a different restaurant will clear your current cart.
            </p>
            <div class="flex gap-3">
              <button
                (click)="cartService.cancelConflict()"
                class="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm">
                Keep Cart
              </button>
              <button
                (click)="cartService.confirmConflictReplace()"
                class="flex-1 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover transition-colors text-sm">
                Clear & Add
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class CartDrawerComponent {
  readonly cartService = inject(CartService);
  readonly authService = inject(AuthService);
  private readonly couponService = inject(CouponService);
  private readonly toastService = inject(ToastService);

  couponCode = '';
  isValidatingCoupon = false;
  couponError = '';

  applyCoupon(): void {
    const cart = this.cartService.cart();
    if (!this.couponCode || !cart?.restaurantId) return;

    this.isValidatingCoupon = true;
    this.couponError = '';

    this.couponService.validate(
      this.couponCode,
      cart.restaurantId,
      this.cartService.subtotal()
    ).subscribe({
      next: (result) => {
        this.isValidatingCoupon = false;
        if (result.valid) {
          this.cartService.applyDiscount(result.code, result.calculatedDiscount);
          this.couponCode = '';
        } else {
          this.couponError = result.message || 'Invalid coupon code.';
        }
      },
      error: () => {
        this.isValidatingCoupon = false;
        this.couponError = 'Could not validate coupon. Please try again.';
      }
    });
  }
}
