import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CustomerService } from '../../../core/services/customer.service';
import { Address, AddressRequest, Notification, Restaurant } from '../../../core/models';
import { ToastService } from '../../../core/services/toast.service';
import { fadeAnimation } from '../../../shared/animations/animations';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  animations: [fadeAnimation],
  template: `
    <div @fadeAnimation class="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 class="text-2xl font-bold">Account & preferences</h1>
        <p class="text-sm text-slate-400 mt-0.5">Manage your profile, delivery addresses, favorites, and notifications.</p>
      </div>

      <section class="dash-card p-5 sm:p-6">
        <h2 class="font-semibold mb-4">Profile</h2>
        <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="grid sm:grid-cols-2 gap-4">
          <label class="text-sm">Full name<input formControlName="fullName" class="field"></label>
          <label class="text-sm">Phone<input formControlName="phone" class="field" placeholder="+123456789"></label>
          <p class="text-sm text-slate-500 sm:col-span-2">Email: {{ authService.currentUser()?.email }}</p>
          <button class="button-primary sm:col-span-2 w-fit" [disabled]="profileForm.invalid || savingProfile()">Save profile</button>
        </form>
      </section>

      <section class="dash-card p-5 sm:p-6">
        <div class="flex items-center justify-between gap-3 mb-4">
          <div><h2 class="font-semibold">Saved addresses</h2><p class="text-xs text-slate-500">Choose a saved address faster at checkout.</p></div>
          <button type="button" class="button-secondary" (click)="showAddressForm.set(!showAddressForm())">{{ showAddressForm() ? 'Cancel' : 'Add address' }}</button>
        </div>
        @if (showAddressForm()) {
          <form [formGroup]="addressForm" (ngSubmit)="saveAddress()" class="grid sm:grid-cols-2 gap-3 mb-5">
            <input formControlName="label" placeholder="Label (Home)" class="field">
            <input formControlName="street" placeholder="Street address" class="field">
            <input formControlName="city" placeholder="City" class="field">
            <input formControlName="postalCode" placeholder="Postal code" class="field">
            <label class="flex items-center gap-2 text-sm"><input type="checkbox" formControlName="isDefault"> Default address</label>
            <button class="button-primary w-fit" [disabled]="addressForm.invalid">Save address</button>
          </form>
        }
        <div class="grid md:grid-cols-2 gap-3">
          @for (address of addresses(); track address.id) {
            <div class="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <div class="flex justify-between gap-3"><p class="font-semibold">{{ address.label }}</p><span *ngIf="address.isDefault" class="text-xs text-primary font-semibold">Default</span></div>
              <p class="text-sm text-slate-500 mt-1">{{ address.street }}, {{ address.city }} {{ address.postalCode }}</p>
              <button type="button" class="text-xs text-red-600 font-semibold mt-3" (click)="deleteAddress(address.id)">Remove</button>
            </div>
          } @empty { <p class="text-sm text-slate-500">No saved addresses yet.</p> }
        </div>
      </section>

      <section class="dash-card p-5 sm:p-6">
        <h2 class="font-semibold mb-4">Favorite restaurants</h2>
        <div class="grid sm:grid-cols-2 gap-3">
          @for (restaurant of favorites(); track restaurant.id) {
            <a [routerLink]="['/restaurants', restaurant.id]" class="rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:border-primary/50 transition-colors">
              <p class="font-semibold">{{ restaurant.name }}</p><p class="text-sm text-slate-500">{{ restaurant.cuisineType }} · {{ restaurant.address }}</p>
            </a>
          } @empty { <p class="text-sm text-slate-500">You have no favorite restaurants.</p> }
        </div>
      </section>

      <section class="dash-card p-5 sm:p-6">
        <div class="flex items-center justify-between mb-4"><h2 class="font-semibold">Notifications</h2><span class="text-xs text-primary font-semibold">{{ unreadNotifications() }} unread</span></div>
        <div class="divide-y divide-slate-100 dark:divide-slate-800">
          @for (notification of notifications(); track notification.id) {
            <button type="button" (click)="readNotification(notification)" class="w-full text-left py-3" [class.opacity-60]="notification.read">
              <p class="font-semibold text-sm">{{ notification.title }}</p><p class="text-sm text-slate-500">{{ notification.message }}</p>
            </button>
          } @empty { <p class="text-sm text-slate-500">No notifications.</p> }
        </div>
      </section>

      <button (click)="authService.logout()" class="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl">Sign out</button>
    </div>
  `,
  styles: [`
    .field { display:block; width:100%; margin-top:.35rem; padding:.65rem .75rem; border:1px solid rgb(226 232 240); border-radius:.75rem; background:transparent; }
    .button-primary { padding:.65rem 1rem; border-radius:.75rem; background:#ff6b35; color:white; font-size:.875rem; font-weight:600; }
    .button-secondary { padding:.6rem .85rem; border-radius:.75rem; border:1px solid rgb(226 232 240); font-size:.875rem; font-weight:600; }
    button:disabled { opacity:.5; cursor:not-allowed; }
  `]
})
export class CustomerProfileComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly customerService = inject(CustomerService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(NonNullableFormBuilder);
  readonly addresses = signal<Address[]>([]);
  readonly favorites = signal<Restaurant[]>([]);
  readonly notifications = signal<Notification[]>([]);
  readonly showAddressForm = signal(false);
  readonly savingProfile = signal(false);
  readonly profileForm = this.fb.group({
    fullName: [this.authService.currentUser()?.fullName ?? '', [Validators.required]],
    phone: [this.authService.currentUser()?.phone ?? '']
  });
  readonly addressForm = this.fb.group({
    label: ['Home', [Validators.required]],
    street: ['', [Validators.required]],
    city: ['', [Validators.required]],
    postalCode: ['', [Validators.required]],
    isDefault: [false]
  });

  unreadNotifications(): number { return this.notifications().filter(item => !item.read).length; }

  ngOnInit(): void {
    this.customerService.getAddresses().subscribe(data => this.addresses.set(data));
    this.customerService.getFavorites().subscribe(data => this.favorites.set(data));
    this.customerService.getNotifications().subscribe(data => this.notifications.set(data));
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.savingProfile.set(true);
    this.customerService.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: user => { this.authService.updateCurrentUser(user); this.toast.success('Profile saved', 'Your profile was updated.'); this.savingProfile.set(false); },
      error: () => { this.toast.error('Profile update failed', 'Please try again.'); this.savingProfile.set(false); }
    });
  }

  saveAddress(): void {
    if (this.addressForm.invalid) return;
    this.customerService.addAddress(this.addressForm.getRawValue() as AddressRequest).subscribe({
      next: address => { this.addresses.update(items => [...items, address]); this.addressForm.reset({ label: 'Home', street: '', city: '', postalCode: '', isDefault: false }); this.showAddressForm.set(false); },
      error: () => this.toast.error('Address failed', 'Could not save this address.')
    });
  }

  deleteAddress(id: string): void {
    this.customerService.deleteAddress(id).subscribe({
      next: () => this.addresses.update(items => items.filter(item => item.id !== id)),
      error: () => this.toast.error('Address failed', 'Could not remove this address.')
    });
  }

  readNotification(notification: Notification): void {
    if (notification.read) return;
    this.customerService.markNotificationRead(notification.id).subscribe({
      next: () => this.notifications.update(items => items.map(item => item.id === notification.id ? { ...item, read: true } : item))
    });
  }
}
