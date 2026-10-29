import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { fadeAnimation } from '../../../shared/animations/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  animations: [fadeAnimation],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4 py-12">
      <div @fadeAnimation class="w-full max-w-md">
        <!-- Card -->
        <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-8">
          <!-- Header -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-orange-400 rounded-2xl shadow-lg mb-4">
              <span class="text-3xl">🍔</span>
            </div>
            <h1 class="text-3xl font-extrabold text-slate-800 dark:text-white">Welcome back</h1>
            <p class="text-slate-500 dark:text-slate-400 mt-2 text-sm">Sign in to your FoodRush account</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- Email -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
              <input
                formControlName="email"
                type="email"
                autocomplete="email"
                placeholder="you@example.com"
                class="w-full px-4 py-3 rounded-xl border text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                [class]="isInvalid('email') ? 'border-red-400 dark:border-red-600' : 'border-slate-200 dark:border-slate-700'">
              @if (isInvalid('email')) {
                <p class="mt-1 text-xs text-red-500">Please enter a valid email address.</p>
              }
            </div>

            <!-- Password -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <div class="relative">
                <input
                  formControlName="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="••••••••"
                  class="w-full px-4 py-3 pr-12 rounded-xl border text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  [class]="isInvalid('password') ? 'border-red-400 dark:border-red-600' : 'border-slate-200 dark:border-slate-700'">
                <button type="button" (click)="togglePassword()"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1">
                  @if (showPassword()) {
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  } @else {
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                  }
                </button>
              </div>
              @if (isInvalid('password')) {
                <p class="mt-1 text-xs text-red-500">Password is required.</p>
              }
            </div>

            <!-- Submit -->
            <button
              type="submit"
              [disabled]="isLoading()"
              class="w-full py-3.5 mt-2 bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2">
              @if (isLoading()) {
                <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              } @else {
                Sign In
              }
            </button>
          </form>

          <div class="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?
            <a routerLink="/register" class="text-primary font-semibold hover:underline ml-1">Sign up free</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);

  readonly showPassword = signal(false);
  readonly isLoading = signal(false);

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(1)]]
  });

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  isInvalid(field: string): boolean {
    const ctrl = this.loginForm.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  onSubmit(): void {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid || this.isLoading()) return;

    this.isLoading.set(true);
    const { email, password } = this.loginForm.getRawValue();

    this.authService.login({ email, password }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.toastService.success('Welcome back!', `Signed in as ${res.user.fullName}`);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err?.error?.message || 'Invalid email or password.';
        this.toastService.error('Sign In Failed', msg);
      }
    });
  }
}
