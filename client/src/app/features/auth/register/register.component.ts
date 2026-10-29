import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Role } from '../../../core/models';
import { fadeAnimation } from '../../../shared/animations/animations';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  animations: [fadeAnimation],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4 py-12">
      <div @fadeAnimation class="w-full max-w-md">
        <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-8">
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-orange-400 rounded-2xl shadow-lg mb-4">
              <span class="text-3xl">🍕</span>
            </div>
            <h1 class="text-3xl font-extrabold text-slate-800 dark:text-white">Create Account</h1>
            <p class="text-slate-500 dark:text-slate-400 mt-2 text-sm">Join FoodRush and start ordering</p>
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- Full Name -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
              <input formControlName="fullName" type="text" placeholder="John Doe" autocomplete="name"
                class="w-full px-4 py-3 rounded-xl border text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                [class]="isInvalid('fullName') ? 'border-red-400 dark:border-red-600' : 'border-slate-200 dark:border-slate-700'">
              @if (isInvalid('fullName')) {
                <p class="mt-1 text-xs text-red-500">Full name must be at least 2 characters.</p>
              }
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
              <input formControlName="email" type="email" placeholder="you@example.com" autocomplete="email"
                class="w-full px-4 py-3 rounded-xl border text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                [class]="isInvalid('email') ? 'border-red-400 dark:border-red-600' : 'border-slate-200 dark:border-slate-700'">
              @if (isInvalid('email')) {
                <p class="mt-1 text-xs text-red-500">Please enter a valid email address.</p>
              }
            </div>

            <!-- Password -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <input formControlName="password" type="password" placeholder="Min 6 characters" autocomplete="new-password"
                class="w-full px-4 py-3 rounded-xl border text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                [class]="isInvalid('password') ? 'border-red-400 dark:border-red-600' : 'border-slate-200 dark:border-slate-700'">
              @if (isInvalid('password')) {
                <p class="mt-1 text-xs text-red-500">Password must be at least 6 characters.</p>
              }
            </div>

            <!-- Role -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">I am a...</label>
              <select formControlName="role"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary">
                <option value="CUSTOMER">🛒 Customer — order food</option>
                <option value="RESTAURANT_OWNER">🍽️ Restaurant Owner</option>
                <option value="DELIVERY_DRIVER">🛵 Delivery Driver</option>
              </select>
            </div>

            <button type="submit" [disabled]="isLoading()"
              class="w-full py-3.5 mt-2 bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2">
              @if (isLoading()) {
                <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              } @else {
                Create Account
              }
            </button>
          </form>

          <div class="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?
            <a routerLink="/login" class="text-primary font-semibold hover:underline ml-1">Sign in</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  readonly isLoading = signal(false);

  readonly registerForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: [Role.CUSTOMER, [Validators.required]]
  });

  isInvalid(field: string): boolean {
    const ctrl = this.registerForm.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  onSubmit(): void {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid || this.isLoading()) return;

    this.isLoading.set(true);
    const { fullName, email, password, role } = this.registerForm.getRawValue();

    this.authService.register({ fullName, email, password, role }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.toastService.success('Account created!', `Welcome to FoodRush, ${res.user.fullName}!`);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err?.error?.message || 'Registration failed. Please try again.';
        this.toastService.error('Registration Failed', msg);
      }
    });
  }
}
