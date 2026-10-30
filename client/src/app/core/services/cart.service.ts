import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cart, CartItem, Order, PaymentMethod } from '../models';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

export interface PendingCartAction {
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  specialInstructions?: string;
  restaurantId: string;
  restaurantName: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly baseUrl = `${environment.apiUrl}/cart`;

  private readonly storageKey = 'food_delivery_cart';

  readonly cart = signal<Cart | null>(this.getStoredCart());
  readonly isDrawerOpen = signal<boolean>(false);
  readonly appliedCoupon = signal<string | null>(null);
  readonly discountAmount = signal<number>(0);

  // Conflict modal state
  readonly conflictModalOpen = signal<boolean>(false);
  readonly pendingItem = signal<PendingCartAction | null>(null);

  readonly items = computed(() => this.cart()?.items ?? []);
  readonly itemCount = computed(() => {
    return this.items().reduce((sum, item) => sum + item.quantity, 0);
  });
  readonly subtotal = computed(() => {
    return this.items().reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  });
  readonly deliveryFee = computed(() => {
    return this.itemCount() > 0 ? 2.99 : 0;
  });
  readonly taxAmount = computed(() => Math.round(Math.max(0, this.subtotal() - this.discountAmount()) * 0.0825 * 100) / 100);
  readonly totalAmount = computed(() => {
    const raw = this.subtotal() - this.discountAmount() + this.taxAmount() + this.deliveryFee();
    return Math.max(0, Math.round(raw * 100) / 100);
  });

  constructor() {
    // Sync cart to local storage when it changes
    effect(() => {
      const current = this.cart();
      if (current) {
        localStorage.setItem(this.storageKey, JSON.stringify(current));
      } else {
        localStorage.removeItem(this.storageKey);
      }
    });

    // Only fetch server cart for customers (or admins).
    // Delivery drivers and restaurant owners must NEVER call the cart API (backend returns 403).
    effect(() => {
      const authenticated = this.authService.isAuthenticated();
      const allowed = this.isCartAllowed();

      if (authenticated && allowed) {
        this.loadCart().subscribe({ error: () => {} });
      } else if (authenticated && !allowed) {
        // Non-customer role: wipe any leftover cart from localStorage
        this.cart.set(null);
        localStorage.removeItem(this.storageKey);
      }
    });
  }

  /** Returns true only for roles that are allowed to call the cart API (CUSTOMER & ADMIN). */
  private isCartAllowed(): boolean {
    // Use computed signals as primary source; fall back to raw localStorage for extra safety.
    if (this.authService.isCustomer() || this.authService.isAdmin()) {
      return true;
    }
    // Belt-and-suspenders: parse the stored user directly so we never rely solely on signal timing
    try {
      const raw = localStorage.getItem('food_delivery_user');
      if (raw) {
        const user = JSON.parse(raw) as { role?: string };
        return user.role === 'CUSTOMER' || user.role === 'ADMIN';
      }
    } catch {
      // ignore parse errors
    }
    return false;
  }

  toggleDrawer(open?: boolean): void {
    if (typeof open === 'boolean') {
      this.isDrawerOpen.set(open);
    } else {
      this.isDrawerOpen.update(v => !v);
    }
  }

  loadCart(): Observable<Cart | null> {
    if (!this.authService.isAuthenticated()) {
      return of(this.cart());
    }

    // Server throws 403 if role is not CUSTOMER or ADMIN
    if (!this.authService.isCustomer() && !this.authService.isAdmin()) {
      return of(null);
    }

    return this.http.get<Cart>(this.baseUrl).pipe(
      tap(cart => this.cart.set(cart))
    );
  }

  addItem(item: PendingCartAction): void {
    const currentCart = this.cart();

    // Check restaurant conflict
    if (currentCart && currentCart.items.length > 0 && currentCart.restaurantId && currentCart.restaurantId !== item.restaurantId) {
      this.pendingItem.set(item);
      this.conflictModalOpen.set(true);
      return;
    }

    this.executeAddItem(item);
  }

  confirmConflictReplace(): void {
    const pending = this.pendingItem();
    if (pending) {
      this.clearCart().subscribe(() => {
        this.executeAddItem(pending);
        this.pendingItem.set(null);
        this.conflictModalOpen.set(false);
        this.toastService.info('Cart Replaced', `Started fresh order from ${pending.restaurantName}`);
      });
    } else {
      this.conflictModalOpen.set(false);
    }
  }

  cancelConflict(): void {
    this.pendingItem.set(null);
    this.conflictModalOpen.set(false);
  }

