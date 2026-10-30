import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { PaymentService } from '../../../core/services/payment.service';
import { ToastService } from '../../../core/services/toast.service';
import { PaymentMethod } from '../../../core/models';
import { getDishImage } from '../../../core/utils/asset-helpers';
import { fadeAnimation } from '../../../shared/animations/animations';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  animations: [fadeAnimation],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-900 py-10 px-4">
      <div @fadeAnimation class="max-w-4xl mx-auto">
        <div class="mb-8">
          <a routerLink="/" class="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">← Back to restaurants</a>
          <h1 class="text-3xl font-extrabold text-slate-800 dark:text-white mt-2">Checkout</h1>
        </div>

        @if (cartService.items().length === 0) {
          <div class="text-center py-20">
            <div class="text-5xl mb-4">🛒</div>
            <p class="text-xl font-semibold text-slate-600 dark:text-slate-400">Your cart is empty</p>
            <a routerLink="/" class="mt-6 inline-block px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors">
              Browse Restaurants
            </a>
          </div>
        } @else {
          <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">

            <!-- Left: Form -->
            <div class="lg:col-span-3 space-y-6">
              <form [formGroup]="checkoutForm" (ngSubmit)="onSubmit()">

                <!-- Delivery Details Card -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                  <h2 class="text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
                    <span class="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-extrabold text-sm">1</span>
                    Delivery Details
                  </h2>

                  <div class="space-y-4">
                    <!-- Customer Name -->
                    <div>
                      <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                      <input formControlName="customerName" type="text" placeholder="John Doe" autocomplete="name"
                        class="w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                        [class]="isInvalid('customerName') ? 'border-red-400 dark:border-red-600' : 'border-slate-200 dark:border-slate-700'">
                      @if (isInvalid('customerName')) {
                        <p class="mt-1 text-xs text-red-500">Name must be at least 3 characters.</p>
                      }
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Scheduled delivery (optional)</label>
                      <input formControlName="scheduledAt" type="datetime-local" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    </div>

                    <!-- Phone -->
                    <div>
                      <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
                      <input formControlName="customerPhone" type="tel" placeholder="+1 555 000 0000" autocomplete="tel"
                        class="w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                        [class]="isInvalid('customerPhone') ? 'border-red-400 dark:border-red-600' : 'border-slate-200 dark:border-slate-700'">
                      @if (isInvalid('customerPhone')) {
                        <p class="mt-1 text-xs text-red-500">Please enter a valid phone number.</p>
                      }
                    </div>

                    <!-- Delivery Address -->
                    <div>
                      <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Delivery Address</label>
                      <textarea formControlName="deliveryAddress" rows="3" placeholder="123 Main St, Apt 4B, City, State 12345"
                        autocomplete="street-address"
                        class="w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none"
                        [class]="isInvalid('deliveryAddress') ? 'border-red-400 dark:border-red-600' : 'border-slate-200 dark:border-slate-700'"></textarea>
                      @if (isInvalid('deliveryAddress')) {
                        <p class="mt-1 text-xs text-red-500">Please enter a complete delivery address (min 5 chars).</p>
                      }
                    </div>
                  </div>
                </div>

                <!-- Payment Method Card -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                  <h2 class="text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
                    <span class="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-extrabold text-sm">2</span>
                    Payment Method
                  </h2>

                  <div class="space-y-3">
                    <!-- Card Option -->
                    <div (click)="onPaymentMethodChange('CARD')"
                      class="flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all"
                      [class]="selectedPayment === 'CARD'
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-200 dark:border-slate-700'">
                      <input type="radio" name="paymentMethodRadio" value="CARD" [checked]="selectedPayment === 'CARD'"
                        class="text-primary focus:ring-primary h-4 w-4">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-7 bg-gradient-to-br from-slate-800 to-slate-900 rounded-md flex items-center justify-center">
                          <span class="text-white text-xs font-bold">💳</span>
                        </div>
                        <div>
                          <p class="font-semibold text-slate-800 dark:text-white text-sm">Credit / Debit Card</p>
                          <p class="text-xs text-slate-400">Secure payment via Stripe</p>
                        </div>
                      </div>
                    </div>

                    <!-- Cash Option -->
                    <div (click)="onPaymentMethodChange('CASH_ON_DELIVERY')"
                      class="flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all"
                      [class]="selectedPayment === 'CASH_ON_DELIVERY'
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-200 dark:border-slate-700'">
                      <input type="radio" name="paymentMethodRadio" value="CASH_ON_DELIVERY" [checked]="selectedPayment === 'CASH_ON_DELIVERY'"
                        class="text-primary focus:ring-primary h-4 w-4">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-7 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-md flex items-center justify-center">
                          <span class="text-white text-sm">💵</span>
                        </div>
                        <div>
                          <p class="font-semibold text-slate-800 dark:text-white text-sm">Cash on Delivery</p>
                          <p class="text-xs text-slate-400">Pay the driver when your order arrives</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Stripe Card Element -->
                  @if (selectedPayment === 'CARD') {
                    <div class="mt-4 space-y-3">
                      <div>
                        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Cardholder Name</label>
                        <input formControlName="cardholderName" type="text" placeholder="Jane Smith"
                          class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all">
                      </div>
                      <div>
                        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Card Details</label>
                        <div id="stripe-card-element" class="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 min-h-[48px]">
                          @if (!isStripeReady()) {
                            <div class="text-slate-400 text-sm animate-pulse">Loading secure payment form...</div>
                          }
                        </div>
                        @if (paymentService.stripeError()) {
                          <p class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                            <span>⚠</span> {{ paymentService.stripeError() }}
                          </p>
                        }
                      </div>
                      <p class="text-xs text-slate-400 flex items-center gap-1.5">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                        Secured by Stripe — your card data never touches our servers.
                      </p>
                    </div>
                  }
                </div>

                <!-- Submit Button -->
                <button type="submit" [disabled]="isSubmitting()"
                  class="w-full py-4 bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold rounded-2xl transition-all shadow-xl shadow-primary/25 flex items-center justify-center gap-3 text-lg">
                  @if (isSubmitting()) {
                    <svg class="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  } @else {
                    🚀 Place Order — \${{ cartService.totalAmount().toFixed(2) }}
                  }
                </button>
              </form>
            </div>

            <!-- Right: Order Summary -->
            <div class="lg:col-span-2">
              <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 sticky top-24">
                <h2 class="text-lg font-bold text-slate-800 dark:text-white mb-4">Order Summary</h2>

                @if (cartService.cart()?.restaurantName) {
                  <p class="text-sm text-slate-500 dark:text-slate-400 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
                    📍 {{ cartService.cart()!.restaurantName }}
                  </p>
                }

                <div class="space-y-3 mb-4">
                  @for (item of cartService.items(); track item.menuItemId) {
                    <div class="flex items-center justify-between gap-3 text-sm">
                      <div class="flex items-center gap-2.5 min-w-0">
                        <img [src]="getDishImage(item.name)" [alt]="item.name" class="w-10 h-10 rounded-lg object-cover flex-shrink-0 shadow-sm border border-slate-100 dark:border-slate-700">
                        <div class="min-w-0">
                          <p class="font-medium text-slate-800 dark:text-white truncate text-xs sm:text-sm">
                            <span class="text-xs bg-slate-100 dark:bg-slate-700 rounded-md px-1.5 py-0.5 mr-1 font-bold text-slate-600 dark:text-slate-300">×{{ item.quantity }}</span>
                            {{ item.name }}
                          </p>
                          @if (item.specialInstructions) {
                            <p class="text-[11px] text-slate-400 italic truncate">{{ item.specialInstructions }}</p>
                          }
                        </div>
                      </div>
                      <span class="font-bold text-slate-800 dark:text-white flex-shrink-0">\${{ (item.unitPrice * item.quantity).toFixed(2) }}</span>
                    </div>
                  }
                </div>

                <div class="border-t border-slate-100 dark:border-slate-700 pt-4 space-y-2">
                  <div class="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                    <span>Subtotal</span>
                    <span>\${{ cartService.subtotal().toFixed(2) }}</span>
                  </div>
                  @if (cartService.discountAmount() > 0) {
                    <div class="flex justify-between text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                      <span>Discount ({{ cartService.appliedCoupon() }})</span>
                      <span>−\${{ cartService.discountAmount().toFixed(2) }}</span>
                    </div>
                  }
                  <div class="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                    <span>Delivery fee</span>
                    <span>\${{ cartService.deliveryFee().toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                    <span>Tax</span>
                    <span>\${{ cartService.taxAmount().toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between font-extrabold text-slate-900 dark:text-white text-lg pt-2 border-t border-slate-100 dark:border-slate-700">
                    <span>Total</span>
                    <span class="text-primary">\${{ cartService.totalAmount().toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class CheckoutComponent implements OnInit, OnDestroy {
  readonly getDishImage = getDishImage;
  private readonly fb = inject(NonNullableFormBuilder);
  readonly cartService = inject(CartService);
  readonly paymentService = inject(PaymentService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  readonly isSubmitting = signal(false);
  readonly isStripeReady = signal(false);

  selectedPayment: 'CARD' | 'CASH_ON_DELIVERY' = 'CASH_ON_DELIVERY';

  readonly checkoutForm = this.fb.group({
    customerName: ['', [Validators.required, Validators.minLength(3)]],
    customerPhone: ['', [Validators.required, Validators.pattern(/^\+?[0-9 ]{7,15}$/)]],
    deliveryAddress: ['', [Validators.required, Validators.minLength(5)]],
    cardholderName: [''],
    scheduledAt: ['']
  });

  isInvalid(field: string): boolean {
    const ctrl = this.checkoutForm.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  ngOnInit(): void {}

  onPaymentMethodChange(method: 'CARD' | 'CASH_ON_DELIVERY'): void {
    this.selectedPayment = method;

    if (method === 'CARD') {
      setTimeout(async () => {
        await this.paymentService.mountCardElement('stripe-card-element');
        this.isStripeReady.set(true);
      }, 100);
    } else {
      this.paymentService.unmountCardElement();
      this.isStripeReady.set(false);
    }
  }

  async onSubmit(): Promise<void> {
    this.checkoutForm.markAllAsTouched();

    if (this.checkoutForm.invalid || this.isSubmitting()) return;
    if (this.cartService.items().length === 0) {
      this.toastService.error('Cart Empty', 'Add items to your cart before checking out.');
      return;
    }

    this.isSubmitting.set(true);

    const { customerName, customerPhone, deliveryAddress, cardholderName, scheduledAt } = this.checkoutForm.getRawValue();
    const paymentMethod = this.selectedPayment === 'CARD' ? PaymentMethod.CARD : PaymentMethod.CASH_ON_DELIVERY;
    const couponCode = this.cartService.appliedCoupon() || undefined;

    this.cartService.checkoutCart({
      customerName,
      customerPhone,
      deliveryAddress,
      paymentMethod,
      couponCode,
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined
    }).subscribe({
      next: async (order) => {
        if (paymentMethod === PaymentMethod.CARD) {
          this.paymentService.createPaymentIntent(order.id).subscribe({
            next: async (intentRes) => {
              if (intentRes.clientSecret) {
                const result = await this.paymentService.confirmCardPayment(
                  intentRes.clientSecret,
                  cardholderName || customerName
                );

                if (!result.success) {
                  this.isSubmitting.set(false);
                  this.toastService.error('Payment Failed', result.error || 'Card payment was declined.');
                  return;
                }

                this.paymentService.confirmTestPayment(order.id).subscribe({
                  next: () => this.onOrderSuccess(order.id),
                  error: () => this.onOrderSuccess(order.id)
                });
              } else {
                this.onOrderSuccess(order.id);
              }
            },
            error: (err) => {
              this.isSubmitting.set(false);
              this.toastService.error('Payment Setup Failed', err?.error?.message || 'Could not initialize payment.');
            }
          });
        } else {
          this.onOrderSuccess(order.id);
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.toastService.error('Order Failed', err?.error?.message || 'Could not place your order. Please try again.');
      }
    });
  }

  private onOrderSuccess(orderId: string): void {
    this.isSubmitting.set(false);
    this.cartService.clearCart().subscribe();
    this.toastService.success('Order Placed! 🎉', 'Your order is confirmed and being prepared.');
    this.router.navigate(['/orders', orderId, 'tracking']);
  }

  ngOnDestroy(): void {
    this.paymentService.unmountCardElement();
  }
}
