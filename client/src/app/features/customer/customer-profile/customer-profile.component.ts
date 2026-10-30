import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { DashboardLayoutComponent } from '../../../shared/components/dashboard-layout/dashboard-layout.component';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { fadeAnimation } from '../../../shared/animations/animations';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DashboardLayoutComponent],
  animations: [fadeAnimation],
  template: `
    <app-dashboard-layout>
      <div @fadeAnimation class="p-6 max-w-2xl mx-auto space-y-6">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-800 dark:text-white">My Profile</h1>
          <p class="text-sm text-slate-400 mt-0.5">Manage your personal information and preferences</p>
        </div>

        <!-- Avatar card -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 flex items-center gap-5">
          <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg">
            {{ getInitials() }}
          </div>
          <div>
            <h2 class="text-xl font-extrabold text-slate-800 dark:text-white">{{ authService.currentUser()?.fullName }}</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ authService.currentUser()?.email }}</p>
            <span class="inline-block mt-2 px-3 py-0.5 text-xs font-bold rounded-full bg-primary/10 text-primary">
              {{ authService.userRole() }}
            </span>
          </div>
        </div>

        <!-- Edit Profile Form -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
          <h3 class="font-extrabold text-slate-800 dark:text-white mb-5">Account Information</h3>
          <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
              <input formControlName="fullName" type="text"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all">
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
              <input formControlName="email" type="email" readonly
                class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-slate-400 cursor-not-allowed">
              <p class="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
              <input formControlName="phone" type="tel" placeholder="+1 555 000 0000"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all">
            </div>
            <button type="submit" [disabled]="isSaving()"
              class="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all disabled:opacity-60 flex items-center gap-2">
              @if (isSaving()) {
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
              }
              Save Changes
            </button>
          </form>
        </div>

        <!-- Danger Zone -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm p-6">
          <h3 class="font-extrabold text-red-600 dark:text-red-400 mb-2">Sign Out</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">Sign out of your FoodRush account on this device.</p>
          <button (click)="authService.logout()"
            class="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors">
            Sign Out
          </button>
        </div>
      </div>
    </app-dashboard-layout>
  `
})
export class CustomerProfileComponent {
  readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly isSaving = signal(false);

  getInitials(): string {
    const name = this.authService.currentUser()?.fullName ?? 'U';
    return name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
  }

  readonly profileForm = this.fb.group({
    fullName: [this.authService.currentUser()?.fullName ?? '', [Validators.required, Validators.minLength(2)]],
    email:    [{ value: this.authService.currentUser()?.email ?? '', disabled: true }],
    phone:    ['']
  });

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.isSaving.set(true);
    // Simulated save — wire to PATCH /api/users/me when backend endpoint is ready
    setTimeout(() => {
      this.isSaving.set(false);
      this.toast.success('Profile Updated', 'Your information has been saved.');
    }, 800);
  }
}