  private executeAddItem(item: PendingCartAction): void {
    if (this.authService.isAuthenticated()) {
      this.http.post<Cart>(`${this.baseUrl}/items`, {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions
      }).subscribe({
        next: (updatedCart) => {
          this.cart.set(updatedCart);
          this.toastService.success('Added to Cart', `${item.name} added!`);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 409) {
            this.pendingItem.set(item);
            this.conflictModalOpen.set(true);
          } else {
            this.toastService.error('Cart update failed', 'The item could not be added. Please try again.');
          }
        }
      });
    } else {
      this.executeLocalAddItem(item);
    }
  }

  private executeLocalAddItem(item: PendingCartAction): void {
    const current = this.cart() || {
      customerId: 'guest',
      restaurantId: item.restaurantId,
      restaurantName: item.restaurantName,
      items: [],
      totalAmount: 0
    };

    const existingIndex = current.items.findIndex(i => i.menuItemId === item.menuItemId);
    let updatedItems = [...current.items];

    if (existingIndex > -1) {
      const existing = updatedItems[existingIndex];
      const newQty = existing.quantity + item.quantity;
      updatedItems[existingIndex] = {
        ...existing,
        quantity: newQty,
        subtotal: Math.round(newQty * existing.unitPrice * 100) / 100,
        specialInstructions: item.specialInstructions || existing.specialInstructions
      };
    } else {
      const newItem: CartItem = {
        menuItemId: item.menuItemId,
        name: item.name,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        subtotal: Math.round(item.quantity * item.unitPrice * 100) / 100,
        specialInstructions: item.specialInstructions
      };
      updatedItems.push(newItem);
    }

    const subtotal = updatedItems.reduce((acc, curr) => acc + curr.subtotal, 0);

    this.cart.set({
      customerId: current.customerId,
      restaurantId: item.restaurantId,
      restaurantName: item.restaurantName,
      items: updatedItems,
      totalAmount: subtotal
    });

    this.toastService.success('Added to Cart', `${item.name} added!`);
  }

  updateQuantity(menuItemId: string, newQuantity: number): void {
    if (newQuantity <= 0) {
      this.removeItem(menuItemId);
      return;
    }

    if (this.authService.isAuthenticated()) {
      this.http.put<Cart>(`${this.baseUrl}/items/${menuItemId}`, {
        quantity: newQuantity
      }).subscribe({
        next: (updatedCart) => {
          this.cart.set(updatedCart);
        },
        error: () => {
          this.toastService.error('Cart update failed', 'The quantity could not be updated. Please try again.');
        }
      });
    } else {
      this.updateLocalQuantity(menuItemId, newQuantity);
    }
  }

  private updateLocalQuantity(menuItemId: string, newQuantity: number): void {
    const current = this.cart();
    if (!current) return;

    const updatedItems = current.items.map(item => {
      if (item.menuItemId === menuItemId) {
        return {
          ...item,
          quantity: newQuantity,
          subtotal: Math.round(newQuantity * item.unitPrice * 100) / 100
        };
      }
      return item;
    });

    const subtotal = updatedItems.reduce((acc, curr) => acc + curr.subtotal, 0);

    this.cart.set({
      ...current,
      items: updatedItems,
      totalAmount: subtotal
    });
  }

  removeItem(menuItemId: string): void {
    if (this.authService.isAuthenticated()) {
      this.http.delete<Cart>(`${this.baseUrl}/items/${menuItemId}`).subscribe({
        next: (updatedCart) => {
          this.cart.set(updatedCart.items.length ? updatedCart : null);
          this.toastService.info('Item Removed', 'Item removed from your cart.');
        },
        error: () => {
          this.toastService.error('Cart update failed', 'The item could not be removed. Please try again.');
        }
      });
    } else {
      this.removeLocalItem(menuItemId);
    }
  }

  private removeLocalItem(menuItemId: string): void {
    const current = this.cart();
    if (!current) return;

    const updatedItems = current.items.filter(item => item.menuItemId !== menuItemId);
    if (updatedItems.length === 0) {
      this.cart.set(null);
      this.appliedCoupon.set(null);
      this.discountAmount.set(0);
    } else {
      const subtotal = updatedItems.reduce((acc, curr) => acc + curr.subtotal, 0);
      this.cart.set({
        ...current,
        items: updatedItems,
        totalAmount: subtotal
      });
    }
    this.toastService.info('Item Removed', 'Item removed from your cart.');
  }

  clearCart(): Observable<void> {
    this.cart.set(null);
    this.appliedCoupon.set(null);
    this.discountAmount.set(0);

    if (this.authService.isAuthenticated()) {
      return this.http.delete<void>(this.baseUrl).pipe(tap(() => this.cart.set(null)));
    }
    return of(undefined);
  }

  applyDiscount(code: string, discount: number): void {
    this.appliedCoupon.set(code);
    this.discountAmount.set(discount);
    this.toastService.success('Coupon Applied', `Code ${code} saved you $${discount.toFixed(2)}!`);
  }

  removeDiscount(): void {
    this.appliedCoupon.set(null);
    this.discountAmount.set(0);
  }

  checkoutCart(data: {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    paymentMethod: PaymentMethod;
    couponCode?: string;
    scheduledAt?: string;
  }): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/checkout`, data);
  }

  private getStoredCart(): Cart | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Cart;
    } catch {
      return null;
    }
  }
}
